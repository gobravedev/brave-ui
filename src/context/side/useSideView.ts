// useSideView.ts
import { useEffect } from "react";
import { useSideViewContext } from "./SideViewContext";

export const useSideView = (view: string | null) => {
  const { setSideView } = useSideViewContext();

  useEffect(() => {
    // debugger
    setSideView(view);
    return () => setSideView(null);  // 页面离开时清空关联
  }, [view]);
};