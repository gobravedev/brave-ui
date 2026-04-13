// src/core/component-registry/registry-utils.ts

import { ViewRegistry } from "./registry-types";
import { componentRegistry } from "./ComponentRegistry";
import type { ComponentCtor } from "./ComponentRegistry";

export function registerView<K extends keyof ViewRegistry>(key: K, component: ViewRegistry[K]) {
  componentRegistry.register(key, component);
}

export function getView<K extends keyof ViewRegistry>(key: K): ViewRegistry[K] | undefined {
  return componentRegistry.get(key);
}