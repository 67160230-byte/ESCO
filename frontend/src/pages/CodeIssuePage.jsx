import { Link } from "react-router-dom";
import { useEsco } from "../context/EscoContext";

function severityClass(sev) {
  if (sev === "High") return "sev-high";
  if (sev === "Medium") return "sev-medium";
  return "";
}

function badgeClass(sev) {
  if (sev === "High") return "badge-high";
  if (sev === "Medium") return "badge-medium";
  return "badge-low";
}

const PATTERN_LABELS = {
  nested_loop: "Nested Loop",
  string_concat_loop: "String Concatenation in Loop",
  range_len_pattern: "range(len()) Pattern",
  repeated_func_call_loop: "Repeated Function Call in Loop",
  global_var_access_loop: "Global Variable Access in Loop",
};

export default function CodeIssuePage() {
  const { result, code } = useEsco();

  if (!result) {
    return (
      <div className="empty-state">
        <p>ยังไม่มีผลการวิเคราะห์</p>
        <Link to="/" className="btn btn-primary">ไปหน้า Input เพื่อวิเคราะห์โค้ด</Link>
      </div>
    );
  }

  const { patterns } = result;
  const lineSeverity = {};
  for (const p of patterns) {
    const current = lineSeverity[p.line];
    if (!current || (current === "Medium" && p.severity === "High") || (current === "Low" && p.severity !== "Low")) {
      lineSeverity[p.line] = p.severity;
    }
  }

  const codeLines = code.split("\n");

  return (
    <div>
      <h1 className="page-title">จุดที่มีปัญหาในโค้ด</h1>
      <p className="page-subtitle">
        พบ {patterns.length} ตำแหน่งที่มี Energy Anti-patterns — สีแดง = High severity, สีส้ม = Medium severity
      </p>

      <div className="grid-2">
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <div className="code-editor-titlebar">
            <span style={{ marginLeft: "0.25rem" }}>main.py</span>
          </div>
          <div style={{ padding: "0.75rem 0", overflowX: "auto" }}>
            {codeLines.map((line, i) => {
              const lineNum = i + 1;
              const sev = lineSeverity[lineNum];
              return (
                <div key={lineNum} className={`code-line ${severityClass(sev)}`}>
                  <span className="code-line-num">{lineNum}</span>
                  <span>{line || " "}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <h3 style={{ marginTop: 0, fontSize: "0.95rem" }}>Anti-patterns ที่ตรวจพบ</h3>
          {patterns.length === 0 && <p style={{ color: "var(--text-dim)" }}>ไม่พบ anti-pattern ในโค้ดนี้</p>}
          {patterns.map((p, i) => (
            <div key={i} style={{ marginBottom: "0.85rem", paddingBottom: "0.85rem", borderBottom: "1px solid var(--panel-border)" }}>
              <span className={`badge ${badgeClass(p.severity)}`}>{p.severity}</span>
              <div style={{ marginTop: "0.4rem", fontWeight: 600 }}>
                {PATTERN_LABELS[p.id] || p.id}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>บรรทัด {p.line}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-nav">
        <Link to="/eco-score" className="btn">← Eco-Score</Link>
        <Link to="/recommendations" className="btn btn-primary">ดูคำแนะนำการแก้ไข →</Link>
      </div>
    </div>
  );
}
