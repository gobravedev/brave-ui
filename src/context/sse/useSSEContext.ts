// src/context/sse/useSSEContext.ts
import { useContext } from "react";
import { SSEContext } from "./SSEProvider";
import { SSEContextType } from "./types";

export const useSSEContext = (): SSEContextType => {
  const ctx = useContext(SSEContext);
  if (!ctx) throw new Error("useSSEContext must be used within <SSEProvider>");
  return ctx;
};
