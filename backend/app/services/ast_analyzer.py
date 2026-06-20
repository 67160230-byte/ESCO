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

    # sort by line number so the frontend can display findings top-to-bottom
    detected_patterns.sort(key=lambda p: p["line"])

    return {"patterns": detected_patterns}


# --- Helpers shared across detection rules ---

def _get_loop_bodies(tree: ast.AST):
    """Yield every ast.For / ast.While node found anywhere in the tree."""
    for node in ast.walk(tree):
        if isinstance(node, (ast.For, ast.While)):
            yield node


def _get_module_level_globals(tree: ast.Module) -> set[str]:
    """Collect names assigned at module (top) level — these are 'global' variables."""
    names = set()
    for node in tree.body:
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name):
                    names.add(target.id)
        elif isinstance(node, ast.AnnAssign) and isinstance(node.target, ast.Name):
            names.add(node.target.id)
    return names


# --- Detection rules ---

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
    """
    Detect 'x += <something>' (ast.AugAssign with op=Add) inside a loop body,
    where x was initialized as a string literal somewhere in the module
    (simple heuristic: target name was assigned an ast.Constant(str) at some point,
    or the AugAssign's value side involves a Str/JoinedStr/Call to str()).
    """
    findings = []

    # First pass: find names initialized as strings (e.g. x = "")
    string_var_names = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and isinstance(node.value, ast.Constant) \
                        and isinstance(node.value.value, str):
                    string_var_names.add(target.id)

    for loop in _get_loop_bodies(tree):
        for node in ast.walk(loop):
            if isinstance(node, ast.AugAssign) and isinstance(node.op, ast.Add):
                if isinstance(node.target, ast.Name) and node.target.id in string_var_names:
                    findings.append({
                        "id": "string_concat_loop",
                        "line": node.lineno,
                        "severity": "Medium",
                    })
    return findings


def _detect_range_len_pattern(tree: ast.AST) -> list[dict]:
    """
    Detect 'for i in range(len(x)):' — an ast.For whose iter is a Call to range()
    with a single argument that is itself a Call to len().
    """
    findings = []
    for node in ast.walk(tree):
        if isinstance(node, ast.For):
            iter_call = node.iter
            if isinstance(iter_call, ast.Call) and isinstance(iter_call.func, ast.Name) \
                    and iter_call.func.id == "range" and len(iter_call.args) == 1:
                inner_call = iter_call.args[0]
                if isinstance(inner_call, ast.Call) and isinstance(inner_call.func, ast.Name) \
                        and inner_call.func.id == "len":
                    findings.append({
                        "id": "range_len_pattern",
                        "line": node.lineno,
                        "severity": "Low",
                    })
    return findings


def _detect_repeated_func_call_in_loop(tree: ast.AST) -> list[dict]:
    """
    Detect a function call inside a loop body whose arguments are all loop-invariant
    (constants or Name nodes that are not the loop's own target variable and not
    reassigned anywhere inside the loop body). This is a simplified heuristic —
    it flags calls with zero arguments or with only Name/Constant arguments that
    aren't the loop variable, since those are the clearest "should be hoisted" cases.
    """
    findings = []
    for loop in _get_loop_bodies(tree):
        loop_target_names = set()
        if isinstance(loop, ast.For) and isinstance(loop.target, ast.Name):
            loop_target_names.add(loop.target.id)

        # names reassigned anywhere inside this loop body (can't assume invariant)
        reassigned_in_loop = set()
        for node in ast.walk(loop):
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        reassigned_in_loop.add(target.id)

        for node in ast.walk(loop):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
                args_are_invariant = True
                for arg in node.args:
                    if isinstance(arg, ast.Constant):
                        continue
                    if isinstance(arg, ast.Name) and arg.id not in loop_target_names \
                            and arg.id not in reassigned_in_loop:
                        continue
                    args_are_invariant = False
                    break

                if args_are_invariant and node.func.id not in ("range", "len", "print", "enumerate"):
                    findings.append({
                        "id": "repeated_func_call_loop",
                        "line": node.lineno,
                        "severity": "Medium",
                    })
    return findings


def _detect_global_var_access_in_loop(tree: ast.AST) -> list[dict]:
    """
    Detect a Name node, referencing a module-level global variable, accessed
    (read or written) inside a loop body that is itself inside a function
    (so the access actually goes through LOAD_GLOBAL rather than LOAD_FAST).
    """
    findings = []
    if not isinstance(tree, ast.Module):
        return findings

    global_names = _get_module_level_globals(tree)
    if not global_names:
        return findings

    for func in ast.walk(tree):
        if not isinstance(func, ast.FunctionDef):
            continue

        # names that are local to this function (parameters or locally assigned)
        local_names = {arg.arg for arg in func.args.args}
        for node in ast.walk(func):
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        local_names.add(target.id)

        for loop in _get_loop_bodies(func):
            for node in ast.walk(loop):
                if isinstance(node, ast.Name) and node.id in global_names \
                        and node.id not in local_names:
                    findings.append({
                        "id": "global_var_access_loop",
                        "line": node.lineno,
                        "severity": "Low",
                    })
    return findings
