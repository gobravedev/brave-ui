export class ActionDispatcher {
  static actions: Record<string, Function> = {};

  static register(name: string, handler: Function) {
    if (ActionDispatcher.actions[name]) {
      console.warn(`[LLM] Action already registered: ${name}`);
      return;
    }
    ActionDispatcher.actions[name] = handler;
  }

  static dispatch(action: string, payload: any) {
    const fn = ActionDispatcher.actions[action];
    
    if (!fn) {
      console.warn("[LLM] Unknown action:", action);
      return;
    }
    return fn(payload);
  }
}