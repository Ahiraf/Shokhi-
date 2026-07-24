// Retrieval layer for Shokhi's RAG feature — 100% TypeScript, no Python.
//
// RAG = Retrieval-Augmented Generation: before Gemma answers, we RETRIEVE the most
// relevant passages from a corpus of trusted, cited health documents and hand them to
// Gemma as context. Embeddings + cosine search are non-generative (rules-allowed);
// Gemma stays the ONLY LLM that generates the answer.
//
// The query is embedded with the SAME embedder the corpus was built with (stored in
// corpus.json) so the vectors are comparable. If a google-embedded corpus is served without
// a key, retrieval falls back to keyword overlap so the feature degrades gracefully.
//
// SCALING: vectors are pre-normalized into a Float32 matrix once at load, so a query is a
// tight dot-product scan (cosine == dot for unit vectors). This is exact and fast for a few
// thousand chunks. The search sits behind the `VectorStore` interface below, so a hosted ANN
// index (Pinecone/Qdrant) or a local one (hnswlib) can be dropped in without touching callers
// once the corpus outgrows an in-memory scan.

import corpusJson from "./rag/corpus.json";
import { embed, type Embedder } from "./rag-embed";

export type Chunk = {
  id: string;
  text: string;
  title: string;
  source: string;
  url: string;
  section?: string;
  topic?: string;
  pub_year?: string;
  page?: string;
  embedding: number[];
};

type Corpus = { embedder: Embedder; model: string; dim: number; chunks: Chunk[] };

export type Retrieved = {
  text: string;
  title: string;
  source: string;
  url: string;
  section?: string;
  topic?: string;
  pub_year?: string;
  page?: string;
  score: number;
};

export interface RetrieveOptions {
  /** Minimum cosine similarity to count as grounding (guards against false grounding). */
  minScore?: number;
  /** Topic to gently prefer (e.g. the user's life-stage/triage topic). Ordering only. */
  boostTopic?: string;
}

const corpus = corpusJson as unknown as Corpus;

// --- pre-normalized in-memory vector store -----------------------------------
function normalize(v: number[]): Float32Array {
  const out = new Float32Array(v.length);
  let n = 0;
  for (let i = 0; i < v.length; i++) n += v[i] * v[i];
  n = Math.sqrt(n) || 1;
  for (let i = 0; i < v.length; i++) out[i] = v[i] / n;
  return out;
}

// Built once at module load — the O(n) cost is paid a single time, not per query.
const NORMS: Float32Array[] = (corpus.chunks ?? []).map((c) => normalize(c.embedding));

function dot(a: Float32Array, b: number[]): number {
  const n = Math.min(a.length, b.length);
  let d = 0;
  for (let i = 0; i < n; i++) d += a[i] * b[i];
  return d;
}

/** Keyword-overlap fallback when a semantic corpus is served without an embedding key. */
function keywordScore(query: string, chunk: Chunk): number {
  const q = new Set(query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2));
  if (!q.size) return 0;
  let hits = 0;
  for (const w of chunk.text.toLowerCase().split(/[^\p{L}\p{N}]+/u)) if (q.has(w)) hits++;
  return hits / q.size;
}

export function corpusInfo() {
  return {
    embedder: corpus.embedder,
    model: corpus.model,
    chunks: corpus.chunks?.length ?? 0,
    topics: Array.from(new Set((corpus.chunks ?? []).map((c) => c.topic).filter(Boolean))),
  };
}

/**
 * Retrieve the top-k most relevant chunks for a query. Returns [] if the corpus is
 * empty or nothing clears `minScore`. Never throws.
 *
 * `boostTopic` only re-orders chunks that already clear the score threshold — it can never
 * push an irrelevant chunk over the bar, so "no false grounding" still holds.
 */
export async function retrieve(query: string, k = 4, opts: RetrieveOptions = {}): Promise<Retrieved[]> {
  const { minScore = 0.15, boostTopic } = opts;
  const chunks = corpus.chunks ?? [];
  if (!chunks.length || !query.trim()) return [];

  let base: number[];
  try {
    const qv = normalize(await embed(query, corpus.embedder));
    base = NORMS.map((cv) => dot(cv, Array.from(qv)));
  } catch {
    base = chunks.map((c) => keywordScore(query, c));
  }

  const TOPIC_BOOST = 0.05; // small nudge; ordering only
  return chunks
    .map((c, i) => ({ c, score: base[i] }))
    .filter((s) => s.score >= minScore)
    .map((s) => ({
      ...s,
      ranked: boostTopic && s.c.topic === boostTopic ? s.score + TOPIC_BOOST : s.score,
    }))
    .sort((a, b) => b.ranked - a.ranked)
    .slice(0, k)
    .map(({ c, score }) => ({
      text: c.text,
      title: c.title,
      source: c.source,
      url: c.url,
      section: c.section || undefined,
      topic: c.topic || undefined,
      pub_year: c.pub_year || undefined,
      page: c.page || undefined,
      score: Math.round(score * 1000) / 1000,
    }));
}
