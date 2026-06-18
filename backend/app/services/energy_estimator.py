"""
Energy Estimation Model - Service 2 of 4

Implements estimateEnergy(patterns, n, runs_per_day) as described in
the project spec (section 12.2, 10.3, 10.4).

Formula:
    E = (P_ref * C_factor) * t_ref
    CO2 = E * EF

Reads reference constants (P_ref, t_ref_base, emission factor) from
knowledge_base/reference_constants.json and complexity_multiplier
per pattern from knowledge_base/anti_patterns.json.
"""

import json
from pathlib import Path

KB_DIR = Path(__file__).resolve().parent.parent / "knowledge_base"


def load_reference_constants() -> dict:
    with open(KB_DIR / "reference_constants.json", "r", encoding="utf-8") as f:
        return json.load(f)


def load_pattern_rules() -> dict:
    with open(KB_DIR / "anti_patterns.json", "r", encoding="utf-8") as f:
        return json.load(f)


def estimate_energy(patterns: list[dict], n: int, runs_per_day: int) -> dict:
    """
    Args:
        patterns: list of detected pattern dicts from analyze_ast(), each with an "id"
        n: assumed input size
        runs_per_day: assumed number of runs per day

    Returns:
        {
            "joule_per_run": float,
            "kwh_per_year": float,
            "gco2_per_run": float,
            "gco2_per_year": float,
            "baseline_kwh_per_year": float   # for before/after comparison chart
        }
    """
    constants = load_reference_constants()
    rules = load_pattern_rules()

    p_ref = constants["energy_model"]["P_ref_watts"]
    t_ref_base = constants["energy_model"]["t_ref_base_seconds"]
    baseline_multiplier = constants["energy_model"]["baseline_multiplier"]
    emission_factor = constants["carbon_model"]["emission_factor_kgco2_per_kwh"]

    # TODO: decide how multiple detected patterns combine into a single C_factor.
    # Simple starting approach: take the highest multiplier among detected patterns,
    # or sum them — needs a decision once detection rules are implemented and tested.
    c_factor = _combine_complexity_multipliers(patterns, rules)

    t_ref = t_ref_base * n  # TODO: scale exponent should depend on detected complexity class

    joule_per_run = p_ref * c_factor * t_ref
    kwh_per_year = (joule_per_run * runs_per_day * 365) / 3_600_000

    gco2_per_run = (joule_per_run / 3_600_000) * emission_factor * 1000
    gco2_per_year = kwh_per_year * emission_factor * 1000

    # Baseline (no anti-patterns) for comparison
    baseline_t_ref = t_ref_base * n
    baseline_joule_per_run = p_ref * baseline_multiplier * baseline_t_ref
    baseline_kwh_per_year = (baseline_joule_per_run * runs_per_day * 365) / 3_600_000

    return {
        "joule_per_run": round(joule_per_run, 6),
        "kwh_per_year": round(kwh_per_year, 6),
        "gco2_per_run": round(gco2_per_run, 6),
        "gco2_per_year": round(gco2_per_year, 6),
        "baseline_kwh_per_year": round(baseline_kwh_per_year, 6),
    }


def _combine_complexity_multipliers(patterns: list[dict], rules: dict) -> float:
    if not patterns:
        return 1.0  # baseline_multiplier, no anti-patterns detected

    multiplier_lookup = {p["id"]: p["complexity_multiplier"] for p in rules["patterns"]}
    detected_multipliers = [multiplier_lookup[p["id"]] for p in patterns if p["id"] in multiplier_lookup]

    if not detected_multipliers:
        return 1.0

    # TODO: placeholder strategy — take the max. Revisit once energy model is validated.
    return max(detected_multipliers)
