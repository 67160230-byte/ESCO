import { Link } from "react-router-dom";
import { useEsco } from "../context/EscoContext";

function badgeClass(sev) {
  if (sev === "High") return "badge-high";
  if (sev === "Medium") return "badge-medium";
  return "badge-low";
}

export default function RecommendationPage() {
  const { result } = useEsco();

  if (!result) {
    return (
      <div className="empty-state">
        <p>ยังไม่มีผลการวิเคราะห์</p>
        <Link to="/" className="btn btn-primary">ไปหน้า Input เพื่อวิเคราะห์โค้ด</Link>
      </div>
    );
  }

  const { recommendations } = result;

  return (
    <div>
      <h1 className="page-title">คำแนะนำในการปรับปรุงโค้ด</h1>
      <p className="page-subtitle">
        เรียงตามลำดับความรุนแรงจากมากไปน้อย แก้ไขรายการแรกก่อนเพื่อผลลัพธ์ที่ดีที่สุด
      </p>

      {recommendations.length === 0 && (
        <div className="panel">
          <p>ไม่พบ anti-pattern ในโค้ดนี้ — โค้ดของคุณมีประสิทธิภาพเชิงพลังงานที่ดีแล้ว</p>
        </div>
      )}

      {recommendations.map((rec, i) => (
        <div key={i} className="panel">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <span className={`badge ${badgeClass(rec.severity)}`}>{rec.severity}</span>
            <h3 style={{ margin: 0, fontSize: "1rem" }}>{rec.name_th}</h3>
            <span style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>บรรทัด {rec.line}</span>
          </div>

          <div className="diff-grid">
            <div>
              <div className="diff-label" style={{ color: "var(--high)" }}>✕ Before — มีปัญหา</div>
              <pre className="diff-block diff-before">{rec.before}</pre>
            </div>
            <div>
              <div className="diff-label" style={{ color: "var(--good)" }}>✓ After — แก้ไขแล้ว</div>
              <pre className="diff-block diff-after">{rec.after}</pre>
            </div>
          </div>

          <p style={{ fontSize: "0.85rem", color: "var(--text-dim)", marginBottom: 0 }}>
            {rec.explanation_th}
          </p>
        </div>
      ))}

      <div className="footer-nav">
        <Link to="/issues" className="btn">← จุดที่มีปัญหา</Link>
        <Link to="/" className="btn btn-primary">วิเคราะห์โค้ดใหม่</Link>
      </div>
    </div>
  );
}
