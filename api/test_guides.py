"""
Tests for Shokhi's health-info guides (contraception, family planning, menopause care,
nutrition/anaemia, first period, menstrual hygiene).

Zero-dependency runner. Verifies guide lookup by id and by free-text keyword, and that
the deterministic explanation is grounded on the knowledge base (no invented content).
"""

from assistant import Assistant
from gemma_backend import get_backend

PASS = 0
FAIL = 0


def check(name, cond):
    global PASS, FAIL
    if cond:
        PASS += 1
        print(f"PASS  {name}")
    else:
        FAIL += 1
        print(f"FAIL  {name}")


def fresh():
    return Assistant(backend=get_backend("mock"))


def test_lists_all_guides():
    a = fresh()
    ids = {g["id"] for g in a.list_guides()}
    check("test_lists_all_guides",
          {"contraception", "family_planning", "menopause_care",
           "nutrition_anemia", "first_period", "menstrual_hygiene",
           "cloth_pad", "how_to_use_pad", "no_pad_emergency"} <= ids)


def test_pad_guides_match_by_keyword():
    a = fresh()
    cloth = a.find_guide("আমি কাপড়ের প্যাড ব্যবহার করি")
    howto = a.find_guide("how to use a pad first time")
    none = a.find_guide("আমার হাতে প্যাড নেই এখন")
    check("test_pad_guides_match_by_keyword",
          cloth is not None and cloth["id"] == "cloth_pad"
          and howto is not None and howto["id"] == "how_to_use_pad"
          and none is not None and none["id"] == "no_pad_emergency")


def test_find_guide_by_id():
    a = fresh()
    g = a.find_guide("contraception")
    check("test_find_guide_by_id", g is not None and g["id"] == "contraception")


def test_find_guide_by_bangla_keyword():
    a = fresh()
    g = a.find_guide("আমি জন্মনিয়ন্ত্রণ নিয়ে জানতে চাই")
    check("test_find_guide_by_bangla_keyword", g is not None and g["id"] == "contraception")


def test_find_guide_by_english_keyword():
    a = fresh()
    g = a.find_guide("tell me about menopause please")
    check("test_find_guide_by_english_keyword", g is not None and g["id"] == "menopause_care")


def test_unknown_topic_returns_none():
    a = fresh()
    check("test_unknown_topic_returns_none", a.explain_guide("football scores") is None)


def test_explain_guide_is_grounded():
    a = fresh()
    res = a.explain_guide("family_planning")
    # the deterministic render must include a real KB point, and never be empty
    g = a.find_guide("family_planning")
    check("test_explain_guide_is_grounded",
          res is not None and g["points_bn"][0] in res["guidance"]
          and res["guide"]["id"] == "family_planning")


if __name__ == "__main__":
    for fn in list(globals().values()):
        if callable(fn) and getattr(fn, "__name__", "").startswith("test_"):
            fn()
    print(f"\n{PASS}/{PASS + FAIL} passed")
    if FAIL:
        raise SystemExit(1)
