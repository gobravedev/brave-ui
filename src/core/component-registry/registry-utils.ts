// src/core/component-registry/registry-utils.ts

import { componentRegistry } from "./ComponentRegistry";
import type { ComponentCtor } from "./ComponentRegistry";

export function registerView(key: string, component: ComponentCtor) {
  componentRegistry.register(key, component);
}

export function getView(key: string): ComponentCtor | undefined {
  return componentRegistry.get(key);
}