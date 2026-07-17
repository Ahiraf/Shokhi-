# 🌸 সখী · Shokhi — A Bangla Women's Health Companion, Powered by Gemma 4

**Shokhi** (সখী — *"a woman's trusted confidante"*) is a warm, Bangla-first health
companion for menstrual health, **PCOS, PMS, and endometriosis** — built for **every**
woman in Bangladesh, from urban teenagers to rural women who may not be able to read.

You describe how you feel — by **typing or speaking in Bangla** — and Shokhi:

1. **Understands** your free-form symptoms (Gemma 4),
2. **Safely triages** them with a deterministic clinical rules layer — *is this an
   emergency, a "see a doctor soon", or safe home care?*,
3. **Explains** kindly, in simple spoken-style Bangla, what it might be and what to do
   (Gemma 4), always pointing you to a real doctor for diagnosis.

> Shokhi is a **health companion, not a doctor**. It gives an initial sense and safe
> guidance; a qualified doctor confirms any diagnosis. Emergencies → **999**.

---

## 🧭 Why Shokhi? The gap in what already exists

The *idea* of digital menstrual health in Bangladesh is not new — but the existing tools
leave the women who need help most **unserved**. Shokhi is a different **implementation**
that targets exactly those gaps.

### Limitations of existing solutions

**Ananya (WaterAid Bangladesh)** — a period **tracker** + cycle prediction + static
informational articles (Android app, Bangla/English):
- ❌ **No AI / no reasoning** — canned, one-size-fits-all content; it can't understand or
  respond to a woman's actual symptom description.
- ❌ **Requires a smartphone + literacy** — you must be able to install an Android app and
  **read** articles. This excludes low-literacy and rural women — the highest-need group.
- ❌ **No clinical triage** — it cannot tell a dangerous red flag from normal cramps.
- ❌ **No PCOS / endometriosis / PMS support** — it is a tracker, not a health advisor.
- ❌ **No voice** — nothing for women who cannot read text.

**Probahini (WaterAid + Acme AI)** — a messenger-based **FAQ chatbot** (Bangla/English):
- ❌ **Scripted, rule-tree conversation** — guided FAQs and myth-busting, but it does not
  *reason* over free-form, messy, real-life symptom descriptions.
- ❌ **Still needs a smartphone, a messaging app, and the ability to read & type.**
- ❌ **No personalized triage** — no "go to hospital now" vs. "safe self-care" decisioning.

**The research is blunt about who gets left out:**
- Rural and less-educated women — who are more likely to be **illiterate** — often have only
  **basic button phones** and **cannot read SMS or app text**; studies find they need
  **voice, in Bangla, ideally via a hotline**.
- **PCOS prevalence in Bangladesh is ~51%**, higher in rural areas, with 50–60% reporting
  depression / anxiety / insomnia — yet **no existing app offers PCOS/endometriosis
  symptom triage**.

### How Shokhi is different (the ownable implementation)

| | Ananya | Probahini | **Shokhi** |
|---|:---:|:---:|:---:|
| Understands free-form Bangla symptoms | ❌ | ⚠️ scripted | ✅ **Gemma 4 reasoning** |
| Clinical red-flag / emergency triage | ❌ | ❌ | ✅ **deterministic safety layer** |
| PCOS / PMS / endometriosis guidance | ❌ | ❌ | ✅ |
| Voice-first (speak & hear Bangla) | ❌ | ❌ | ✅ (+ IVR-hotline roadmap) |
| Serves low-literacy / rural women | ❌ | ❌ | ✅ **designed for them first** |
| Works without installing an app | ❌ | ⚠️ | ✅ web / any browser |
| Adapts across urban teen → rural woman | ❌ | ❌ | ✅ |

*Sources: WaterAid Bangladesh (Ananya / Probahini); Heliyon voice-bot study on marginalized
women's healthcare access; Reproductive Health (BMC) on mobile-phone use among low-income
women; medRxiv 2025 on PCOS prevalence & psychological distress in Bangladesh.*

---

## 🧠 How Gemma 4 is integrated (and why it's core)

Shokhi is built on a **"one Gemma brain, a safety rail underneath"** architecture:

```
  Bangla text / voice
          │
          ▼
  ┌───────────────────┐   free-form language → structured symptoms
  │   Gemma 4         │   (extract_symptoms)
  │   (NLP + empathy) │
  └───────────────────┘
          │  symptom profile (JSON)
          ▼
  ┌───────────────────┐   DETERMINISTIC — never the LLM
  │  Triage engine    │   urgency + red flags + suspected conditions
  │  (triage.py)      │   (emergency / see-doctor / self-care / info)
  └───────────────────┘
          │  safety-checked result (JSON)
          ▼
  ┌───────────────────┐   result → warm, literacy-appropriate Bangla
  │   Gemma 4         │   (explain_triage, bust_myth)
  │   (generation)    │
  └───────────────────┘
          │
          ▼
  Bangla guidance (text + optional voice)
```

**Gemma 4 does the hard, generative work** — understanding messy real-world Bangla, and
speaking back with warmth at the right literacy level. The **triage decision is made by
rules, not the model**, so Gemma can **never under-triage an emergency** because of a
hallucination. This is the standard safe pattern for health AI: *LLM for language,
deterministic logic for safety-critical decisions.*

The **voice path also runs through Gemma 4**: its native audio (E-series, E2B/E4B)
transcribes spoken Bangla directly — so even speech input uses Gemma, with no separate
speech-to-text library. Supporting (non-generative, allowed) tools: a knowledge base of
red flags/conditions/myths, and Bangla text-to-speech (gTTS) so guidance can be **heard**.

---

## 🚪 One brain, many front doors (reaching *all* women)

| User | Front door | Status |
|---|---|---|
| Urban teen / literate woman | **Web app** (text + voice) | ✅ this repo |
| Health worker / NGO field staff | Same web app (checklist mode) | ✅ this repo |
| **Rural, low-literacy woman** | **IVR voice hotline** — dial, speak Bangla, hear guidance; no smartphone, no reading | 🛣️ roadmap (same backend) |

Because the triage engine and Gemma backend are fully decoupled from the UI, the *same
core* powers the web app today and a phone hotline tomorrow.

---

## 📊 Supporting ML models (PCOS & endometriosis risk)

To strengthen — never replace — Gemma's judgment, Shokhi includes two **lightweight,
non-generative ML classifiers** trained on real public self-report symptom datasets. They
output a **risk probability** that feeds the triage engine as one extra signal. This is
explicitly allowed by the hackathon rules ("traditional ML … that supports and does not
replace Gemma 4 as the primary AI"). **Gemma 4 remains the primary AI** — it does all
language understanding and generates all guidance; the classifier only nudges a suspicion.

| Model | Dataset | Records | Test accuracy | Test AUC |
|---|---|---:|---:|---:|
| PCOS risk | Kaggle *Polycystic Ovary Syndrome (PCOS)* (P. Kottarathil) | 541 | 0.79 | **0.84** |
| Endometriosis risk | *Self-report symptom-based endometriosis prediction* (Scientific Reports, 2023) | 886 | 0.85 | **0.93** |

Key design choice: the models are trained **only on features a woman can self-report in
conversation** (cycle regularity, weight gain, excess hair, acne, period pain, pain during
sex, pelvic pain, infertility) — *not* lab values (FSH/LH/AMH/ultrasound) that a chat
can't provide — so the same symptoms Gemma extracts drive the prediction. The risk signal
**never overrides** the deterministic urgency; an emergency stays an emergency.

```bash
cd src && python3 train_risk_models.py     # trains + saves models to data/models/
```

The layer is **fully optional**: if scikit-learn or the trained models are absent, the
signal simply turns off and the app runs unchanged. *Dataset licenses: verify on source
before redistribution; used here for research/education.*

## 🚀 Quick start

Shokhi is a **Next.js frontend** (`web/`, → Vercel) talking to a **FastAPI backend**
(`api/`, → Render). Run both locally:

**1. Backend** (terminal 1):
```bash
cd api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000        # runs on the mock backend by default

# For live Gemma 4 (same API key that works for Gemini):
export SHOKHI_BACKEND=gemini
export SHOKHI_GEMMA_MODEL=gemma-4-26b-a4b-it   # or gemma-4-31b-it (flagship)
export GOOGLE_API_KEY=your_key
uvicorn main:app --reload --port 8000

# Or fully offline via Ollama:
#   ollama pull gemma4:e4b && export SHOKHI_BACKEND=ollama SHOKHI_GEMMA_MODEL=gemma4:e4b
```

**2. Frontend** (terminal 2):
```bash
cd web
npm install
cp .env.local.example .env.local             # points at http://localhost:8000
npm run dev                                   # open http://localhost:3000
```

Run the backend tests (no UI, no model needed):
```bash
cd api
python3 test_triage.py       # 13 safety-engine tests
python3 test_assistant.py    # 10 orchestrator tests
python3 test_risk_model.py   # 5 ML-support tests
```

---

## 🗂️ Project structure

```
Shokhi/
├── web/                     # Next.js + Tailwind frontend  → Vercel
│   ├── app/                 # page.tsx, layout.tsx, globals.css
│   ├── components/          # Message, Composer, UrgencyPill, RiskBar, Examples
│   └── lib/                 # api.ts (backend client), types.ts
├── api/                     # FastAPI backend             → Render
│   ├── main.py              # JSON API (message / checklist / transcribe / knowledge)
│   ├── triage.py            # deterministic triage/safety engine (no LLM)
│   ├── gemma_backend.py     # Mock + Ollama + Gemini(API) backends + native audio
│   ├── prompts.py           # Gemma 4 prompt templates
│   ├── assistant.py         # orchestrator (conversation → triage → guidance)
│   ├── risk_model.py        # optional ML risk-signal inference (PCOS/endo)
│   ├── train_risk_models.py # trains the two classifiers from public datasets
│   ├── test_*.py            # 28 tests (triage 13 + assistant 10 + risk 5)
│   ├── legacy_streamlit/    # old Streamlit UI (optional offline demo)
│   └── data/                # knowledge.json, models/*.joblib, datasets/
├── render.yaml              # Render blueprint for the backend
├── docs/                    # writeup, platform decision PDF
└── README.md
```

## 🌐 Deploy (Vercel + Render)

Two services, **connected** by one env var + CORS:

1. **Backend → Render:** New → Blueprint (uses `render.yaml`, root `api/`). In the
   dashboard set `GOOGLE_API_KEY` and `ALLOWED_ORIGINS` (your Vercel URL). You get
   `https://shokhi-api.onrender.com`.
2. **Frontend → Vercel:** Import the repo, set **Root Directory = `web`**, and add env
   var `NEXT_PUBLIC_API_URL=https://shokhi-api.onrender.com`. Deploy → public link.

The frontend calls the backend via `NEXT_PUBLIC_API_URL`; the backend allows the frontend
via `ALLOWED_ORIGINS`. That wiring is what makes the two separate deployments work together.

## ⚙️ Configuration

| Env var | Default | Meaning |
|---|---|---|
| `SHOKHI_BACKEND` | `mock` | `mock` (offline demo), `gemini` (hosted Gemma 4, API key), or `ollama` (local Gemma 4) |
| `SHOKHI_GEMMA_MODEL` | `gemma4:e4b` | Gemma 4 tag — Ollama (`gemma4:e4b`/`:12b`/`:31b`) or AI Studio (`gemma-4-26b-a4b-it`/`gemma-4-31b-it`) |
| `GOOGLE_API_KEY` | — | Google AI Studio key (only for `gemini` backend) |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama server URL (only for `ollama` backend) |

## 🔮 Future plans

### Offline, edge deployment for no-internet rural clinics

Shokhi supports two ways to run Gemma 4, and the second unlocks a future the existing
apps cannot reach:

- **Hosted (API key) — reach the whole country over the internet.** The cloud runs
  Gemma 4; any woman opens the web link from any browser. This is the standard web
  deployment (like any website, it needs internet). *This is the near-term product.*
- **Local (Ollama) — genuinely offline, for places with no internet.** With Ollama, the
  Gemma 4 model runs **entirely on the device it's installed on** — a laptop, mini-PC, or
  kiosk. The important nuance: this serves **whoever is physically at that device**, not
  the open internet (a model on one machine is not a public server).

That local mode is exactly what a **rural health center or Union Parishad office with no
connectivity** needs: place one device running Shokhi + Gemma 4 at the center, and a
health worker can help every woman who walks in — no internet, no data cost, no cloud.
Because the Gemma backend is fully swappable (`mock` / `gemini` / `ollama`) behind one
interface, the **same codebase** powers both the online web app and the offline clinic
device with zero rewrite.

### Other planned work
- **Bangla voice hotline (IVR):** the top priority for reaching phone-only, low-literacy
  women — dial a number, speak Bangla, hear guidance. Same backend, phone front door.
- **Telephone-quality audio tuning** for Gemma 4's native voice transcription on the IVR path.
- **Grounded knowledge expansion** validated against public research/clinical datasets.
- **NGO pilot** to measure real referral and awareness outcomes.

## ⚠️ Safety & scope

Shokhi does **not** diagnose or prescribe. It surfaces conditions as *"worth discussing
with a doctor,"* always shows the free government health hotline (**16263**) and emergency
number (**999**), and routes red flags to urgent care. It is an awareness and access tool,
not a replacement for medical care.

---

*Built for the Build with Gemma 4 Community Hackathon. Gemma 4 is the only LLM used.*
