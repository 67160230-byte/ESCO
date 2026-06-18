import { useEffect, useState } from "react";

// Screen 4: Recommendation Page
// - before/after code comparison for each detected anti-pattern
// - sorted High -> Medium -> Low severity
// - technical explanation of how the change affects complexity/energy
export default function RecommendationPage() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("escoResult");
    if (stored) setResult(JSON.parse(stored));
  }, []);

  if (!result) return <p>ไม่พบผลการวิเคราะห์ กรุณาวิเคราะห์โค้ดก่อน</p>;

  const { recommendations } = result;

  return (
    <div>
      <h1>คำแนะนำในการปรับปรุงโค้ด</h1>
      {recommendations.map((rec, i) => (
        <div key={i} style={{ marginBottom: "2rem", border: "1px solid #ccc", padding: "1rem" }}>
          <h3>
            {rec.name_th} ({rec.severity}) — บรรทัด {rec.line}
          </h3>
          <div style={{ display: "flex", gap: "1rem" }}>
            <pre style={{ flex: 1, background: "#fdecea" }}>{rec.before}</pre>
            <pre style={{ flex: 1, background: "#eafaf1" }}>{rec.after}</pre>
          </div>
          <p>{rec.explanation_th}</p>
        </div>
      ))}
    </div>
  );
}
