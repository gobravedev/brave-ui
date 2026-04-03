// src/core/ui-renderer/ComponentsDetailsRender.tsx

import { Skeleton } from "antd";
import { FC, Suspense } from "react";
import { getView } from "@/core/component-registry";

const renderStack = new Set<string>(); // 防止递归

const ComponentsDetailsRender:FC<any> = ({ view, ...rest }) => {
  if (!view) return <div style={{color:"red"}}>view cannot be empty!</div>;

  if (renderStack.has(view)) {
    return <div>Recursive view detected: {view}</div>;
  }

  const Component = getView(view);
  if (!Component) {
    return <div>Unknown component: {view}</div>;
  }

  renderStack.add(view);

  const result = (
    <Suspense fallback={<Skeleton active />}>
      <Component {...rest} />
    </Suspense>
  );

  renderStack.delete(view);
  return result;
};

export default ComponentsDetailsRender;