// Embedding + chunking primitives for Shokhi's RAG. Kept separate from rag.ts (which
// imports the built corpus.json) so the ingest script can use them before the corpus
// exists. All TypeScript — no Python.
//
//   * "gemini" -> Google `text-embedding-004` (same GOOGLE_API_KEY as Gemma; embeddings
//                 are non-generative, so this is a rules-allowed supporting technique).
//   * "mock"   -> deterministic lexical hashing, so retrieval works offline with no key.

export type Embedder = "gemini" | "mock";

const EMBED_DIM = 256;
export const EMBED_MODEL = "text-embedding-004";

// FNV-1a hash -> bucket index.
function bucket(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % EMBED_DIM;
}

function l2normalize(v: number[]): number[] {
  let n = 0;
  for (const x of v) n += x * x;
  n = Math.sqrt(n) || 1;
  return v.map((x) => x / n);
}

/** Deterministic offline embedding: word buckets + char trigrams (crude lexical match). */
export function mockEmbed(text: string): number[] {
  const v = new Array(EMBED_DIM).fill(0);
  const tokens = text.toLowerCase().normalize("NFC").split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  for (const tok of tokens) {
    v[bucket(tok)] += 1;
    for (let i = 0; i < tok.length - 2; i++) v[bucket(tok.slice(i, i + 3))] += 0.5;
  }
  return l2normalize(v);
}

function embedKey(): string | undefined {
  return (
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY_2 ||
    process.env.GEMINI_API_KEY_2
  )?.trim();
}

/** Which embedder is available in this environment (gemini if a key is set, else mock). */
export function activeEmbedder(): Embedder {
  return embedKey() ? "gemini" : "mock";
}

/** Embed with Google's text-embedding-004 (non-generative). Throws if no key. */
export async function geminiEmbed(text: string): Promise<number[]> {
  const key = embedKey();
  if (!key) throw new Error("No GOOGLE_API_KEY for embeddings.");
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: key });
  const resp: any = await ai.models.embedContent({ model: EMBED_MODEL, contents: text });
  const values: number[] | undefined = resp?.embeddings?.[0]?.values ?? resp?.embedding?.values;
  if (!values?.length) throw new Error("Empty embedding response.");
  return values;
}

/** Embed one piece of text with the given embedder. */
export async function embed(text: string, embedder: Embedder): Promise<number[]> {
  return embedder === "gemini" ? geminiEmbed(text) : mockEmbed(text);
}

/** Split a document into ~word-bounded chunks along blank lines / headings. */
export function chunkText(body: string, targetWords = 130): string[] {
  const blocks = body
    .split(/\n\s*\n/)
    .map((b) => b.replace(/^#+\s*/gm, "").trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let cur: string[] = [];
  let count = 0;
  for (const b of blocks) {
    const w = b.split(/\s+/).length;
    if (count && count + w > targetWords) {
      chunks.push(cur.join("\n\n"));
      cur = [];
      count = 0;
    }
    cur.push(b);
    count += w;
  }
  if (cur.length) chunks.push(cur.join("\n\n"));
  return chunks;
}
