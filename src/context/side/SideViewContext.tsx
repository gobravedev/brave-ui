// SideViewContext.tsx
import React, { createContext, FC, useContext, useState } from 'react';
import { useLocation } from 'react-router';

const SideViewContext = createContext<any>(null);

export const SideViewProvider:FC<any> = ({ children }) => {
  const location = useLocation();

  const [viewMap, setViewMap] = useState<Record<string, string | null>>({});

  const setSideView = (view: string | null) => {
    setViewMap(prev => ({
      ...prev,
      [location.pathname]: view,
    }));
  };

  return (
    <SideViewContext.Provider value={{ viewMap, setSideView }}>
      {children}
    </SideViewContext.Provider>
  );
};

// export const useSideViewContext = () => useContext(SideViewContext);
export const useSideViewContext = () => {
  const ctx = useContext(SideViewContext);
  if (!ctx) throw new Error("useSideViewContext must be used within <SideViewProvider>");
  return ctx;
};
