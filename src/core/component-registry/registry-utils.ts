// src/core/component-registry/registry-utils.ts

import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";
import { LazyLoader, ViewRegistry } from "./registry-types";
import { componentRegistry } from "./ComponentRegistry";

type ResolveRegisteredView<T> = T extends LazyExoticComponent<infer C>
  ? C
  : T extends ComponentType<any>
    ? T
    : never;

type LazyViewLoader<K extends keyof ViewRegistry> = LazyLoader<ResolveRegisteredView<ViewRegistry[K]>>;

export function registerView<K extends keyof ViewRegistry>(key: K, component: ViewRegistry[K]) {
  componentRegistry.register(key, component);
}

export function getView<K extends keyof ViewRegistry>(key: K): ViewRegistry[K] | undefined {
  return componentRegistry.get(key);
}

export function registerLazyView<K extends keyof ViewRegistry>(
  key: K,
  loader: LazyViewLoader<K>,
) {
  const component = lazy(loader);
  registerView(key, component as any as ViewRegistry[K]);
  return component;
}

export function registerLazyViews<const K extends keyof ViewRegistry>(views: {
  [P in K]: LazyViewLoader<P>;
}) {
  const result = {} as {
    [P in K]: LazyExoticComponent<ResolveRegisteredView<ViewRegistry[P]>>;
  };

  for (const key of Object.keys(views) as K[]) {
    result[key] = registerLazyView(key, views[key]);
  }

  return result;
}