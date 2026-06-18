"""
ESCO Backend - FastAPI Application Entry Point

This is the Application Layer described in the project spec.
It exposes a single REST endpoint (POST /analyze) that internally
chains the four core functions:
    1. analyzeAST(code_string)
    2. estimateEnergy(patterns, n, runs_per_day)
    3. calculateEcoScore(patterns, energy)
    4. generateRecommendations(patterns)

Run locally with:
    uvicorn app.main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.services.ast_analyzer import analyze_ast
from app.services.energy_estimator import estimate_energy
from app.services.eco_score import calculate_eco_score
from app.services.recommender import generate_recommendations

app = FastAPI(
    title="ESCO API",
    description="Energy-aware Static Code Analyzer for Python Energy Efficiency and Carbon Impact Assessment",
    version="1.0.0",
)

# CORS: allow the deployed frontend (Vercel) and local dev server to call this API.
# TODO: replace "*" with the exact Vercel URL once deployed, for tighter security.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    code: str = Field(..., description="Python source code submitted by the user")
    n: int = Field(..., gt=0, description="Assumed input size used for energy estimation")
    runs_per_day: int = Field(..., gt=0, description="Assumed number of times the program runs per day")


@app.get("/")
def health_check():
    return {"status": "ok", "service": "ESCO API"}


@app.post("/analyze")
def analyze(request: AnalyzeRequest):
    """
    Single endpoint that runs the full ESCO pipeline and returns
    everything the frontend needs for all four screens in one response.
    """
    # Step 1: AST analysis -> detect anti-patterns
    ast_result = analyze_ast(request.code)

    if ast_result.get("error"):
        return {"error": ast_result["error"]}

    patterns = ast_result["patterns"]

    # Step 2: Energy + carbon estimation
    energy_result = estimate_energy(patterns, request.n, request.runs_per_day)

    # Step 3: Eco-Score calculation
    eco_score_result = calculate_eco_score(patterns, energy_result)

    # Step 4: Recommendations (before/after + explanations)
    recommendations = generate_recommendations(patterns)

    return {
        "patterns": patterns,
        "energy": energy_result,
        "eco_score": eco_score_result,
        "recommendations": recommendations,
    }
