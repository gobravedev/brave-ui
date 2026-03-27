import { create } from "zustand";
// import { createHashHistory } from "history";

// const history = createHashHistory();

export const useRouterStore = create(() => ({
  go: (path: string) => {},
  history,
}));