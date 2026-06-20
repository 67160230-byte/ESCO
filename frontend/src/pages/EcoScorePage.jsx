import { Link } from "react-router-dom";
import { useEsco } from "../context/EscoContext";

export default function EcoScorePage() {
  const { result } = useEsco();

  if (!result) {
    return (
      <div className="empty-state">
        <p>ยังไม่มีผลการวิเคราะห์</p>
        <Link to="/" className="btn btn-primary">ไปหน้า Input เพื่อวิเคราะห์โค้ด</Link>
      </div>
    );
  }

  const { eco_score, energy } = result;
  const gradeClass = `grade-${eco_score.grade}`;

  return (
    <div>
      <h1 className="page-title">Eco-Score Dashboard</h1>
      <p className="page-subtitle">สรุปคะแนนประสิทธิภาพเชิงพลังงานของโค้ดที่วิเคราะห์</p>

      <div className="panel">
        <div className="grade-block">
          <div className={`grade-ring ${gradeClass}`}>{eco_score.grade}</div>
          <div>
            <div className="score-total">{eco_score.total_score} / 100</div>
            <div className="score-breakdown">
              Structural Score: {eco_score.structural_score} &nbsp;|&nbsp; Energy Score: {eco_score.energy_score}
            </div>
            <div className="score-breakdown">
              ตรวจพบ {eco_score.breakdown.length} anti-pattern{eco_score.breakdown.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: "1.25rem" }}>
        <div className="metric-card">
          <div className="metric-label">Joule / ครั้ง</div>
          <div className="metric-value">{energy.joule_per_run}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">kWh / ปี</div>
          <div className="metric-value">{energy.kwh_per_year}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">gCO₂ / ครั้ง</div>
          <div className="metric-value">{energy.gco2_per_run}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">gCO₂ / ปี</div>
          <div className="metric-value">{energy.gco2_per_year}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Baseline kWh / ปี</div>
          <div className="metric-value">{energy.baseline_kwh_per_year}</div>
        </div>
      </div>

      <div className="footer-nav">
        <Link to="/" className="btn">← กลับไปแก้โค้ด</Link>
        <Link to="/issues" className="btn btn-primary">ดูจุดที่มีปัญหา →</Link>
      </div>
    </div>
  );
}
