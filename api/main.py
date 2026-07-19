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

from assistant import Assistant
from gemma_backend import get_backend

app = FastAPI(title="Shokhi API", version="1.0")

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


def _payload(a: Assistant) -> dict:
    result = a.triage()
    return {
        "profile": a.profile,
        "triage": result,
        "guidance": a.explain(),
        "next_question": a.next_question(),
        "is_emergency": result["urgency"] == "emergency",
        "backend": a.backend.name,
    }


# --- request models -----------------------------------------------------------
class MessageIn(BaseModel):
    message: str
    profile: dict | None = None
    history: list[str] | None = None


class ChecklistIn(BaseModel):
    symptoms: dict
    profile: dict | None = None


class MythIn(BaseModel):
    belief: str


class GuideIn(BaseModel):
    topic: str  # a guide id (e.g. "contraception") or a free-text Bangla/English question


# --- endpoints ----------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok", "backend": get_backend().name}


@app.get("/api/knowledge")
def knowledge():
    """Symptom schema + examples so the frontend can render checklist & examples."""
    a = Assistant(backend=get_backend())
    kb = a.knowledge
    return {
        "symptom_schema": kb["symptom_schema"],
        "meta": kb["meta"],
        "myths": kb.get("myths", []),
    }


@app.post("/api/message")
def message(inp: MessageIn):
    a = _assistant(inp.profile, inp.history)
    a.add_user_message(inp.message)
    return _payload(a)


@app.post("/api/checklist")
def checklist(inp: ChecklistIn):
    a = _assistant(inp.profile, None)
    a.set_symptoms(**{k: v for k, v in inp.symptoms.items() if v})
    return _payload(a)


@app.post("/api/myth")
def myth(inp: MythIn):
    a = Assistant(backend=get_backend())
    return {"reply": a.bust_myth(inp.belief)}


@app.get("/api/guides")
def guides():
    """List the health-info guide cards (contraception, family planning, menopause…)."""
    a = Assistant(backend=get_backend())
    return {"guides": a.list_guides()}


@app.post("/api/guide")
def guide(inp: GuideIn):
    """Explain one health topic in warm Bangla, grounded on the knowledge base."""
    a = Assistant(backend=get_backend())
    result = a.explain_guide(inp.topic)
    if not result:
        raise HTTPException(status_code=404, detail="No guide matched that topic.")
    return result


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
