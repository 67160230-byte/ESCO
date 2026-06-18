"""
Eco-Score Calculation - Service 3 of 4

Implements calculateEcoScore(patterns, energy) as described in
the project spec (section 12.2, 10.5).

Combines:
    - structural_score: deduct points based on count + severity weight of detected patterns
    - energy_score: compare estimated energy against baseline (no anti-patterns)

Final score maps to grade A-F using thresholds from
knowledge_base/reference_constants.json.
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


def calculate_eco_score(patterns: list[dict], energy: dict) -> dict:
    """
    Args:
        patterns: list of detected pattern dicts from analyze_ast()
        energy: dict returned by estimate_energy(), must include
                 "kwh_per_year" and "baseline_kwh_per_year"

    Returns:
        {
            "grade": "B",
            "total_score": 78.5,
            "structural_score": 80,
            "energy_score": 77,
            "breakdown": [
                {"id": "nested_loop", "points_deducted": 30},
                ...
            ]
        }
    """
    constants = load_reference_constants()
    rules = load_pattern_rules()

    structural_score, breakdown = _calculate_structural_score(patterns, rules)
    energy_score = _calculate_energy_score(energy)

    weights = constants["eco_score_model"]["components"]
    total_score = (
        structural_score * weights["structural_score_weight"]
        + energy_score * weights["energy_score_weight"]
    )

    grade = _map_score_to_grade(total_score, constants["eco_score_model"]["grade_thresholds"])

    return {
        "grade": grade,
        "total_score": round(total_score, 2),
        "structural_score": round(structural_score, 2),
        "energy_score": round(energy_score, 2),
        "breakdown": breakdown,
    }


def _calculate_structural_score(patterns: list[dict], rules: dict) -> tuple[float, list[dict]]:
    weight_lookup = {p["id"]: p["weight_structural"] for p in rules["patterns"]}

    score = 100.0
    breakdown = []
    for pattern in patterns:
        deduction = weight_lookup.get(pattern["id"], 0)
        score -= deduction
        breakdown.append({"id": pattern["id"], "points_deducted": deduction})

    return max(score, 0.0), breakdown


def _calculate_energy_score(energy: dict) -> float:
    actual = energy.get("kwh_per_year", 0)
    baseline = energy.get("baseline_kwh_per_year", 0)

    if baseline == 0:
        return 100.0

    score = 100 - ((actual - baseline) / baseline) * 100
    return max(0.0, min(100.0, score))


def _map_score_to_grade(score: float, thresholds: list[dict]) -> str:
    # thresholds is sorted descending by min_score in the JSON file
    for tier in thresholds:
        if score >= tier["min_score"]:
            return tier["grade"]
    return "F"
