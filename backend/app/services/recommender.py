"""
Recommendation Engine - Service 4 of 4

Implements generateRecommendations(patterns) as described in
the project spec (section 12.2, 10.6).

This is a rule-based lookup (not LLM-generated) — pulls the
pre-written before/after code examples and technical explanations
straight from knowledge_base/anti_patterns.json, ordered by severity
(High -> Medium -> Low) so the user fixes the most impactful issues first.
"""

import json
from pathlib import Path

KB_DIR = Path(__file__).resolve().parent.parent / "knowledge_base"

SEVERITY_ORDER = {"High": 0, "Medium": 1, "Low": 2}


def load_pattern_rules() -> dict:
    with open(KB_DIR / "anti_patterns.json", "r", encoding="utf-8") as f:
        return json.load(f)


def generate_recommendations(patterns: list[dict]) -> list[dict]:
    """
    Args:
        patterns: list of detected pattern dicts from analyze_ast(), each with an "id" and "line"

    Returns:
        list of recommendation dicts, sorted by severity (High first), e.g.:
        [
            {
                "id": "nested_loop",
                "name_th": "...",
                "severity": "High",
                "line": 4,
                "before": "...",
                "after": "...",
                "explanation_th": "..."
            },
            ...
        ]
    """
    rules = load_pattern_rules()
    rule_lookup = {p["id"]: p for p in rules["patterns"]}

    recommendations = []
    for pattern in patterns:
        rule = rule_lookup.get(pattern["id"])
        if not rule:
            continue

        recommendations.append({
            "id": rule["id"],
            "name_th": rule["name_th"],
            "severity": rule["severity"],
            "line": pattern.get("line"),
            "before": rule["example"]["before"],
            "after": rule["example"]["after"],
            "explanation_th": rule["example"]["explanation_th"],
        })

    recommendations.sort(key=lambda r: SEVERITY_ORDER.get(r["severity"], 99))
    return recommendations
