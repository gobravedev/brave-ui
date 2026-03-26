// src/llm/ActionExecutor.ts
import { UIAction } from "./actions";

export class ActionExecutor {
  private handlers = new Map<
    string,
    (payload: any) => Promise<any> | any
  >();

  register(type: string, handler: (payload: any) => Promise<any> | any) {
    // debugger
    this.handlers.set(type, handler);
  }

  async execute(actions: UIAction[]) {
    const results = [];

    for (const act of actions) {
      const handler = this.handlers.get(act.type);

      if (!handler) {
        results.push({ type: act.type, success: false, error: "unknown action" });
        continue;
      }

      try {
        const r = await handler(act.payload);
        results.push({ type: act.type, success: true, result: r });
      } catch (err: any) {
        results.push({ type: act.type, success: false, error: err?.message });
      }
    }

    return results;
  }
}