import { ActionRegistry } from "../ActionRegistry";

ActionRegistry.register("form.set_value", (p: { form: string; field: string; value: any }) => {
//   const f = window.$forms[p.form];
//   f?.setFieldValue(p.field, p.value);
});