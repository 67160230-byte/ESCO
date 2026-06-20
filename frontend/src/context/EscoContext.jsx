import { createContext, useContext, useState } from "react";

const EscoContext = createContext(null);

const DEFAULT_CODE = "";

export function EscoProvider({ children }) {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [n, setN] = useState(10000);
  const [runsPerDay, setRunsPerDay] = useState(100);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const value = {
    code, setCode,
    n, setN,
    runsPerDay, setRunsPerDay,
    result, setResult,
    loading, setLoading,
    error, setError,
  };

  return <EscoContext.Provider value={value}>{children}</EscoContext.Provider>;
}

export function useEsco() {
  const ctx = useContext(EscoContext);
  if (!ctx) throw new Error("useEsco must be used within EscoProvider");
  return ctx;
}
