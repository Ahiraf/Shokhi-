// Embedder benchmark for Shokhi's RAG — compares retrieval quality of different embedders
// on a labelled set of Bangla-first health queries, WITHOUT overwriting the live corpus.
//
//   EMBEDDER=google  npx tsx scripts/eval-embedders.ts   # gemini-embedding-001 (needs key)
//   EMBEDDER=bge-m3  npx tsx scripts/eval-embedders.ts   # BAAI/bge-m3 via transformers.js
//   EMBEDDER=mock    npx tsx scripts/eval-embedders.ts   # offline lexical baseline
//
// It embeds the corpus in memory with the chosen embedder, runs each labelled query, and
// reports Precision@k and MRR against the expected topic. Use it to decide whether a
// multilingual embedder (bge-m3) beats gemini-embedding-001 on Bangla — the "#7" question.
// 100% TypeScript — no Python.

import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { loadEnvConfig } from "@next/env";
import { embed, chunkWithHeadings, activeEmbedder, type Embedder } from "../lib/server/rag-embed";

loadEnvConfig(process.cwd());

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCES_DIR = join(__dirname, "../lib/server/rag/sources");

function inferTopic(file: string): string {
  const f = file.toLowerCase();
  if (f.includes("pcos")) return "pcos";
  if (f.includes("endometrio")) return "endometriosis";
  if (f.includes("menstrual")) return "menstruation";
  if (f.includes("menopause")) return "menopause";
  if (f.includes("contracept") || f.includes("family_planning") || f.includes("menstrual_regulation")) return "contraception";
  if (f.includes("antenatal") || f.includes("pregnan") || f.includes("maternal") || f.includes("newborn")) return "pregnancy";
  if (f.includes("hiv")) return "infection";
  return "general";
}

// Labelled Bangla-first queries → the topic a correct passage should belong to.
const QUERIES: { q: string; topic: string }[] = [
  { q: "আমার মাসিক অনিয়মিত আর মুখে লোম বাড়ছে", topic: "pcos" },
  { q: "PCOS হলে কী করা উচিত?", topic: "pcos" },
  { q: "মেনোপজের সময় হঠাৎ শরীর গরম হয়ে যায় কেন?", topic: "menopause" },
  { q: "hot flashes during menopause", topic: "menopause" },
  { q: "গর্ভাবস্থায় কতবার চেকআপ করা দরকার?", topic: "pregnancy" },
  { q: "antenatal care schedule", topic: "pregnancy" },
  { q: "জন্মনিয়ন্ত্রণের কোন পদ্ধতি নিরাপদ?", topic: "contraception" },
  { q: "মাসিকের সময় পরিচ্ছন্নতা কীভাবে রাখব?", topic: "menstruation" },
  { q: "endometriosis pelvic pain", topic: "endometriosis" },
];

type Vec = { topic: string; source: string; embedding: number[] };

function cosine(a: number[], b: number[]): number {
  let d = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) { d += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return d / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

async function main() {
  const embedder: Embedder = (process.env.EMBEDDER as Embedder) || activeEmbedder();
  const K = 5;
  console.log(`\n[eval] embedder = ${embedder}   (top-k = ${K}, ${QUERIES.length} queries)\n`);

  // Build the in-memory corpus.
  const files = readdirSync(SOURCES_DIR).filter((f) => f.endsWith(".md"));
  const vecs: Vec[] = [];
  for (const file of files) {
    const raw = readFileSync(join(SOURCES_DIR, file), "utf-8");
    const body = raw.replace(/^---[\s\S]*?\n---\s*\n/, "");
    const topic = inferTopic(file);
    const titleMatch = raw.match(/title:\s*(.*)/);
    const title = titleMatch ? titleMatch[1].trim() : file;
    for (const { text } of chunkWithHeadings(body)) {
      vecs.push({ topic, source: file, embedding: await embed(`${title}\n${text}`, embedder) });
    }
  }
  console.log(`[eval] embedded ${vecs.length} chunks from ${files.length} docs\n`);

  let sumP = 0, sumRR = 0;
  for (const { q, topic } of QUERIES) {
    const qv = await embed(q, embedder);
    const ranked = vecs
      .map((v) => ({ v, s: cosine(qv, v.embedding) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, K);
    const hits = ranked.filter((r) => r.v.topic === topic).length;
    const p = hits / K;
    const firstRank = ranked.findIndex((r) => r.v.topic === topic) + 1;
    const rr = firstRank > 0 ? 1 / firstRank : 0;
    sumP += p; sumRR += rr;
    const flag = firstRank === 1 ? "✅" : firstRank > 0 ? "🟡" : "❌";
    console.log(`${flag} P@${K}=${p.toFixed(2)} RR=${rr.toFixed(2)}  [${topic}]  ${q}`);
  }

  const n = QUERIES.length;
  console.log(`\n[eval] ${embedder}:  mean Precision@${K} = ${(sumP / n).toFixed(3)}   MRR = ${(sumRR / n).toFixed(3)}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
