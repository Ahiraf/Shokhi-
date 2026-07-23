// Build the RAG corpus: read lib/server/rag/sources/*.md, chunk each document, embed
// every chunk, and write lib/server/rag/corpus.json.  Run with:  npm run ingest
//
// Embedder is chosen automatically: Google gemini-embedding-001 if GOOGLE_API_KEY is set,
// otherwise the offline mock embedder (so a fresh clone works with no key). Re-run this
// (with the key set) and commit corpus.json to get real semantic retrieval on Vercel.
//
// 100% TypeScript — no Python anywhere in the pipeline.

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { loadEnvConfig } from "@next/env";
import { embed, chunkText, activeEmbedder, EMBED_MODEL } from "../lib/server/rag-embed";

// Load .env.local (the same file the app uses) so GOOGLE_API_KEY is picked up
// automatically — no need to pass it inline on the command.
loadEnvConfig(process.cwd());

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCES_DIR = join(__dirname, "../lib/server/rag/sources");
const OUT = join(__dirname, "../lib/server/rag/corpus.json");

type Meta = { title: string; source: string; url: string; lang: string };

/** Parse a very small `--- key: value ---` frontmatter header. */
function parseDoc(raw: string): { meta: Meta; body: string } {
  const m = raw.match(/^---\s*([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  const meta: Meta = { title: "", source: "", url: "", lang: "en" };
  if (!m) return { meta, body: raw };
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) (meta as any)[kv[1]] = kv[2].trim();
  }
  return { meta, body: m[2] };
}

async function main() {
  const embedder = activeEmbedder();
  console.log(`[ingest] embedder = ${embedder}${embedder === "gemini" ? ` (${EMBED_MODEL})` : " (offline)"}`);

  const files = readdirSync(SOURCES_DIR).filter((f) => f.endsWith(".md"));
  const chunks: any[] = [];
  let dim = 0;

  for (const file of files) {
    const { meta, body } = parseDoc(readFileSync(join(SOURCES_DIR, file), "utf-8"));
    const pieces = chunkText(body);
    console.log(`[ingest] ${file}: ${pieces.length} chunks`);
    for (let i = 0; i < pieces.length; i++) {
      const text = pieces[i];
      const embedding = await embed(`${meta.title}\n${text}`, embedder);
      dim = embedding.length;
      chunks.push({
        id: `${file.replace(/\.md$/, "")}-${i}`,
        text,
        title: meta.title,
        source: meta.source,
        url: meta.url,
        embedding,
      });
    }
  }

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ embedder, model: embedder === "gemini" ? EMBED_MODEL : "mock-lexical-256", dim, chunks }, null, 0));
  console.log(`[ingest] wrote ${chunks.length} chunks (dim ${dim}) -> ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
