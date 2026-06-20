import { NavLink } from "react-router-dom";

const STEPS = [
  { path: "/", label: "Input", num: "1" },
  { path: "/eco-score", label: "Eco-Score", num: "2" },
  { path: "/issues", label: "จุดที่มีปัญหา", num: "3" },
  { path: "/recommendations", label: "คำแนะนำ", num: "4" },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span>ESCO</span>
        <span className="dot">—</span>
        <span className="navbar-tagline">Static Analysis Only</span>
      </div>
      <div className="navbar-links">
        {STEPS.map((step) => (
          <NavLink
            key={step.path}
            to={step.path}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            end={step.path === "/"}
          >
            <span className="step-num">{step.num}</span>
            {step.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
