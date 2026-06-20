import { useNavigate } from "react-router-dom";
import { useEsco } from "../context/EscoContext";
import { analyzeCode } from "../api/client";
import { SAMPLE_CODE } from "../api/sampleCode";

export default function InputPage() {
  const { code, setCode, n, setN, runsPerDay, setRunsPerDay, setResult, loading, setLoading, error, setError } = useEsco();
  const navigate = useNavigate();

  async function handleAnalyze() {
    if (!code.trim()) {
      setError("กรุณาวางโค้ด Python ก่อนวิเคราะห์");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeCode(code, n, runsPerDay);
      if (data.error) {
        setError(data.error);
        return;
      }
      setResult(data);
      navigate("/eco-score");
    } catch (err) {
      setError(
        `ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้: ${err.message}. ตรวจสอบว่า backend กำลังรันอยู่และตั้งค่า VITE_API_BASE_URL ถูกต้อง`
      );
    } finally {
      setLoading(false);
    }
  }

  function loadSample(key) {
    setCode(SAMPLE_CODE[key]);
    setError(null);
  }

  return (
    <div>
      <h1 className="page-title">วิเคราะห์โค้ด Python</h1>
      <p className="page-subtitle">
        วางโค้ดของคุณด้านล่าง ระบบจะวิเคราะห์ผ่าน AST โดยไม่มีการ execute โค้ดแม้แต่บรรทัดเดียว
      </p>

      <div className="panel">
        <div className="code-editor-shell">
          <div className="code-editor-titlebar">
            <span className="titlebar-dot" style={{ background: "#ff5c5c" }} />
            <span className="titlebar-dot" style={{ background: "#ffb84d" }} />
            <span className="titlebar-dot" style={{ background: "#2ee6a6" }} />
            <span style={{ marginLeft: "0.5rem" }}>main.py — Python 3.8+</span>
          </div>
          <textarea
            className="code-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="วางโค้ด Python ที่ต้องการวิเคราะห์ที่นี่..."
            spellCheck={false}
          />
        </div>

        <div style={{ marginTop: "0.85rem" }}>
          <div className="btn-toggle-group">
            <button className="btn btn-sm" onClick={() => loadSample("anti_patterns")}>
              ⚠ โหลดตัวอย่างที่มี anti-patterns
            </button>
            <button className="btn btn-sm" onClick={() => loadSample("clean")}>
              ✓ โหลดตัวอย่างโค้ดที่ดี
            </button>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>ขนาด input สมมติ (n)</label>
            <input type="number" min={1} value={n} onChange={(e) => setN(Number(e.target.value))} />
          </div>
          <div className="field">
            <label>จำนวนครั้งที่รันต่อวัน</label>
            <input type="number" min={1} value={runsPerDay} onChange={(e) => setRunsPerDay(Number(e.target.value))} />
          </div>
        </div>

        <div style={{ marginTop: "1.25rem" }}>
          <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading} style={{ width: "100%" }}>
            {loading ? "กำลังวิเคราะห์..." : "วิเคราะห์โค้ด →"}
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}
      </div>
    </div>
  );
}
