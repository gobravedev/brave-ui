// src/core/ui-system/useUI.ts

import { useUIStore } from "./ui.store";

export function useUI() {
  const open = useUIStore((s) => s.open);
  const openSingle = useUIStore((s) => s.openSingle);
  const openAsync = useUIStore((s) => s.openAsync);
  const close = useUIStore((s) => s.close);
  const remove = useUIStore((s) => s.remove);

  return {
    open,
    openSingle,
    openAsync,
    close,
    remove,
  };
}