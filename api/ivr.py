"""
Shokhi — IVR voice hotline (the "many front doors" roadmap, made real).

The highest-need women in Bangladesh often have only a basic button phone and cannot
read app text. This module lets them simply *dial a number, speak their concern in
Bangla, and hear guidance back* — no smartphone, no reading, no app. It reuses the exact
same core as the web app (Gemma transcription -> deterministic triage -> warm Bangla
guidance); only the front door changes.

It speaks Twilio's TwiML (also compatible with Exotel-style webhooks). The flow:

    dial in  ->  /api/ivr/welcome   greet + record her spoken Bangla
             ->  /api/ivr/handle    transcribe (Gemma) -> triage -> speak guidance
             ->  (repeat or hang up)

Design mirrors the rest of the app:
  * The TwiML builders and the voice-summary are PURE, deterministic, unit-testable
    string functions (no network) — that is what the tests cover.
  * Speaking Bangla back uses gTTS <Play> when available, else falls back to Twilio's
    <Say language="bn-IN">, so the flow degrades gracefully with zero hard dependency.
  * Any error along the way still returns a safe spoken message pointing to the health
    hotline and 999 — a phone call must never dead-end.
"""

from __future__ import annotations

import os
import uuid
from xml.sax.saxutils import escape

from fastapi import APIRouter, Form, Request
from fastapi.responses import Response

import triage as triage_engine
from assistant import Assistant
from gemma_backend import get_backend

router = APIRouter(prefix="/api/ivr")

HEALTH_HOTLINE_BD = "16263"
EMERGENCY_BD = "999"

GREETING_BN = (
    "সখীতে আপনাকে স্বাগতম। আমি আপনার স্বাস্থ্য বন্ধু। "
    "বিপ শব্দের পর আপনার সমস্যাটি বাংলায় বলুন। বলা শেষ হলে চুপ করে থাকুন।"
)
FALLBACK_BN = (
    "দুঃখিত, এই মুহূর্তে আপনার কথা বুঝতে পারিনি। "
    f"স্বাস্থ্য পরামর্শের জন্য {HEALTH_HOTLINE_BD} নম্বরে কল করুন। "
    f"জরুরি অবস্থায় {EMERGENCY_BD} নম্বরে কল করুন।"
)
CLOSING_BN = (
    "মনে রাখবেন, সখী একজন বন্ধু, ডাক্তার নয়। "
    f"নিশ্চিত হতে ডাক্তার দেখান। জরুরি হলে {EMERGENCY_BD}। ভালো থাকবেন।"
)

# In-memory TTS cache: uuid -> mp3 bytes, played back via GET /api/ivr/audio/{id}.
_AUDIO_CACHE: dict[str, bytes] = {}


# =============================================================================
# Pure TwiML builders (unit-tested — no network, no state)
# =============================================================================
def twiml(body: str) -> str:
    """Wrap TwiML verb(s) in a full <Response> document."""
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<Response>{body}</Response>'


def say(text: str, lang: str = "bn-IN") -> str:
    return f'<Say language="{lang}">{escape(text)}</Say>'


def play(url: str) -> str:
    return f"<Play>{escape(url)}</Play>"


def build_welcome(action_url: str, greeting: str = GREETING_BN) -> str:
    """Greet the caller and record her spoken concern, POSTing it to `action_url`."""
    record = (
        f'<Record action="{escape(action_url)}" method="POST" maxLength="30" '
        f'timeout="3" playBeep="true" trim="trim-silence" />'
    )
    return twiml(say(greeting) + record + say(FALLBACK_BN))


def voice_summary(result: dict) -> str:
    """Turn a triage result into a short, plain-Bangla spoken script (no markdown)."""
    parts: list[str] = []
    urgency = result.get("urgency", "info")

    if urgency == "emergency":
        parts.append("এটি জরুরি অবস্থা হতে পারে।")
        for rf in result.get("red_flags", []):
            parts.append(rf.get("action_bn", ""))
        parts.append(f"এখনই {EMERGENCY_BD} নম্বরে কল করুন বা নিকটস্থ হাসপাতালে যান।")
    else:
        label = result.get("urgency_label_bn", "")
        if label:
            parts.append(label + "।")
        for rf in result.get("red_flags", []):
            parts.append(rf.get("message_bn", ""))
        conds = result.get("suspected_conditions", [])
        if conds:
            names = ", ".join(c["name_bn"] for c in conds)
            parts.append(
                f"আপনার বর্ণনা শুনে যা একজন ডাক্তারের সাথে আলোচনা করা ভালো: {names}। "
                "এটি নিশ্চিত রোগ নির্ণয় নয়।"
            )
        elif urgency == "info":
            parts.append("আপনার বর্ণনায় এখন বিপদের কোনো লক্ষণ পাওয়া যায়নি।")

    parts.append(f"স্বাস্থ্য পরামর্শের জন্য {HEALTH_HOTLINE_BD} নম্বরে কল করতে পারেন।")
    return " ".join(p for p in parts if p and p.strip())


def guidance_for_transcript(transcript: str, backend=None) -> dict:
    """Run one spoken turn through the normal pipeline. Returns triage result + spoken
    script. Pure w.r.t. the network when given the mock backend (used by tests)."""
    a = Assistant(backend=backend or get_backend())
    result = a.add_user_message(transcript)
    return {"triage": result, "spoken_bn": voice_summary(result)}


# =============================================================================
# Speaking Bangla back: gTTS <Play> when available, else <Say> fallback
# =============================================================================
def _speak(text: str, base_url: str) -> str:
    """Return a TwiML verb that speaks `text` in Bangla — synthesized audio if gTTS is
    installed, otherwise Twilio's built-in bn-IN voice."""
    try:
        from gtts import gTTS  # optional; keep the hotline dependency-light
        import io

        buf = io.BytesIO()
        gTTS(text=text, lang="bn").write_to_fp(buf)
        token = uuid.uuid4().hex
        _AUDIO_CACHE[token] = buf.getvalue()
        return play(f"{base_url.rstrip('/')}/api/ivr/audio/{token}.mp3")
    except Exception:
        return say(text)


# =============================================================================
# Webhook endpoints (Twilio / Exotel style)
# =============================================================================
@router.api_route("/welcome", methods=["GET", "POST"])
async def welcome(request: Request) -> Response:
    action = str(request.url_for("ivr_handle"))
    return Response(content=build_welcome(action), media_type="application/xml")


@router.post("/handle", name="ivr_handle")
async def handle(request: Request, RecordingUrl: str = Form(default="")) -> Response:
    base = str(request.base_url)
    try:
        backend = get_backend()
        transcript = _fetch_and_transcribe(RecordingUrl, backend) if RecordingUrl else ""
        if not transcript.strip():
            return Response(content=twiml(_speak(FALLBACK_BN, base)),
                            media_type="application/xml")
        out = guidance_for_transcript(transcript, backend)
        body = _speak(out["spoken_bn"], base) + _speak(CLOSING_BN, base)
        return Response(content=twiml(body), media_type="application/xml")
    except Exception:
        return Response(content=twiml(_speak(FALLBACK_BN, base)),
                        media_type="application/xml")


@router.get("/audio/{token}.mp3")
async def audio(token: str) -> Response:
    data = _AUDIO_CACHE.pop(token, b"")  # one-shot playback, then free the memory
    return Response(content=data, media_type="audio/mpeg")


def _fetch_and_transcribe(recording_url: str, backend) -> str:
    """Download the Twilio recording and transcribe it with Gemma's native audio.
    Returns '' if the backend can't do audio (caller then plays the safe fallback)."""
    if not backend.supports_audio():
        return ""
    import requests

    sid = os.environ.get("TWILIO_ACCOUNT_SID")
    tok = os.environ.get("TWILIO_AUTH_TOKEN")
    auth = (sid, tok) if sid and tok else None
    resp = requests.get(recording_url + ".wav", auth=auth, timeout=30)
    resp.raise_for_status()
    return backend.transcribe_audio(resp.content, "audio/wav")
