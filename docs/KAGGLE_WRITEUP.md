# সখী · Shokhi — A Bangla Women's Health Companion, Powered by Gemma 4

**Subtitle:** Free-form Bangla symptom understanding + a deterministic clinical safety
layer, built for every woman — from urban teenagers to rural women who cannot read.

---

## The problem

In Bangladesh, menstrual and reproductive health is buried under stigma, silence, and
misinformation. The cost is measured in real health outcomes:

- **PCOS affects an estimated ~51% of reproductive-aged women** in recent Bangladeshi
  studies, and is *higher in rural areas*, with 50–60% of affected women also reporting
  depression, anxiety, or insomnia. Yet most women never get it named or managed.
- **Endometriosis** — severe period pain that stops school, work, and daily life — is
  routinely dismissed as "normal," delaying diagnosis by years.
- Nearly **half of adolescent girls** receive no menstrual education before their first
  period; **30% miss school** every month.

The women who suffer most are the hardest to reach. Research is blunt: rural and
less-educated women often own only **basic button phones**, are frequently **unable to
read SMS or app text**, and face stigma that stops them asking anyone. They need
**voice, in Bangla, on any phone**.

## Why existing tools don't close the gap

Two well-known tools exist — and both leave this population behind:

- **Ananya (WaterAid Bangladesh)** is a period *tracker* with static articles. It has
  **no AI**, **no clinical triage**, **no PCOS/endometriosis support**, **no voice**, and
  requires a **smartphone and literacy** to install and read it.
- **Probahini (WaterAid + Acme AI)** is a **scripted FAQ chatbot** on messaging apps — it
  does not *reason* over a woman's real, messy symptom description, and still needs a
  smartphone plus the ability to read and type.

**The idea of digital menstrual health isn't new — but the implementation that serves the
phone-only, can't-read, PCOS/endometriosis-affected woman does not exist.** That is Shokhi.

## Our solution

**Shokhi (সখী — "a woman's trusted confidante")** lets any woman describe how she feels —
by **typing or speaking in Bangla** — and returns warm, safe, personalized guidance:

1. **Understand** free-form Bangla symptoms → structured facts (Gemma 4).
2. **Triage** them with a deterministic clinical rules layer: *emergency*, *see a doctor
   soon*, *safe home care*, or *general info* — with red-flag detection.
3. **Explain** kindly in simple, spoken-style Bangla what it might be, what to do now, and
   which real service to go to (Gemma 4) — never a firm diagnosis.

Shokhi covers **menstrual health, PCOS, PMS, endometriosis, and common cramps**, and busts
harmful myths. It adapts across the whole spectrum: an urban teenager gets private,
judgment-free education; a rural woman gets **voice-first guidance she can hear**.

## How Gemma 4 is integrated (and why it is core)

Shokhi runs on a **"one Gemma brain, a safety rail underneath"** architecture:

```
Bangla text / voice
      │  extractSymptoms()  ── Gemma 4 turns messy free-form Bangla into structured facts
      ▼
Symptom profile (JSON)
      │
      ▼  triage.ts  ── DETERMINISTIC rules decide urgency + red flags (never the LLM)
Safety-checked result (JSON)
      │  explainTriage() / bustMyth()  ── Gemma 4 speaks back with warmth, at the
      ▼                                     right literacy level
Bangla guidance (text + optional voice)
```

**Gemma 4 does the genuinely hard, generative work** that no rule-tree can: interpreting
colloquial, code-mixed, real-world Bangla symptom talk, and producing empathetic,
simple, culturally-aware Bangla responses. This is what separates Shokhi from Ananya's
static content and Probahini's scripts.

**Crucially, the safety-critical decision is *not* made by the LLM.** The urgency level
and red flags (e.g. "possible pregnancy + severe pain → emergency") are computed by a
deterministic engine, so Gemma **can never under-triage an emergency because of a
hallucination**. This is the responsible pattern for health AI: *LLM for language,
deterministic logic for safety.* Gemma stays core (natural language), wrapped in a guardrail.

**Voice is supported** for women who cannot type: the browser's on-device speech
recognition captures spoken Bangla (a non-generative, rules-allowed tool),
and the backend can also transcribe with **Gemma 4's native audio**. Other supporting,
non-generative tools assist Gemma — a curated knowledge base of red flags/conditions/myths,
embeddings + a vector store for RAG, two exported ML risk classifiers, and Bangla
text-to-speech so guidance can be **heard**. **Gemma 4 is the only LLM in the system.**

## System architecture: one brain, many front doors

Because the triage engine and Gemma backend are fully decoupled from the UI, the *same
core* serves multiple channels:

| User | Front door | Status |
|---|---|---|
| Urban teen / literate woman | Web app (text + voice) | Built — the demo |
| Health worker / NGO field staff | Same web app, checklist mode | Built |
| **Rural, low-literacy woman** | **IVR voice hotline** — dial, speak Bangla, hear guidance; no smartphone, no reading | Roadmap, same backend |

**Platform choice:** a **web app**, not a native mobile app — native apps need a smartphone
and app store, exactly what excludes rural women. The web app runs in any browser, supports
voice, and hosts trivially for a demo; the path to phone-only users is a **voice IVR
hotline** this decoupled backend can power.

## Technical implementation

Shokhi is a **single Next.js app** (TypeScript) — UI and backend (API routes) together,
with server logic in `lib/server/`:

- **Triage engine** — deterministic safety logic (zero LLM/network): maps symptoms to
  urgency, fires red flags, suspects conditions (PCOS, endometriosis, PMS), and asks
  screening questions. **Never fires an emergency on a missing field**, and **never
  downgrades** one.
- **Gemma backend** — a `GemmaBackend` interface with a deterministic **Mock** (offline
  demo/tests) and a hosted **Gemma 4** implementation (JSON-mode output, defensive parsing).
- **`lib/server/prompts.ts`** — carefully-scoped Gemma prompts (extract, explain, myth,
  RAG-grounded), instructed to extract only stated facts, never diagnose, never override urgency.
- **`lib/server/assistant.ts`** — the orchestrator tying conversation → symptoms → triage →
  guidance (and RAG), holding state across turns.
- **`lib/server/knowledge.json`** — the clinical knowledge base (red flags, conditions with
  bilingual self-care, myths, 22-field symptom schema).
- **Supporting ML risk models** — two lightweight, *non-generative* classifiers that add a
  risk signal to triage, trained on real public **self-report** datasets: **PCOS** (Kaggle,
  541 records — test AUC **0.84**) and **endometriosis** (Scientific Reports 2023, 886
  records — test AUC **0.93**). They use only features a woman can state in conversation
  (cycle regularity, excess hair, acne, period pain, etc.), *not* lab values. Allowed
  "traditional ML that supports, not replaces" Gemma 4: the signal **never overrides**
  urgency, and degrades gracefully if absent.
- **Web UI** (Next.js) — chat, a symptom **checklist** (so a helper can assist a woman who
  can't type), **voice input**, colored urgency cards, and optional **Bangla
  text-to-speech**.
- **Pure-TypeScript runtime** — the ML risk classifiers are trained offline and **exported
  to plain JSON**, so inference runs in TypeScript with **no Python/ML runtime on the
  server**. UI, API routes, triage, RAG and the ML signal deploy as **one unit on Vercel**.

### Retrieval-Augmented Generation (RAG)

For open questions about a topic, Shokhi does not answer from memory. It first **retrieves**
the most relevant passages from a small library of **trusted health documents** (WHO,
national guidelines), then **Gemma 4 answers using only those passages** and cites the
source. Retrieval uses **embeddings** (Google `gemini-embedding-001`) + cosine
search — both **non-generative**, which the rules permit as support — so **Gemma 4 stays the
only LLM** that generates anything. The pipeline is **TypeScript** (RAG is an architecture,
not a Python library), inside the one Next.js app — no extra service. If nothing relevant is
found it falls back to the knowledge base; **urgency is still decided by rules**, so
retrieval never affects safety — it only enriches and *cites* answers.

## Technical challenges & how we addressed them

- **Safety vs. LLM freedom:** we refused to let the model decide urgency. A separate
  deterministic engine owns that, so a hallucination can never miss an emergency.
- **Messy, code-mixed Bangla:** Gemma handles free-form input; JSON-mode + a defensive
  parser tolerate the prose/code-fences models sometimes add.
- **Reaching non-readers:** voice input, Bangla TTS, and a checklist mode; a decoupled
  backend a phone IVR hotline can reuse.
- **Avoiding harm:** conditions are surfaced only as "worth discussing with a doctor,"
  always alongside the free hotline (16263) and 999.

## Real-world impact & future work

Shokhi targets a large, underserved population with a channel strategy for the people
existing tools ignore. Next steps: validate a live Gemma 4 and its native Bangla audio,
deploy publicly, and pilot the **IVR voice hotline** with an NGO for rural reach. By pairing
Gemma 4's language power with a strict safety layer, Shokhi turns a private, stigmatized
struggle into a free, judgment-free companion — in every woman's own language.

## Sources & acknowledgements

The RAG corpus uses only reliable, public, licensed sources, cited in every answer: **WHO**
fact sheets/guidelines under **CC BY-NC-SA 3.0 IGO** (adapted with WHO's required disclaimer),
**NHS** under the **Open Government Licence**, and **Bangladesh DGHS/DGFP** and **icddr,b**
summarised with attribution. Full credits in `ATTRIBUTION.md`. Shokhi is free and
non-commercial.

*Repository & demo attached. Gemma 4 is the only LLM used.*
