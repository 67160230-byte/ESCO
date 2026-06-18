import { useEffect, useState } from "react";

// Screen 3: Code Issue Viewer
// - original user code with line highlighting (red = High, orange = Medium)
// - side list of detected anti-patterns with severity + short description
export default function CodeIssuePage() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("escoResult");
    if (stored) setResult(JSON.parse(stored));
  }, []);

  if (!result) return <p>ไม่พบผลการวิเคราะห์ กรุณาวิเคราะห์โค้ดก่อน</p>;

  const { patterns } = result;

  return (
    <div>
      <h1>จุดที่มีปัญหาในโค้ด</h1>
      {/* TODO: render the original code with CodeMirror + line decorations
          colored by severity (red = High, orange = Medium) */}
      <ul>
        {patterns.map((p, i) => (
          <li key={i}>
            บรรทัด {p.line}: {p.id} ({p.severity})
          </li>
        ))}
      </ul>
    </div>
  );
}
