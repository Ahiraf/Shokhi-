"""
Tests for Shokhi's deterministic triage/safety engine.

A tiny zero-dependency runner (like the rest of the project) so it can run anywhere
with just `python3 test_triage.py`. The safety layer is the most important thing to
test: it must never DOWNGRADE an emergency, and must fire the right suspicions.
"""

import triage as T

KB = T.load_knowledge()
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


def run(profile):
    return T.triage(profile, KB)


# --- emergencies --------------------------------------------------------------
def test_pregnancy_plus_severe_pain_is_emergency():
    r = run({"is_pregnant_possible": True, "severe_pelvic_pain": True})
    check("test_pregnancy_plus_severe_pain_is_emergency",
          r["urgency"] == "emergency" and any(f["id"] == "ectopic_risk" for f in r["red_flags"]))


def test_heavy_bleeding_plus_faint_is_emergency():
    r = run({"heavy_bleeding": True, "fainting_or_dizzy": True})
    check("test_heavy_bleeding_plus_faint_is_emergency", r["urgency"] == "emergency")


def test_fever_plus_severe_pain_is_emergency():
    r = run({"fever": True, "severe_pelvic_pain": True})
    check("test_fever_plus_severe_pain_is_emergency", r["urgency"] == "emergency")


def test_emergency_beats_condition_suspicion():
    # PCOS-ish signals AND an emergency -> must still be emergency, never downgraded.
    r = run({
        "cycles_irregular": True, "excess_hair": True,
        "is_pregnant_possible": True, "severe_pelvic_pain": True,
    })
    check("test_emergency_beats_condition_suspicion", r["urgency"] == "emergency")


def test_pregnancy_convulsions_is_emergency():
    r = run({"pregnancy_convulsions": True})
    check("test_pregnancy_convulsions_is_emergency",
          r["urgency"] == "emergency" and any(f["id"] == "eclampsia" for f in r["red_flags"]))


def test_preeclampsia_signs_are_emergency():
    r = run({"is_pregnant": True, "pregnancy_severe_headache": True})
    check("test_preeclampsia_signs_are_emergency",
          r["urgency"] == "emergency" and any(f["id"] == "preeclampsia" for f in r["red_flags"]))


def test_pregnant_alone_is_not_preeclampsia():
    # is_pregnant with no danger sign must NOT fire the preeclampsia (any-clause) flag
    r = run({"is_pregnant": True})
    check("test_pregnant_alone_is_not_preeclampsia",
          not any(f["id"] == "preeclampsia" for f in r["red_flags"]))


def test_pregnancy_bleeding_is_emergency():
    r = run({"is_pregnant": True, "pregnancy_bleeding": True})
    check("test_pregnancy_bleeding_is_emergency",
          r["urgency"] == "emergency" and any(f["id"] == "pregnancy_bleeding" for f in r["red_flags"]))


def test_reduced_fetal_movement_is_emergency():
    r = run({"is_pregnant": True, "reduced_fetal_movement": True})
    check("test_reduced_fetal_movement_is_emergency", r["urgency"] == "emergency")


def test_postpartum_hemorrhage_is_emergency():
    r = run({"recently_gave_birth": True, "postpartum_heavy_bleeding": True})
    check("test_postpartum_hemorrhage_is_emergency",
          r["urgency"] == "emergency" and any(f["id"] == "postpartum_hemorrhage" for f in r["red_flags"]))


def test_postpartum_fever_is_emergency():
    r = run({"recently_gave_birth": True, "postpartum_fever": True})
    check("test_postpartum_fever_is_emergency", r["urgency"] == "emergency")


# --- see-a-doctor red flags ---------------------------------------------------
def test_postmenopausal_bleeding_flags():
    r = run({"post_menopausal": True, "bleeding_now": True})
    check("test_postmenopausal_bleeding_flags",
          r["urgency"] == "see_doctor_soon" and
          any(f["id"] == "postmenopausal_bleeding" for f in r["red_flags"]))


def test_bleeding_between_periods_flags():
    r = run({"bleeding_between_periods": True})
    check("test_bleeding_between_periods_flags", r["urgency"] == "see_doctor_soon")


# --- condition suspicion ------------------------------------------------------
def test_pcos_suspected():
    r = run({"cycles_irregular": True, "excess_hair": True, "unexplained_weight_gain": True})
    ids = [c["id"] for c in r["suspected_conditions"]]
    check("test_pcos_suspected", "pcos" in ids and r["urgency"] == "see_doctor_soon")


def test_pcos_needs_irregular_cycle():
    # excess hair alone (regular cycles unknown) should NOT flag PCOS (all-clause fails)
    r = run({"excess_hair": True})
    ids = [c["id"] for c in r["suspected_conditions"]]
    check("test_pcos_needs_irregular_cycle", "pcos" not in ids)


def test_endometriosis_suspected():
    r = run({"periods_disrupt_daily_life": True})
    ids = [c["id"] for c in r["suspected_conditions"]]
    check("test_endometriosis_suspected", "endometriosis" in ids and r["urgency"] == "see_doctor_soon")


def test_pms_is_self_care():
    r = run({"pms_mood_symptoms": True})
    ids = [c["id"] for c in r["suspected_conditions"]]
    check("test_pms_is_self_care", "pms" in ids and r["urgency"] == "self_care")


def test_uti_suspected():
    r = run({"painful_urination": True})
    ids = [c["id"] for c in r["suspected_conditions"]]
    check("test_uti_suspected", "uti" in ids and r["urgency"] == "see_doctor_soon")


def test_vaginal_infection_suspected():
    r = run({"genital_itching": True})
    ids = [c["id"] for c in r["suspected_conditions"]]
    check("test_vaginal_infection_suspected", "vaginal_infection" in ids)


def test_anemia_needs_heavy_bleeding():
    # fatigue alone should NOT flag anaemia (all+any: needs a bleeding signal too)
    r = run({"fatigue_weakness": True})
    ids = [c["id"] for c in r["suspected_conditions"]]
    check("test_anemia_needs_heavy_bleeding", "anemia" not in ids)


def test_anemia_suspected():
    r = run({"fatigue_weakness": True, "heavy_bleeding": True})
    ids = [c["id"] for c in r["suspected_conditions"]]
    check("test_anemia_suspected", "anemia" in ids)


def test_menopause_is_self_care():
    r = run({"hot_flashes": True, "night_sweats": True})
    ids = [c["id"] for c in r["suspected_conditions"]]
    check("test_menopause_is_self_care", "menopause" in ids and r["urgency"] == "self_care")


def test_breast_lump_flags_see_doctor():
    r = run({"breast_lump": True})
    check("test_breast_lump_flags_see_doctor",
          r["urgency"] == "see_doctor_soon" and any(f["id"] == "breast_change" for f in r["red_flags"]))


def test_postpartum_depression_suspected():
    r = run({"postpartum_sadness": True})
    ids = [c["id"] for c in r["suspected_conditions"]]
    check("test_postpartum_depression_suspected",
          "postpartum_depression" in ids and r["urgency"] == "see_doctor_soon")


# --- screening & empty --------------------------------------------------------
def test_empty_profile_asks_screening_questions():
    r = run({})
    check("test_empty_profile_asks_screening_questions",
          r["urgency"] == "info" and len(r["outstanding_questions"]) > 0)


def test_missing_field_never_fires_flag():
    # unknown severe_pelvic_pain must not create an emergency
    r = run({"is_pregnant_possible": True})
    check("test_missing_field_never_fires_flag", r["urgency"] != "emergency")


def test_answered_screening_question_disappears():
    r = run({"severe_pelvic_pain": False, "heavy_bleeding": False,
             "fainting_or_dizzy": False, "is_pregnant_possible": False, "fever": False})
    check("test_answered_screening_question_disappears",
          len(r["outstanding_questions"]) == 0)


if __name__ == "__main__":
    for fn in list(globals().values()):
        if callable(fn) and getattr(fn, "__name__", "").startswith("test_"):
            fn()
    print(f"\n{PASS}/{PASS + FAIL} passed")
    if FAIL:
        raise SystemExit(1)
