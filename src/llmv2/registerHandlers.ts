import { useEffect } from "react";
import { registerActions } from "./actionRegistry";
import { ActionDispatcher } from "./dispatcher";
import { data } from "node_modules/vis-network/declarations/index-legacy-bundle";

let initialized = false;

export function registerLLMActions(sse: any) {
    if (initialized) return;
    initialized = true;

    // 注册 Action
    registerActions();

    // SSE ——> LLM Action
    sse.onMessage((data: any) => {
        try {
            //   const data = JSON.parse(msg.data);
            if (data?.action && data?.payload) {
                console.log("[LLM] Received SSE message:", data);
                ActionDispatcher.dispatch(data.action, data.payload);
            }
        } catch (e) {
            console.error("[LLM] SSE parse error", e);
        }
    })


    console.log("[LLM] Actions registered");
}