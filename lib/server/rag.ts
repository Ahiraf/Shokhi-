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

import corpusJson from "./rag/corpus.json";
import { embed, type Embedder } from "./rag-embed";

export type Chunk = {
  id: string;
  text: string;
  title: string;
  source: string;
  url: string;
  embedding: number[];
};

type Corpus = { embedder: Embedder; model: string; dim: number; chunks: Chunk[] };

export type Retrieved = { text: string; title: string; source: string; url: string; score: number };

const corpus = corpusJson as unknown as Corpus;

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

// Keyword-overlap fallback when a google-embedded corpus is served without a key.
function keywordScore(query: string, chunk: Chunk): number {
  const q = new Set(query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2));
  if (!q.size) return 0;
  let hits = 0;
  for (const w of chunk.text.toLowerCase().split(/[^\p{L}\p{N}]+/u)) if (q.has(w)) hits++;
  return hits / q.size;
}

export function corpusInfo() {
  return { embedder: corpus.embedder, model: corpus.model, chunks: corpus.chunks?.length ?? 0 };
}

/**
 * Retrieve the top-k most relevant chunks for a query. Returns [] if the corpus is
 * empty or nothing clears `minScore`. Never throws.
 */
export async function retrieve(query: string, k = 4, minScore = 0.15): Promise<Retrieved[]> {
  if (!corpus.chunks?.length || !query.trim()) return [];

  let scored: { c: Chunk; score: number }[];
  try {
    const qv = await embed(query, corpus.embedder);
    scored = corpus.chunks.map((c) => ({ c, score: cosine(qv, c.embedding) }));
  } catch {
    scored = corpus.chunks.map((c) => ({ c, score: keywordScore(query, c) }));
  }

  return scored
    .filter((s) => s.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(({ c, score }) => ({
      text: c.text,
      title: c.title,
      source: c.source,
      url: c.url,
      score: Math.round(score * 1000) / 1000,
    }));
}
