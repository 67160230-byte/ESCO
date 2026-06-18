// Centralized API client. All 4 pages read from one shared analysis result,
// so we only ever call POST /analyze once per user submission.

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://esco-backend-h4v2.onrender.com";

export async function analyzeCode(code, n, runsPerDay) {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, n, runs_per_day: runsPerDay }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
