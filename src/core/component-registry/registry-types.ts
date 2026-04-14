
import type { ComponentProps, ComponentType, LazyExoticComponent } from "react";

export type RegisteredViewComponent<Props = any> =
  | ComponentType<Props>
  | LazyExoticComponent<ComponentType<Props>>;

export type LazyLoader<T extends ComponentType<any>> = () => Promise<{
  default: T;
}>;

export interface ViewRegistry {}

type ResolveRegisteredView<T> = T extends LazyExoticComponent<infer C>
  ? C
  : T extends ComponentType<any>
    ? T
    : never;

type IsAny<T> = 0 extends (1 & T) ? true : false;

type NormalizeViewProps<T> = IsAny<T> extends true ? Record<string, unknown> : T;

export type ViewProps<K extends keyof ViewRegistry> = NormalizeViewProps<ComponentProps<
  ResolveRegisteredView<ViewRegistry[K]>
>>;

export type ViewRenderProps = {
  [K in keyof ViewRegistry]: { view: K } & ViewProps<K>;
}[keyof ViewRegistry];

export type InferRegisteredViewComponent<TLoader extends LazyLoader<any>> =
  RegisteredViewComponent<ComponentProps<Awaited<ReturnType<TLoader>>["default"]>>;

export type InferViewRegistryFromLoaders<
  TLoaders extends Record<string, LazyLoader<any>>,
> = {
  [K in keyof TLoaders]: InferRegisteredViewComponent<TLoaders[K]>;
};