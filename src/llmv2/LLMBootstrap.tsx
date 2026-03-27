import { useEffect } from "react";
import { useNavigate } from "react-router";
import { sseClient } from "@/sse";
import { useRouterStore } from "@/store-zustand/router";
import { registerLLMActions } from "./registerHandlers";

export default function LLMBootstrap() {
  const navigate = useNavigate();
  const setNavigate = useRouterStore((state) => state.setNavigate);

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate, setNavigate]);

  useEffect(() => {
    const cleanup = registerLLMActions(sseClient);
    return cleanup;
  }, []);

  return null;
}
