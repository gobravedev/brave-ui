// src/llm/registerHandlers.ts
import { ActionExecutor } from "./ActionExecutor";
import {  openPanel } from "../store/ui";
import { useDispatch } from "react-redux";
import store from "@/store";

// import { toast } from "react-hot-toast";
// import { createBrowserHistory } from "history";

// const history = createBrowserHistory();
export const executor = new ActionExecutor();

export function registerLLMActions() {
    
  executor.register("setFilter", async ({ field, value }) => {
    // dispatch(setFilter({ field, value }));
  });

  executor.register("openPanel", async ({ name }) => {
    store.dispatch(openPanel(name));
  });

  executor.register("navigate", async ({ path }) => {
    // history.push(path);
  });

  executor.register("showToast", async ({ message }) => {
    // toast(message);
  });
}