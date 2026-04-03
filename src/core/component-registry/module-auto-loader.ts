// src/core/component-registry/module-auto-loader.ts

// 自动加载所有 components/**/index.ts
const modules = import.meta.glob("/src/components/**/index.ts", { eager: true });

console.log("[Registry] Auto loaded modules:", modules);