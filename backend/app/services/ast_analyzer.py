"""
AST Analysis Engine - Service 1 of 4

Implements analyzeAST(code_string) as described in the project spec (section 12.2).

Responsibility:
    - Parse the user's Python code into an AST using ast.parse()
    - Traverse the tree using ast.walk()
    - Detect the 5 Energy Anti-patterns defined in knowledge_base/anti_patterns.json
    - Return detected patterns with line number, pattern type, and severity
    - If the code has a syntax error, return an error message instead

This file is currently a skeleton. Each detection rule should be implemented
as a small, testable function so it can be unit tested against known
before/after code samples before wiring it into the API.
"""

import ast
import json
from pathlib import Path

KNOWLEDGE_BASE_PATH = Path(__file__).resolve().parent.parent / "knowledge_base" / "anti_patterns.json"


def load_pattern_rules() -> dict:
    with open(KNOWLEDGE_BASE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def analyze_ast(code_string: str) -> dict:
    """
    Parses code_string into an AST and detects all 5 anti-patterns.

    Returns:
        {
            "patterns": [
                {
                    "id": "nested_loop",
                    "line": 4,
                    "severity": "High"
                },
                ...
            ]
        }
        or
        {
            "error": "SyntaxError: ..."
        }
    """
    try:
        tree = ast.parse(code_string)
    except SyntaxError as e:
        return {"error": f"SyntaxError: {e}"}

    detected_patterns = []

    detected_patterns += _detect_nested_loop(tree)
    detected_patterns += _detect_string_concat_in_loop(tree)
    detected_patterns += _detect_range_len_pattern(tree)
    detected_patterns += _detect_repeated_func_call_in_loop(tree)
    detected_patterns += _detect_global_var_access_in_loop(tree)

    return {"patterns": detected_patterns}


# --- Detection rule stubs (implement one at a time, test each in isolation) ---

def _detect_nested_loop(tree: ast.AST) -> list[dict]:
    """Find ast.For nodes whose body contains another ast.For node."""
    findings = []
    for node in ast.walk(tree):
        if isinstance(node, ast.For):
            for inner in ast.walk(node):
                if inner is not node and isinstance(inner, ast.For):
                    findings.append({
                        "id": "nested_loop",
                        "line": node.lineno,
                        "severity": "High",
                    })
                    break  # avoid duplicate findings for the same outer loop
    return findings


def _detect_string_concat_in_loop(tree: ast.AST) -> list[dict]:
    """TODO: detect ast.AugAssign(op=Add) on string-like targets inside loops."""
    return []


def _detect_range_len_pattern(tree: ast.AST) -> list[dict]:
    """TODO: detect for i in range(len(x)) pattern."""
    return []


def _detect_repeated_func_call_in_loop(tree: ast.AST) -> list[dict]:
    """TODO: detect loop-invariant function calls inside loops."""
    return []


def _detect_global_var_access_in_loop(tree: ast.AST) -> list[dict]:
    """TODO: detect global variable reads/writes inside loops."""
    return []
