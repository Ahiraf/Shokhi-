// Embedding + chunking primitives for Shokhi's RAG. Kept separate from rag.ts (which
// imports the built corpus.json) so the ingest script can use them before the corpus
// exists. All TypeScript — no Python.
//
//   * "google" -> Google's `gemini-embedding-001` EMBEDDING model (same GOOGLE_API_KEY as
//                 Gemma). NOTE: this is an *embedding* model, not the Gemini chat LLM — it
//                 only turns text into vectors and generates NO text, so it is a
//                 rules-allowed non-generative supporting technique. Gemma 4 stays the only
//                 LLM that generates answers.
//   * "bge-m3" -> BAAI/bge-m3 run locally via transformers.js (@xenova/transformers). Same
//                 multilingual model Maya uses, but in-process TypeScript — no Python. Optional
//                 dependency: only loaded when selected (for the embedder benchmark). Also
//                 non-generative.
//   * "mock"   -> deterministic lexical hashing, so retrieval works offline with no key.

export type Embedder = "google" | "bge-m3" | "mock";

export const BGE_MODEL = "Xenova/bge-m3";

const EMBED_DIM = 256;
export const EMBED_MODEL = "gemini-embedding-001";
const EMBED_OUTPUT_DIM = 768; // keep vectors compact; cosine handles normalization

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

/** Which embedder is available in this environment (google if a key is set, else mock). */
export function activeEmbedder(): Embedder {
  return embedKey() ? "google" : "mock";
}

/** Embed with Google's gemini-embedding-001 EMBEDDING model (non-generative). Throws if no key. */
export async function googleEmbed(text: string): Promise<number[]> {
  const key = embedKey();
  if (!key) throw new Error("No GOOGLE_API_KEY for embeddings.");
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: key });
  const resp: any = await ai.models.embedContent({
    model: EMBED_MODEL,
    contents: text,
    config: { outputDimensionality: EMBED_OUTPUT_DIM },
  });
  const values: number[] | undefined = resp?.embeddings?.[0]?.values ?? resp?.embedding?.values;
  if (!values?.length) throw new Error("Empty embedding response.");
  return values;
}

// --- bge-m3 via transformers.js (optional, non-generative) --------------------
// Lazily import @xenova/transformers so the app never pays for it unless bge-m3 is
// actually selected (the embedder benchmark, or a corpus re-ingested with EMBEDDER=bge-m3).
let bgePipe: Promise<any> | null = null;
async function bgePipeline() {
  if (!bgePipe) {
    let transformers: any;
    try {
      // Non-literal specifier + webpackIgnore keeps this a runtime-only, OPTIONAL dependency:
      // the Next.js bundle never tries to resolve it (the app never selects bge-m3), and the
      // eval script (run via tsx) imports it live only when EMBEDDER=bge-m3.
      const spec = ["@xenova", "transformers"].join("/");
      transformers = await import(/* webpackIgnore: true */ spec);
    } catch {
      throw new Error(
        "bge-m3 needs the optional dependency '@xenova/transformers'. Install it with: npm i @xenova/transformers",
      );
    }
    bgePipe = transformers.pipeline("feature-extraction", BGE_MODEL);
  }
  return bgePipe;
}

/** Embed with BAAI/bge-m3 locally (mean-pooled, normalized). Throws if the dep is missing. */
export async function bgeEmbed(text: string): Promise<number[]> {
  const pipe = await bgePipeline();
  const out = await pipe(text, { pooling: "mean", normalize: true });
  return Array.from(out.data as Float32Array);
}

/** Embed one piece of text with the given embedder. */
export async function embed(text: string, embedder: Embedder): Promise<number[]> {
  if (embedder === "google") return googleEmbed(text);
  if (embedder === "bge-m3") return bgeEmbed(text);
  return mockEmbed(text);
}

/** Split a document into ~word-bounded chunks along blank lines / headings. */
export function chunkText(body: string, targetWords = 130): string[] {
  return chunkWithHeadings(body, targetWords).map((c) => c.text);
}

export type Section = { text: string; section: string };

/**
 * Like chunkText, but tracks the nearest Markdown heading (`#`, `##`, …) above each
 * chunk and returns it as `section` — so every citation can name the exact section it
 * came from (e.g. "PCOS › Common signs"), the way Maya cites section_title.
 */
export function chunkWithHeadings(body: string, targetWords = 130): Section[] {
  const rawBlocks = body.split(/\n\s*\n/);
  const chunks: Section[] = [];
  let cur: string[] = [];
  let count = 0;
  let curHeading = "";
  let chunkHeading = "";

  const flush = () => {
    if (cur.length) {
      chunks.push({ text: cur.join("\n\n"), section: chunkHeading });
      cur = [];
      count = 0;
    }
  };

  for (const raw of rawBlocks) {
    const headingMatch = raw.match(/^#+\s*(.+?)\s*$/m);
    const block = raw.replace(/^#+\s*/gm, "").trim();
    if (!block) continue;
    // a block that is only a heading updates the current section without adding words
    if (headingMatch && /^#+\s/.test(raw.trim()) && raw.trim().split("\n").length === 1) {
      curHeading = headingMatch[1].trim();
      continue;
    }
    const w = block.split(/\s+/).length;
    if (count && count + w > targetWords) flush();
    if (!cur.length) chunkHeading = curHeading; // section = heading in force when chunk started
    cur.push(block);
    count += w;
  }
  flush();
  return chunks;
}
