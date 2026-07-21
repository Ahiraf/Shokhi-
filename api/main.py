"""
Shokhi backend — FastAPI wrapper around the Gemma 4 assistant.

Exposes the triage + guidance pipeline as a small JSON API for the Next.js frontend.
Stateless: the client sends the running symptom profile (and optional history) with each
call, and gets back the updated profile, the deterministic triage result, and Gemma's
Bangla guidance. Deploy to Render; the frontend on Vercel calls these endpoints.

Run locally:
    cd api && pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

import os

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import cycle as cycle_engine
import ivr
from assistant import Assistant
from gemma_backend import get_backend

app = FastAPI(title="Shokhi API", version="1.0")

# IVR voice-hotline webhooks (Twilio/Exotel) — same core, a phone front door.
app.include_router(ivr.router)

# CORS: allow the Vercel frontend (comma-separated origins in ALLOWED_ORIGINS; * in dev).
_origins = os.environ.get("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _assistant(profile: dict | None, history: list[str] | None) -> Assistant:
    a = Assistant(backend=get_backend())
    if profile:
        a.profile = dict(profile)
    if history:
        a.history = list(history)
    return a


def _payload(a: Assistant, lang: str = "bn") -> dict:
    result = a.triage()
    return {
        "profile": a.profile,
        "triage": result,
        "guidance": a.explain(lang),
        "next_question": a.next_question(),
        "is_emergency": result["urgency"] == "emergency",
        "backend": a.backend.name,
    }


# --- request models -----------------------------------------------------------
# lang: UI language for the generated reply ("bn" default | "en"). Curated knowledge-base
# content already ships both languages; lang controls the LLM/cycle prose.
class MessageIn(BaseModel):
    message: str
    profile: dict | None = None
    history: list[str] | None = None
    lang: str = "bn"


class ChecklistIn(BaseModel):
    symptoms: dict
    profile: dict | None = None
    lang: str = "bn"


class MythIn(BaseModel):
    belief: str
    lang: str = "bn"


class GuideIn(BaseModel):
    topic: str  # a guide id (e.g. "contraception") or a free-text Bangla/English question
    lang: str = "bn"


class CycleIn(BaseModel):
    logs: list[dict]  # [{start, end?, flow?, pain?, note?}, …] — client-stored history
    lang: str = "bn"


# --- endpoints ----------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok", "backend": get_backend().name}


@app.get("/api/knowledge")
def knowledge():
    """Symptom schema, conditions, red flags & myths so the frontend can render the
    checklist, the 'learn' library and the myth-busting page."""
    a = Assistant(backend=get_backend())
    kb = a.knowledge
    return {
        "symptom_schema": kb["symptom_schema"],
        "meta": kb["meta"],
        "conditions": kb.get("conditions", []),
        "red_flags": kb.get("red_flags", []),
        "myths": kb.get("myths", []),
    }


@app.post("/api/message")
def message(inp: MessageIn):
    a = _assistant(inp.profile, inp.history)
    a.add_user_message(inp.message)
    return _payload(a, inp.lang)


@app.post("/api/checklist")
def checklist(inp: ChecklistIn):
    a = _assistant(inp.profile, None)
    a.set_symptoms(**{k: v for k, v in inp.symptoms.items() if v})
    return _payload(a, inp.lang)


@app.post("/api/myth")
def myth(inp: MythIn):
    a = Assistant(backend=get_backend())
    return {"reply": a.bust_myth(inp.belief, inp.lang)}


@app.get("/api/guides")
def guides():
    """List the health-info guide cards (contraception, family planning, menopause…)."""
    a = Assistant(backend=get_backend())
    return {"guides": a.list_guides()}


@app.get("/api/guides/{gid}")
def guide_detail(gid: str):
    """Full guide (title + points + when-to-see-a-doctor) for its own page."""
    a = Assistant(backend=get_backend())
    g = a.get_guide(gid)
    if not g:
        raise HTTPException(status_code=404, detail="Guide not found.")
    return g


@app.post("/api/guide")
def guide(inp: GuideIn):
    """Explain one health topic in warm Bangla/English, grounded on the knowledge base."""
    a = Assistant(backend=get_backend())
    result = a.explain_guide(inp.topic, inp.lang)
    if not result:
        raise HTTPException(status_code=404, detail="No guide matched that topic.")
    return result


@app.post("/api/cycle/analyze")
def cycle_analyze(inp: CycleIn):
    """Analyse a logged period history into Bangla insights + suggested symptom flags.

    Stateless by design: the client keeps the history (localStorage) and sends it here.
    The returned `suggested_symptoms` can be merged into the chat profile so triage can
    act on a pattern the woman couldn't have described in a single message."""
    return cycle_engine.analyze(inp.logs, lang=inp.lang)


@app.post("/api/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    """Gemma 4 native-audio transcription of spoken Bangla (needs the gemini backend)."""
    backend = get_backend()
    if not backend.supports_audio():
        raise HTTPException(
            status_code=501,
            detail="Audio needs the live Gemma 4 backend (set SHOKHI_BACKEND=gemini).",
        )
    data = await audio.read()
    text = backend.transcribe_audio(data, audio.content_type or "audio/wav")
    return {"transcript": text}
