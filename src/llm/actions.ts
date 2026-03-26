// src/llm/actions.ts
export type UIAction =
  | { type: "setFilter"; payload: { field: string; value: any } }
  | { type: "openPanel"; payload: { name: string } }
  | { type: "navigate"; payload: { path: string } }
  | { type: "showToast"; payload: { message: string } };