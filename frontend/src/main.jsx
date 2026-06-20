import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./theme.css";
import { EscoProvider } from "./context/EscoContext";
import Navbar from "./components/Navbar";
import InputPage from "./pages/InputPage";
import EcoScorePage from "./pages/EcoScorePage";
import CodeIssuePage from "./pages/CodeIssuePage";
import RecommendationPage from "./pages/RecommendationPage";

function App() {
  return (
    <EscoProvider>
      <Navbar />
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<InputPage />} />
          <Route path="/eco-score" element={<EcoScorePage />} />
          <Route path="/issues" element={<CodeIssuePage />} />
          <Route path="/recommendations" element={<RecommendationPage />} />
        </Routes>
      </div>
    </EscoProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
