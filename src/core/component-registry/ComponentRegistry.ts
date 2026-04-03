// src/core/component-registry/ComponentRegistry.ts

export type ComponentCtor = React.ComponentType<any>;

class ComponentRegistry {
  private views = new Map<string, ComponentCtor>();

  register(key: string, component: ComponentCtor) {
    if (this.views.has(key)) {
      console.warn(`[ComponentRegistry] Duplicate registration: ${key}`);
    }
    this.views.set(key, component);
  }

  get(key: string) {
    return this.views.get(key);
  }

  has(key: string) {
    return this.views.has(key);
  }
}

export const componentRegistry = new ComponentRegistry();