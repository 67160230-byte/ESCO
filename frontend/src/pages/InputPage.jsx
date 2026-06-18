import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeCode } from "../api/client";

// Screen 1: Input Page
// - code editor with syntax highlighting (Monaco/CodeMirror)
// - fields for n (assumed input size) and runs_per_day
// - toggle button to load a sample with anti-patterns vs. clean code
export default function InputPage() {
  const [code, setCode] = useState("");
  const [n, setN] = useState(10000);
  const [runsPerDay, setRunsPerDay] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeCode(code, n, runsPerDay);
      if (result.error) {
        setError(result.error);
        return;
      }
      // TODO: store result in shared state (Context or simple prop drilling)
      // so EcoScorePage / CodeIssuePage / RecommendationPage can read it.
      sessionStorage.setItem("escoResult", JSON.stringify(result));
      navigate("/eco-score");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>ESCO — วิเคราะห์โค้ด Python</h1>
      {/* TODO: replace textarea with CodeMirror editor component */}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="วางโค้ด Python ที่นี่"
        rows={15}
        style={{ width: "100%", fontFamily: "monospace" }}
      />
      <div>
        <label>
          ขนาด input สมมติ (n):
          <input type="number" value={n} onChange={(e) => setN(Number(e.target.value))} />
        </label>
      </div>
      <div>
        <label>
          จำนวนครั้งที่รันต่อวัน:
          <input
            type="number"
            value={runsPerDay}
            onChange={(e) => setRunsPerDay(Number(e.target.value))}
          />
        </label>
      </div>
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? "กำลังวิเคราะห์..." : "วิเคราะห์"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
