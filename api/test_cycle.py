"""
Tests for Shokhi's cycle-tracking analysis (cycle.py).

Zero-dependency runner. The analysis must be stable and conservative: it computes
patterns (average length, regularity, next estimate) and may *suggest* symptom flags,
but it never diagnoses and never crashes on sparse/messy input.
"""

from datetime import date

import cycle as C

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


def test_empty_is_safe():
    r = C.analyze([])
    check("test_empty_is_safe", r["logged_count"] == 0 and r["avg_cycle_length"] is None
          and len(r["insights_bn"]) >= 1)


def test_single_log_asks_for_more():
    r = C.analyze([{"start": "2026-06-01"}])
    check("test_single_log_asks_for_more", r["avg_cycle_length"] is None)


def test_regular_28_day_cycle():
    logs = [{"start": "2026-01-01"}, {"start": "2026-01-29"}, {"start": "2026-02-26"}]
    r = C.analyze(logs, today=date(2026, 3, 1))
    check("test_regular_28_day_cycle",
          r["avg_cycle_length"] == 28 and r["regular"] is True
          and "cycles_irregular" not in r["suggested_symptoms"])


def test_predicts_next_start():
    logs = [{"start": "2026-01-01"}, {"start": "2026-01-29"}]
    r = C.analyze(logs, today=date(2026, 2, 1))
    check("test_predicts_next_start", r["predicted_next_start"] == "2026-02-26")


def test_long_irregular_flags_pcos_hint():
    logs = [{"start": "2026-01-01"}, {"start": "2026-02-20"}, {"start": "2026-04-15"}]
    r = C.analyze(logs, today=date(2026, 5, 1))
    check("test_long_irregular_flags_pcos_hint",
          r["avg_cycle_length"] > 35 and r["regular"] is False
          and r["suggested_symptoms"].get("cycles_irregular") is True
          and any("পিসিওএস" in i for i in r["insights_bn"]))


def test_long_gap_suggests_missed_periods():
    logs = [{"start": "2026-01-01"}, {"start": "2026-01-29"}]
    r = C.analyze(logs, today=date(2026, 6, 1))  # ~4 months since last start
    check("test_long_gap_suggests_missed_periods",
          r["suggested_symptoms"].get("missed_periods_3plus") is True)


def test_repeated_severe_pain_flag():
    logs = [{"start": "2026-01-01", "pain": 3}, {"start": "2026-01-29", "pain": 3}]
    r = C.analyze(logs, today=date(2026, 2, 1))
    check("test_repeated_severe_pain_flag",
          r["suggested_symptoms"].get("periods_disrupt_daily_life") is True)


def test_bad_dates_are_ignored():
    logs = [{"start": "not-a-date"}, {"start": "2026-01-01"}, {"start": "2026-01-29"}]
    r = C.analyze(logs, today=date(2026, 2, 1))
    check("test_bad_dates_are_ignored", r["logged_count"] == 2 and r["avg_cycle_length"] == 28)


if __name__ == "__main__":
    for fn in list(globals().values()):
        if callable(fn) and getattr(fn, "__name__", "").startswith("test_"):
            fn()
    print(f"\n{PASS}/{PASS + FAIL} passed")
    if FAIL:
        raise SystemExit(1)
