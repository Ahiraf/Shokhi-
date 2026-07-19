"""
Gemma 4 backend abstraction for Shokhi.

The rest of the app talks to a `GemmaBackend` interface with three jobs:
  1. extract_symptoms() – Bangla/English conversation -> structured symptom flags
  2. explain_triage()   – deterministic triage result -> warm, safe Bangla guidance
  3. bust_myth()        – a menstrual-health belief -> gentle Bangla fact

Backends:
  * MockGemmaBackend – deterministic, no network/LLM. Runs & unit-tests TODAY.
  * OllamaBackend    – calls a local Gemma 4 via Ollama (`ollama run gemma...`).

Swap with get_backend("mock" | "ollama"). The model name is configurable so you can
point it at whatever exact Gemma 4 checkpoint you pulled (env SHOKHI_GEMMA_MODEL).

Why a rules layer sits UNDER Gemma: the urgency/red-flag DECISION is made by triage.py,
never by the model, so Gemma can never under-triage an emergency. Gemma is used for the
hard NLP: understanding messy Bangla symptom talk and speaking back with warmth.
"""

from __future__ import annotations

import json
import os
import re
from abc import ABC, abstractmethod

import prompts

DEFAULT_MODEL = os.environ.get("SHOKHI_GEMMA_MODEL", "gemma4:e4b")
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")


# =============================================================================
# Interface
# =============================================================================
class GemmaBackend(ABC):
    name = "base"

    @abstractmethod
    def extract_symptoms(self, conversation: str, known_profile: dict) -> dict:
        """Return a dict of NEWLY extracted symptom fields from the conversation."""

    @abstractmethod
    def explain_triage(self, triage_result: dict) -> str:
        """Return warm Bangla guidance explaining the triage result."""

    @abstractmethod
    def bust_myth(self, belief: str, fact: str = "") -> str:
        """Return a gentle Bangla correction of a menstrual-health belief."""

    def explain_guide(self, guide: dict, question: str = "") -> str:
        """Return warm Bangla guidance for a health-info guide (contraception, family
        planning, menopause care, nutrition …). Default is a deterministic render of the
        knowledge-base points, so every backend works offline; LLM backends override it
        with a fluent explanation."""
        lines: list[str] = []
        title = guide.get("title_bn", "")
        if title:
            lines.append(f"**{guide.get('icon', '🌸')} {title}**\n")
        if guide.get("summary_bn"):
            lines.append(guide["summary_bn"] + "\n")
        for p in guide.get("points_bn", []):
            lines.append(f"• {p}")
        if guide.get("when_see_doctor_bn"):
            lines.append(f"\n🩺 {guide['when_see_doctor_bn']}")
        return "\n".join(lines)

    # --- optional multimodal: Gemma 4 native audio (E2B/E4B) ------------------
    def supports_audio(self) -> bool:
        """True if this backend can transcribe/understand spoken audio via Gemma 4."""
        return False

    def transcribe_audio(self, audio_bytes: bytes, mime_type: str = "audio/wav") -> str:
        """Transcribe spoken Bangla/English audio to text using Gemma 4's native audio.
        Overridden by audio-capable backends; base raises to keep it optional."""
        raise NotImplementedError("This backend does not support audio input.")


# =============================================================================
# Mock backend — deterministic, offline. Lets the whole pipeline run & test now.
# =============================================================================
_BN_DIGITS = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")


def _to_int(s: str) -> int:
    return int(s.translate(_BN_DIGITS))


# keyword -> symptom field. Presence of ANY trigger (and no negation) sets it true.
_TRIGGERS: list[tuple[str, list[str]]] = [
    ("severe_pelvic_pain", ["তীব্র ব্যথা", "অসহ্য ব্যথা", "প্রচণ্ড ব্যথা", "severe pain", "unbearable pain"]),
    ("heavy_bleeding", ["অতিরিক্ত রক্ত", "প্রচুর রক্ত", "চাকা চাকা রক্ত", "প্যাড ভিজে", "heavy bleeding", "clots", "soaking"]),
    ("fainting_or_dizzy", ["মাথা ঘুর", "অজ্ঞান", "খুব দুর্বল", "faint", "dizzy", "dizziness", "very weak"]),
    ("fever", ["জ্বর", "fever"]),
    ("foul_discharge", ["দুর্গন্ধ", "গন্ধযুক্ত স্রাব", "foul", "smelly discharge"]),
    ("is_pregnant_possible", ["গর্ভবতী হতে পারি", "গর্ভধারণের সম্ভাবনা", "might be pregnant", "could be pregnant", "possibly pregnant"]),
    ("post_menopausal", ["মেনোপজ", "মাসিক বন্ধ হয়ে গেছে", "menopause", "periods stopped"]),
    ("bleeding_between_periods", ["মাঝে রক্ত", "দুই মাসিকের মাঝ", "between periods", "spotting"]),
    ("bleeding_after_sex", ["সহবাসের পর রক্ত", "মিলনের পর রক্ত", "after sex", "after intercourse"]),
    ("cycles_irregular", ["অনিয়মিত মাসিক", "মাসিক অনিয়মিত", "অনিয়মিত পিরিয়ড", "irregular period", "irregular cycle"]),
    ("missed_periods_3plus", ["৩ মাস মাসিক বন্ধ", "তিন মাস মাসিক", "মাসিক হচ্ছে না", "no period for 3", "missed period"]),
    ("excess_hair", ["অতিরিক্ত লোম", "মুখে লোম", "শরীরে লোম", "excess hair", "facial hair", "hirsut"]),
    ("persistent_acne", ["ব্রণ", "acne", "pimple"]),
    ("unexplained_weight_gain", ["ওজন বেড়ে", "ওজন বৃদ্ধি", "মোটা হয়ে", "weight gain", "gaining weight"]),
    ("pain_during_sex", ["সহবাসে ব্যথা", "মিলনে ব্যথা", "pain during sex", "painful intercourse"]),
    ("periods_disrupt_daily_life", ["ব্যথায় স্কুল", "ব্যথায় কাজ", "কাজ করতে পারি না", "can't go to school", "miss work", "stops my life"]),
    ("chronic_pelvic_pain", ["সবসময় তলপেটে ব্যথা", "মাসিক ছাড়াও ব্যথা", "constant pelvic pain", "pain all the time"]),
    ("trouble_conceiving", ["সন্তান হচ্ছে না", "বাচ্চা নিতে সমস্যা", "সন্তান নিতে সমস্যা", "trouble conceiving", "can't get pregnant", "infertil"]),
    ("pms_mood_symptoms", ["মাসিকের আগে মেজাজ", "আগে কান্না", "আগে রাগ", "mood swing", "irritable before"]),
    ("pms_physical_symptoms", ["পেট ফাঁপা", "স্তনে ব্যথা", "মাথাব্যথা", "bloating", "breast tender", "headache before"]),
    # general expansion: infection / anaemia / breast
    ("genital_itching", ["যৌনাঙ্গে চুলকানি", "গোপনাঙ্গে চুলকানি", "চুলকানি", "genital itch", "itching down there", "vaginal itch"]),
    ("painful_urination", ["প্রস্রাবে জ্বালা", "প্রস্রাবে ব্যথা", "burning urine", "painful urination", "burning when i pee"]),
    ("frequent_urination", ["বারবার প্রস্রাব", "ঘন ঘন প্রস্রাব", "frequent urination", "peeing often"]),
    ("fatigue_weakness", ["সবসময় ক্লান্ত", "খুব দুর্বল লাগে", "অল্পতেই হাঁপিয়ে", "always tired", "very weak", "fatigue"]),
    ("breast_lump", ["স্তনে চাকা", "স্তনে দলা", "breast lump", "lump in breast"]),
    # pregnancy danger signs
    ("pregnancy_bleeding", ["গর্ভাবস্থায় রক্ত", "গর্ভবতী অবস্থায় রক্ত", "bleeding while pregnant", "bleeding in pregnancy"]),
    ("pregnancy_severe_headache", ["গর্ভাবস্থায় তীব্র মাথাব্যথা", "severe headache pregnant", "bad headache pregnant"]),
    ("pregnancy_vision_changes", ["ঝাপসা দেখ", "চোখে ঝলক", "blurred vision", "flashing light", "spots in vision"]),
    ("pregnancy_face_hand_swelling", ["মুখ ফুলে", "হাত ফুলে", "face swelling", "hands swollen", "swollen face"]),
    ("pregnancy_convulsions", ["খিঁচুনি", "convulsion", "fits", "seizure"]),
    ("reduced_fetal_movement", ["বাচ্চা নড়ছে না", "শিশু নড়াচড়া কম", "baby not moving", "reduced movement", "baby stopped moving"]),
    # postpartum danger signs
    ("recently_gave_birth", ["সন্তান প্রসব করেছি", "বাচ্চা হয়েছে", "সদ্য মা হয়েছি", "just gave birth", "recently delivered", "after delivery"]),
    ("postpartum_heavy_bleeding", ["প্রসবের পর অতিরিক্ত রক্ত", "প্রসবের পর প্রচুর রক্ত", "bleeding after delivery", "postpartum bleeding"]),
    ("postpartum_fever", ["প্রসবের পর জ্বর", "fever after delivery", "fever after birth"]),
    ("postpartum_foul_lochia", ["প্রসবের পর দুর্গন্ধ", "foul discharge after delivery", "smelly discharge after birth"]),
    ("breast_pain_fever", ["স্তন লাল হয়ে ব্যথা", "স্তনে ব্যথা ও জ্বর", "red painful breast", "mastitis"]),
    ("postpartum_sadness", ["প্রসবের পর মন খারাপ", "বাচ্চা হওয়ার পর কান্না", "sad after birth", "depressed after delivery", "postpartum sad"]),
    # menopause / perimenopause
    ("hot_flashes", ["হট ফ্ল্যাশ", "হঠাৎ শরীর গরম", "গরম লাগে হঠাৎ", "hot flash", "hot flush"]),
    ("night_sweats", ["রাতে ঘাম", "night sweat"]),
    ("vaginal_dryness", ["যোনিপথে শুষ্ক", "যোনি শুষ্ক", "vaginal dryness", "dryness down there"]),
    ("menopause_mood_changes", ["মাঝবয়সে মেজাজ", "ঘুমের সমস্যা", "mid-life mood", "menopause mood"]),
]

# lightweight negation cues near a trigger
_NEG = ["না", "নেই", "নয়", "not ", "no ", "without", "don't", "doesn't"]


class MockGemmaBackend(GemmaBackend):
    """
    Rule-based stand-in for Gemma. Good enough to demo the end-to-end flow and to
    unit-test the orchestrator without any model. NOT linguistically complete — the
    real Ollama/Gemma backend replaces this for the actual submission.
    """
    name = "mock"

    def extract_symptoms(self, conversation: str, known_profile: dict) -> dict:
        text = conversation
        low = text.lower()
        out: dict = {}

        # age: "বয়স ২৪", "24 years", "২৪ বছর"
        m = re.search(r"(?:বয়স|age)\D{0,4}([০-৯0-9]{1,3})", text)
        if not m:
            m = re.search(r"([০-৯0-9]{1,3})\s*(?:বছর|years?)", text)
        if m:
            out["age"] = _to_int(m.group(1))

        if "গর্ভবতী" in text and not any(n in text for n in ["গর্ভবতী নই", "গর্ভবতী না"]):
            # explicit "I am pregnant" also implies pregnancy is possible/present
            out["is_pregnant_possible"] = True

        for field, kws in _TRIGGERS:
            for kw in kws:
                idx = low.find(kw.lower())
                if idx == -1:
                    continue
                # crude negation: any negation cue within ~12 chars after the keyword
                tail = low[idx + len(kw): idx + len(kw) + 14]
                if any(n in tail for n in _NEG):
                    out[field] = False
                else:
                    out[field] = True
                break

        # if actively describing this period / bleeding now
        if any(w in text for w in ["মাসিক হচ্ছে", "পিরিয়ড চলছে", "রক্ত যাচ্ছে"]) or "on my period" in low:
            out.setdefault("bleeding_now", True)

        return {k: v for k, v in out.items() if known_profile.get(k) != v}

    def explain_triage(self, triage_result: dict) -> str:
        urgency = triage_result.get("urgency", "info")
        lines: list[str] = []

        if urgency == "emergency":
            lines.append("⚠️ **এটি জরুরি অবস্থা হতে পারে।**\n")
            for rf in triage_result.get("red_flags", []):
                lines.append(f"• {rf['message_bn']}")
                lines.append(f"  👉 {rf['action_bn']}")
            lines.append(f"\n📞 জরুরি প্রয়োজনে কল করুন: **{triage_result.get('emergency_number_bd', '999')}**")
        else:
            label = triage_result.get("urgency_label_bn", "")
            if label:
                lines.append(f"**{label}**\n")

            for rf in triage_result.get("red_flags", []):
                lines.append(f"• {rf['message_bn']} — {rf['action_bn']}")

            conds = triage_result.get("suspected_conditions", [])
            if conds:
                lines.append("আপনার বর্ণনা শুনে নিচের বিষয়গুলো একজন ডাক্তারের সাথে আলোচনা করা ভালো "
                             "(এটি নিশ্চিত রোগ নির্ণয় নয়):\n")
                for c in conds:
                    lines.append(f"**• {c['name_bn']}** — {c['about_bn']}")
                    if c.get("self_care_bn"):
                        lines.append("  যা করতে পারেন:")
                        for tip in c["self_care_bn"]:
                            lines.append(f"    - {tip}")
                    if c.get("see_doctor_bn"):
                        lines.append(f"  🩺 {c['see_doctor_bn']}")
                    lines.append("")
            elif urgency == "info":
                lines.append("আপনার বর্ণনায় এই মুহূর্তে বিপদের কোনো লক্ষণ পাওয়া যায়নি। "
                             "তবে কোনো দুশ্চিন্তা থাকলে নির্দ্বিধায় জিজ্ঞাসা করুন।")

        # optional ML risk signals (support only)
        signals = [s for s in triage_result.get("risk_signals", []) if s.get("elevated")]
        if signals:
            lines.append("\n📊 আপনার উপসর্গের ভিত্তিতে একটি সহায়ক ঝুঁকি-ইঙ্গিত "
                         "(নিশ্চিত রোগ নয়, শুধু ডাক্তার দেখানোর তাগিদ):")
            for s in signals:
                pct = int(round(s["probability"] * 100))
                lines.append(f"  • {s['name_bn']}: ~{pct}% ইঙ্গিত — একজন ডাক্তারের সাথে যাচাই করুন।")

        hotline = triage_result.get("health_hotline_bd")
        if hotline:
            lines.append(f"\n☎️ স্বাস্থ্য পরামর্শের জন্য বিনামূল্যে কল করতে পারেন: {hotline}")
        if triage_result.get("disclaimer_bn"):
            lines.append(f"\nℹ️ {triage_result['disclaimer_bn']}")
        return "\n".join(lines)

    def bust_myth(self, belief: str, fact: str = "") -> str:
        if fact:
            return f"আপনি যা শুনেছেন তা অনেকেই বিশ্বাস করেন, তবে আসল তথ্যটি হলো: {fact}"
        return ("এই বিষয়ে অনেক ভুল ধারণা প্রচলিত আছে। নির্ভরযোগ্য তথ্যের জন্য একজন "
                "স্বাস্থ্যকর্মী বা ডাক্তারের সাথে কথা বলুন — লজ্জার কিছু নেই।")


# =============================================================================
# Real backend — local Gemma 4 via Ollama.
# =============================================================================
class OllamaBackend(GemmaBackend):
    """
    Calls a local Gemma 4 model served by Ollama.

    Setup:
        ollama pull gemma4:e4b      # 9.6GB, laptop-friendly; or gemma4:12b / gemma4:31b
        ollama serve                # usually already running
        export SHOKHI_BACKEND=ollama
        export SHOKHI_GEMMA_MODEL=gemma4:e4b

    Uses the /api/chat endpoint. extract_symptoms() asks for JSON and parses it
    defensively (Gemma may wrap it in prose / code fences).
    """
    name = "ollama"

    def __init__(self, model: str = DEFAULT_MODEL, host: str = OLLAMA_HOST):
        self.model = model
        self.host = host.rstrip("/")
        import requests  # deferred so the mock path needs no dependency
        self._requests = requests

    # --- low-level chat call --------------------------------------------------
    def _chat(self, system: str, user: str, temperature: float = 0.3,
              fmt: str | None = None) -> str:
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "stream": False,
            "options": {"temperature": temperature},
        }
        if fmt:  # Ollama supports format="json" for structured output
            payload["format"] = fmt
        resp = self._requests.post(f"{self.host}/api/chat", json=payload, timeout=120)
        resp.raise_for_status()
        return resp.json()["message"]["content"].strip()

    @staticmethod
    def _parse_json(text: str) -> dict:
        """Pull the first JSON object out of a model response, defensively."""
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(0))
            except json.JSONDecodeError:
                return {}
        return {}

    # --- three jobs -----------------------------------------------------------
    def extract_symptoms(self, conversation: str, known_profile: dict) -> dict:
        user = prompts.EXTRACT_USER_TEMPLATE.format(
            conversation=conversation,
            known_profile=json.dumps(known_profile, ensure_ascii=False),
        )
        raw = self._chat(prompts.EXTRACT_SYSTEM, user, temperature=0.0, fmt="json")
        data = self._parse_json(raw)

        # keep only known fields, coerce, drop values equal to what we already have
        allowed = set(prompts.SYMPTOM_FIELDS)
        out: dict = {}
        for k, v in data.items():
            if k not in allowed:
                continue
            if k == "age":
                try:
                    v = int(v)
                except (TypeError, ValueError):
                    continue
            elif isinstance(v, str):
                if v.lower() in ("true", "yes", "হ্যাঁ"):
                    v = True
                elif v.lower() in ("false", "no", "না"):
                    v = False
            if known_profile.get(k) != v:
                out[k] = v
        return out

    def explain_triage(self, triage_result: dict) -> str:
        user = prompts.EXPLAIN_USER_TEMPLATE.format(
            triage_result=json.dumps(triage_result, ensure_ascii=False),
        )
        return self._chat(prompts.EXPLAIN_SYSTEM, user, temperature=0.4)

    def bust_myth(self, belief: str, fact: str = "") -> str:
        user = prompts.MYTH_USER_TEMPLATE.format(belief=belief, fact=fact or "N/A")
        return self._chat(prompts.MYTH_SYSTEM, user, temperature=0.4)

    def explain_guide(self, guide: dict, question: str = "") -> str:
        user = prompts.GUIDE_USER_TEMPLATE.format(
            guide=json.dumps(guide, ensure_ascii=False), question=question or "N/A")
        return self._chat(prompts.GUIDE_SYSTEM, user, temperature=0.4)


# =============================================================================
# Real backend — hosted Gemma 4 via Google AI Studio API (no download, API key).
# =============================================================================
class GeminiApiBackend(GemmaBackend):
    """
    Calls a hosted Gemma 4 model through Google AI Studio (the google-genai SDK) using
    an API key — just like using OpenAI's API, nothing to download.

    Setup:
        pip install google-genai
        export GOOGLE_API_KEY=your_ai_studio_key      # same key that works for Gemini
        export SHOKHI_BACKEND=gemini
        export SHOKHI_GEMMA_MODEL=gemma-4-26b-a4b-it   # or gemma-4-31b-it (flagship)

    Gemma models on AI Studio don't take a separate system role, so we prepend the
    system instruction to the user turn. Responses are parsed defensively for JSON.
    """
    name = "gemini"

    def __init__(self, model: str | None = None, api_key: str | None = None,
                 audio_model: str | None = None):
        self.model = model or os.environ.get("SHOKHI_GEMMA_MODEL", "gemma-4-26b-a4b-it")
        # Native audio lives in the E-series (E2B/E4B). Configurable, defaults to E4B.
        self.audio_model = audio_model or os.environ.get(
            "SHOKHI_GEMMA_AUDIO_MODEL", "gemma-4-e4b-it")
        key = api_key or os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
        if not key:
            raise RuntimeError(
                "No API key. Set GOOGLE_API_KEY (get one free at aistudio.google.com)."
            )
        from google import genai  # deferred so other backends need no SDK
        self._client = genai.Client(api_key=key)

    def _generate(self, system: str, user: str, temperature: float = 0.3) -> str:
        from google.genai import types
        prompt = f"{system}\n\n{user}"
        resp = self._client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(temperature=temperature),
        )
        return (resp.text or "").strip()

    # reuse Ollama's defensive JSON parser
    _parse_json = staticmethod(OllamaBackend._parse_json)

    def extract_symptoms(self, conversation: str, known_profile: dict) -> dict:
        user = prompts.EXTRACT_USER_TEMPLATE.format(
            conversation=conversation,
            known_profile=json.dumps(known_profile, ensure_ascii=False),
        )
        raw = self._generate(prompts.EXTRACT_SYSTEM, user, temperature=0.0)
        data = self._parse_json(raw)
        allowed = set(prompts.SYMPTOM_FIELDS)
        out: dict = {}
        for k, v in data.items():
            if k not in allowed:
                continue
            if k == "age":
                try:
                    v = int(v)
                except (TypeError, ValueError):
                    continue
            elif isinstance(v, str):
                if v.lower() in ("true", "yes", "হ্যাঁ"):
                    v = True
                elif v.lower() in ("false", "no", "না"):
                    v = False
            if known_profile.get(k) != v:
                out[k] = v
        return out

    def explain_triage(self, triage_result: dict) -> str:
        user = prompts.EXPLAIN_USER_TEMPLATE.format(
            triage_result=json.dumps(triage_result, ensure_ascii=False),
        )
        return self._generate(prompts.EXPLAIN_SYSTEM, user, temperature=0.4)

    def bust_myth(self, belief: str, fact: str = "") -> str:
        user = prompts.MYTH_USER_TEMPLATE.format(belief=belief, fact=fact or "N/A")
        return self._generate(prompts.MYTH_SYSTEM, user, temperature=0.4)

    def explain_guide(self, guide: dict, question: str = "") -> str:
        user = prompts.GUIDE_USER_TEMPLATE.format(
            guide=json.dumps(guide, ensure_ascii=False), question=question or "N/A")
        return self._generate(prompts.GUIDE_SYSTEM, user, temperature=0.4)

    # --- native audio: speech -> text, through Gemma 4 itself -----------------
    def supports_audio(self) -> bool:
        return True

    def transcribe_audio(self, audio_bytes: bytes, mime_type: str = "audio/wav") -> str:
        """
        Use Gemma 4's native audio (E-series) to transcribe spoken Bangla/English to
        text — no separate speech-to-text library, keeping Gemma the only model even
        for the voice path. The transcript is then fed into the normal pipeline.
        """
        from google.genai import types
        resp = self._client.models.generate_content(
            model=self.audio_model,
            contents=[
                prompts.TRANSCRIBE_INSTRUCTION,
                types.Part.from_bytes(data=audio_bytes, mime_type=mime_type),
            ],
        )
        return (resp.text or "").strip()


# =============================================================================
# Factory
# =============================================================================
_BACKENDS = {
    "mock": MockGemmaBackend,
    "ollama": OllamaBackend,     # local Gemma 4 (offline, download)
    "gemini": GeminiApiBackend,  # hosted Gemma 4 (API key, no download)
}


def get_backend(name: str | None = None) -> GemmaBackend:
    """Return a backend instance. Defaults to env SHOKHI_BACKEND or 'mock'."""
    name = name or os.environ.get("SHOKHI_BACKEND", "mock")
    if name not in _BACKENDS:
        raise ValueError(f"Unknown backend '{name}'. Options: {list(_BACKENDS)}")
    return _BACKENDS[name]()
