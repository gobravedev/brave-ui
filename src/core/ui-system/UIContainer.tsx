// src/core/ui-system/UIContainer.tsx

import { Modal, Drawer } from "antd";
import { useUIStore } from "./ui.store";
import ViewResolver from "@/core/ui-renderer/ViewResolver";

export const UIContainer = () => {
    const stack = useUIStore((s) => s.stack);
    const close = useUIStore((s) => s.close);
    const remove = useUIStore((s) => s.remove);

    return (
        <>
            {stack.map((item) => {
                const content = (
                    <ViewResolver
                        view={item.view}
                        {...item.params}
                        close={() => close(item.id)}
                    />
                );

                const commonProps = {
                    
                    open: item.visible,

                };

                const drawerProps = {
                    onClose: () => close(item.id),
                    afterOpenChange: (open: boolean) => {
                        if (!open) remove(item.id);
                    },
                    destroyOnClose: true,
                }

                if (item.type === "drawer") {
                    return (
                        <Drawer key={item.id} {...item.drawerProps} {...commonProps} {...drawerProps} >
                            {content}
                        </Drawer>
                    );
                }
                const modalProps = {
                    onCancel: () => close(item.id),
                    afterOpenChange: (open: boolean) => {
                        if (!open) remove(item.id);
                    },
                    destroyOnClose: true,
                }
                return (
                    <Modal key={item.id} {...item.modalProps} {...commonProps} {...modalProps} >
                        {content}
                    </Modal>
                );
            })}
        </>
    );
};