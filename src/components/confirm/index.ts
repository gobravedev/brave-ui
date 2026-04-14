import type { RegisteredViewComponent } from "@/core/component-registry/registry-types";
import { registerLazyView } from "@/core/component-registry";

declare module "@/core/component-registry/registry-types" {
	interface ViewRegistry {
		confirmDialog: RegisteredViewComponent;
	}
}

registerLazyView("confirmDialog", () => import("./confirm"));
