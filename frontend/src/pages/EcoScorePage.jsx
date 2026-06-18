import { useEffect, useState } from "react";

// Screen 2: Eco-Score Dashboard
// - grade ring (A-F) with structural/energy score breakdown
// - metric cards: Joule/run, kWh/year, gCO2/run, gCO2/year
// - before/after energy comparison chart
export default function EcoScorePage() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("escoResult");
    if (stored) setResult(JSON.parse(stored));
  }, []);

  if (!result) return <p>ไม่พบผลการวิเคราะห์ กรุณาวิเคราะห์โค้ดก่อน</p>;

  const { eco_score, energy } = result;

  return (
    <div>
      <h1>Eco-Score Dashboard</h1>
      {/* TODO: replace with a real grade-ring SVG/component */}
      <h2>เกรด: {eco_score.grade}</h2>
      <p>คะแนนรวม: {eco_score.total_score}</p>
      <p>Structural Score: {eco_score.structural_score}</p>
      <p>Energy Score: {eco_score.energy_score}</p>

      <div>
        {/* TODO: replace with metric card components */}
        <p>Joule ต่อครั้ง: {energy.joule_per_run}</p>
        <p>kWh ต่อปี: {energy.kwh_per_year}</p>
        <p>gCO2 ต่อครั้ง: {energy.gco2_per_run}</p>
        <p>gCO2 ต่อปี: {energy.gco2_per_year}</p>
      </div>

      {/* TODO: add recharts bar/line comparing energy.kwh_per_year vs energy.baseline_kwh_per_year */}
    </div>
  );
}
