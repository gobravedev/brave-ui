import { ActionRegistry } from "../ActionRegistry";
import { message } from "antd";

// UI 消息
ActionRegistry.register("ui.show_message", (p: { type: string; text: string }) => {
//   message[p.type](p.text);
});