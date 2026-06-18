import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import InputPage from "./pages/InputPage";
import EcoScorePage from "./pages/EcoScorePage";
import CodeIssuePage from "./pages/CodeIssuePage";
import RecommendationPage from "./pages/RecommendationPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InputPage />} />
        <Route path="/eco-score" element={<EcoScorePage />} />
        <Route path="/issues" element={<CodeIssuePage />} />
        <Route path="/recommendations" element={<RecommendationPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
