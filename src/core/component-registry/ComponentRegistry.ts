// src/core/component-registry/ComponentRegistry.ts

// export type ComponentCtor = React.ComponentType<any>;

// class ComponentRegistry {
//   private views = new Map<string, ComponentCtor>();

//   register(key: string, component: ComponentCtor) {
//     if (this.views.has(key)) {
//       console.warn(`[ComponentRegistry] Duplicate registration: ${key}`);
//     }
//     this.views.set(key, component);
//   }

//   get(key: string) {
//     return this.views.get(key);
//   }

//   has(key: string) {
//     return this.views.has(key);
//   }
// }

// export const componentRegistry = new ComponentRegistry();



// src/core/component-registry/ComponentRegistry.ts
import type { ViewRegistry } from "@/core/component-registry/registry-types";

export type ComponentCtor = React.ComponentType<any>;

class ComponentRegistry<T extends object> {
  private views = new Map<keyof T, T[keyof T]>();

  register<K extends keyof T>(key: K, component: T[K]) {
    if (this.views.has(key)) {
      console.warn(`[ComponentRegistry] Duplicate registration: ${String(key)}`);
    }
    this.views.set(key, component);
  }

  get<K extends keyof T>(key: K): T[K] | undefined {
    return this.views.get(key) as T[K] | undefined;
  }

  has<K extends keyof T>(key: K): boolean {
    return this.views.has(key);
  }
}



export const componentRegistry = new ComponentRegistry<ViewRegistry>();



