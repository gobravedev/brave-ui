
import type { ComponentType, LazyExoticComponent } from "react";

export type RegisteredViewComponent =
  | ComponentType<any>
  | LazyExoticComponent<ComponentType<any>>;

export interface ViewRegistry {}