import { lazy } from "react";
import type { RegisteredViewComponent } from "@/core/component-registry/registry-types";

const ConfirmDialog =  lazy(() => import("./confirm"));

import { registerView } from "@/core/component-registry";

declare module "@/core/component-registry/registry-types" {
	interface ViewRegistry {
		confirmDialog: RegisteredViewComponent;
	}
}

// 注册
registerView("confirmDialog", ConfirmDialog);
