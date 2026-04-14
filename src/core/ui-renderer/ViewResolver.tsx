// src/core/ui-renderer/ComponentsDetailsRender.tsx

import { Skeleton } from "antd";
import { Suspense } from "react";
import { getView } from "@/core/component-registry";
import type { ViewProps, ViewRegistry, ViewRenderProps } from "@/core/component-registry/registry-types";

const renderStack = new Set<string>(); // 防止递归

type ComponentsDetailsRenderProps = {
  view?: string;
} & ViewRenderProps;

const ComponentsDetailsRender = ({ view, ...rest }: ComponentsDetailsRenderProps) => {
  if (!view) return <div style={{color:"red"}}>view cannot be empty!</div>;

  if (renderStack.has(view)) {
    return <div>Recursive view detected: {view}</div>;
  }

  const viewKey = view as keyof ViewRegistry;
  const Component = getView(viewKey);
  if (!Component) {
    return <div>Unknown component: {view}</div>;
  }

  renderStack.add(view);

  const result = (
    <Suspense fallback={<Skeleton active />}>
      <Component {...(rest as any)}  />
    </Suspense>
  );

  renderStack.delete(view);
  return result;
};

export default ComponentsDetailsRender;