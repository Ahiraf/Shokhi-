"""
Shokhi (সখী) — Streamlit web app.

A warm Bangla women's health companion for all women, from urban teens to rural
women who may not read. One Gemma brain, a browser front door that works on any
phone — with a VOICE path (speak Bangla, hear Bangla back) so literacy is not
required. The same core is designed to power an IVR phone hotline in production.

Run:
    pip install -r requirements.txt
    streamlit run app/streamlit_app.py

Backends: mock (default, offline) or ollama (local Gemma 4):
    SHOKHI_BACKEND=ollama SHOKHI_GEMMA_MODEL=gemma4 streamlit run app/streamlit_app.py
"""

import os
import sys
from pathlib import Path

import streamlit as st

# On Streamlit Community Cloud, config lives in st.secrets, not env vars. Copy any
# Shokhi/Google settings into the environment BEFORE the backend factory reads them.
for _k in ("SHOKHI_BACKEND", "SHOKHI_GEMMA_MODEL", "GOOGLE_API_KEY", "OLLAMA_HOST"):
    try:
        if _k in st.secrets:
            os.environ.setdefault(_k, str(st.secrets[_k]))
    except Exception:
        pass

# make src/ importable
SRC = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(SRC))

from assistant import Assistant           # noqa: E402
from gemma_backend import get_backend      # noqa: E402
import triage as triage_engine             # noqa: E402

st.set_page_config(page_title="সখী · Shokhi", page_icon="🌸", layout="centered")

# ---------------- theme ----------------
st.markdown("""
<style>
:root { --rose:#b5175f; --rose-soft:#fce7f0; --plum:#7a1246; }
.stApp { background: linear-gradient(180deg,#fff5f9 0%, #ffffff 60%); }
h1,h2,h3 { color: var(--plum); }
.badge { display:inline-block; padding:3px 10px; border-radius:12px; font-size:0.8rem;
         background:var(--rose-soft); color:var(--plum); margin-right:6px; }
.card { border:1px solid #f2c6db; border-radius:14px; padding:14px 16px; margin:10px 0;
        background:#fffafc; }
.emergency { border:2px solid #d11507; background:#fff2f0; }
.soon { border-left:6px solid #e07b00; }
.ok { border-left:6px solid #2e9e5b; }
.small { color:#8a5b71; font-size:0.85rem; }
</style>
""", unsafe_allow_html=True)

# ---------------- state ----------------
if "assistant" not in st.session_state:
    st.session_state.assistant = Assistant(backend=get_backend())
    st.session_state.chat = []   # list of (role, text)
a: Assistant = st.session_state.assistant

URGENCY_STYLE = {
    "emergency": ("emergency", "🚨"),
    "see_doctor_soon": ("soon", "🩺"),
    "self_care": ("ok", "🌿"),
    "info": ("card", "💬"),
}

# ---------------- header ----------------
st.markdown("# 🌸 সখী · Shokhi")
st.markdown("<span class='badge'>নারীর স্বাস্থ্য-সহায়ক</span>"
            "<span class='badge'>মাসিক · পিসিওএস · পিএমএস · এন্ডোমেট্রিওসিস</span>"
            "<span class='badge'>Powered by Gemma 4</span>", unsafe_allow_html=True)
st.markdown("<p class='small'>শহরের কিশোরী থেকে গ্রামের নারী — সবার জন্য। বাংলায় লিখুন বা বলুন। "
            "সখী ডাক্তার নয়, একজন বন্ধু। জরুরি অবস্থায় সবসময় ডাক্তার/৯৯৯।</p>",
            unsafe_allow_html=True)

backend_name = a.backend.name
st.caption(f"🧠 Gemma backend: **{backend_name}**" +
           ("  ·  (mock = offline demo; set SHOKHI_BACKEND=ollama for live Gemma 4)"
            if backend_name == "mock" else ""))

# ---------------- sidebar: symptom checklist + voice ----------------
with st.sidebar:
    st.header("🔎 উপসর্গ চেকলিস্ট")
    st.caption("যাদের পড়তে/লিখতে অসুবিধা, তাঁরা ঘরের লোক/স্বাস্থ্যকর্মীর সাহায্যে টিক দিতে পারেন।")
    schema = a.knowledge["symptom_schema"]
    with st.form("symptom_form"):
        picks = {}
        for fld, meta in schema.items():
            if meta["type"] != "bool":
                continue
            picks[fld] = st.checkbox(meta["desc_bn"], value=bool(a.profile.get(fld)))
        age = st.number_input("বয়স", min_value=0, max_value=120,
                              value=int(a.profile.get("age") or 0))
        if st.form_submit_button("যাচাই করুন"):
            a.set_symptoms(**{k: v for k, v in picks.items() if v})
            if age:
                a.profile["age"] = int(age)
            st.session_state.chat.append(("assistant", a.explain()))

    st.divider()
    st.subheader("🎙️ কণ্ঠে বলুন")
    st.caption("গ্রামের নারীদের জন্য কণ্ঠই মূল পথ। বাংলায় বলুন — Gemma 4-এর নিজস্ব অডিও "
               "ক্ষমতা (E-series) দিয়েই কণ্ঠ বুঝে নেওয়া হয়, আলাদা STT লাগে না।")
    audio = st.audio_input("রেকর্ড করুন")
    if audio is not None:
        if a.backend.supports_audio():
            if st.button("🎤 Gemma দিয়ে বুঝুন"):
                try:
                    transcript = a.backend.transcribe_audio(audio.getvalue(), "audio/wav")
                    if transcript:
                        st.session_state.pending_voice = transcript
                        st.rerun()
                    else:
                        st.warning("কিছু বোঝা গেল না, আবার বলুন।")
                except Exception as e:
                    st.error(f"অডিও বোঝায় সমস্যা: {e}")
        else:
            st.info("🔊 কণ্ঠ পাওয়া গেছে। লাইভ Gemma 4 (SHOKHI_BACKEND=gemini) চালু করলে এটি "
                    "সরাসরি Gemma-র অডিও দিয়ে লেখায় রূপান্তরিত হবে। (এখন mock — নিচে লিখে দেখুন।)")

    st.divider()
    if st.button("🔄 নতুন করে শুরু"):
        st.session_state.assistant = Assistant(backend=get_backend())
        st.session_state.chat = []
        st.rerun()

# ---------------- examples ----------------
st.markdown("##### একটি উদাহরণ দিয়ে শুরু করুন")
examples = [
    ("PCOS", "আমার বয়স ২৩, মাসিক খুব অনিয়মিত, মুখে অতিরিক্ত লোম উঠছে আর ওজন বেড়ে যাচ্ছে।"),
    ("এন্ডোমেট্রিওসিস", "মাসিকের সময় এত ব্যথা হয় যে আমি স্কুলে/কাজে যেতে পারি না।"),
    ("জরুরি", "আমার প্রচণ্ড তলপেটে ব্যথা আর আমি গর্ভবতী হতে পারি।"),
    ("পিএমএস", "মাসিকের আগে মেজাজ খারাপ থাকে আর পেট ফাঁপা লাগে।"),
]
cols = st.columns(len(examples))
clicked = None
for c, (label, text) in zip(cols, examples):
    if c.button(label):
        clicked = text

# ---------------- chat ----------------
for role, text in st.session_state.chat:
    with st.chat_message("user" if role == "user" else "assistant",
                         avatar="🙋‍♀️" if role == "user" else "🌸"):
        st.markdown(text)

user_text = (st.chat_input("এখানে বাংলায় লিখুন...") or clicked
             or st.session_state.pop("pending_voice", None))

if user_text:
    st.session_state.chat.append(("user", user_text))
    with st.chat_message("user", avatar="🙋‍♀️"):
        st.markdown(user_text)

    a.add_user_message(user_text)
    result = a.triage()

    with st.chat_message("assistant", avatar="🌸"):
        style, icon = URGENCY_STYLE.get(result["urgency"], ("card", "💬"))
        st.markdown(
            f"<div class='card {style}'><b>{icon} {result['urgency_label_bn']}</b></div>",
            unsafe_allow_html=True,
        )
        # emergency red flags up top, loud
        for rf in result["red_flags"]:
            st.error(f"**{rf['name_bn']}** — {rf['action_bn']}")

        guidance = a.explain()
        st.markdown(guidance)
        st.session_state.chat.append(("assistant", guidance))

        # optional ML support signal (never overrides urgency; Gemma stays primary)
        for s in result.get("risk_signals", []):
            if s.get("elevated"):
                st.progress(min(s["probability"], 1.0),
                            text=f"📊 সহায়ক ইঙ্গিত — {s['name_bn']}: ~{int(s['probability']*100)}% "
                                 f"(ML support, AUC {s['auc']}). নিশ্চিত রোগ নয় — ডাক্তার দেখান।")

        # a still-unanswered screening question keeps the conversation safe
        q = a.next_question()
        if q and result["urgency"] != "emergency":
            st.info(f"❓ আরও নিশ্চিত হতে জানান: {q}")

        # optional: read the guidance aloud (accessibility for low-literacy users)
        if st.checkbox("🔊 শুনতে চাই (কণ্ঠে)", key=f"tts_{len(st.session_state.chat)}"):
            try:
                from gtts import gTTS
                import io
                buf = io.BytesIO()
                gTTS(text=guidance, lang="bn").write_to_fp(buf)
                st.audio(buf.getvalue(), format="audio/mp3")
            except Exception:
                st.caption("(কণ্ঠ শোনাতে `pip install gTTS` প্রয়োজন; ইন্টারনেট লাগবে।)")

# ---------------- footer ----------------
st.divider()
meta = a.knowledge["meta"]
st.caption(f"⚠️ {meta['disclaimer_bn']}")
st.caption(f"📞 জরুরি: {meta['emergency_number_bd']}  ·  ☎️ স্বাস্থ্য বাতায়ন: {meta['health_hotline_bd']}")
