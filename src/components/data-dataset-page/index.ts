import { registerLazyViews } from "@/core/component-registry";
import type { InferViewRegistryFromLoaders } from "@/core/component-registry/registry-types";

const viewLoaders = {
  datasetProjectPage: () => import("./dataset-project-page"),
  datasetFilePage: () => import("./dataset-file-page"),
  sampleProjectPage: () => import("./sample-project-page"),
};

declare module "@/core/component-registry/registry-types" {
  interface ViewRegistry extends InferViewRegistryFromLoaders<typeof viewLoaders> {}
}

registerLazyViews(viewLoaders);
