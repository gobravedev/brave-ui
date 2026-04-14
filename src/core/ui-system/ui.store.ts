// src/core/ui-system/ui.store.ts

import { create } from "zustand";
import { nanoid } from "nanoid";
import type { DrawerProps, ModalProps } from "antd";

export type UIType = "modal" | "drawer";

type ManagedModalProps = Omit<
    ModalProps,
    "open" | "onCancel" | "afterOpenChange" | "destroyOnClose"
>;

type ManagedDrawerProps = Omit<
    DrawerProps,
    "open" | "onClose" | "afterOpenChange" | "destroyOnClose"
>;

export type UIItem = {
    id: string;
    view: string;
    type: UIType;
    visible: boolean;
    params?: any;
    modalProps?: Partial<ManagedModalProps>;
    drawerProps?: Partial<ManagedDrawerProps>;
};

type OpenConfig = {
    view: string;
    type?: UIType;
    params?: any;
    modalProps?: Partial<ManagedModalProps>;
    drawerProps?: Partial<ManagedDrawerProps>;
};

type UIStore = {
    stack: UIItem[];

    open: (config: OpenConfig) => string;
    openSingle: (config: OpenConfig) => string;

    close: (id: string) => void;
    remove: (id: string) => void;

    // Promise 模式（高级）
    openAsync: (config: OpenConfig) => Promise<any>;
};

export const useUIStore = create<UIStore>((set, get) => ({
    stack: [],

    open: ({ view, type = "modal", params, modalProps, drawerProps }) => {
        const id = nanoid();

        set((state) => ({
            stack: [
                ...state.stack,
                {
                    id,
                    view,
                    type,
                    visible: true,
                    params,
                    modalProps,
                    drawerProps,
                },
            ],
        }));

        return id;
    },

    openSingle: ({ view, type = "modal", params, modalProps, drawerProps }) => {
        const id = nanoid();

        set({
            stack: [
                {
                    id,
                    view,
                    type,
                    visible: true,
                    params,
                    modalProps,
                    drawerProps,
                },
            ],
        });

        return id;
    },

    close: (id) => {
        set((state) => ({
            stack: state.stack.map((item) =>
                item.id === id ? { ...item, visible: false } : item
            ),
        }));
    },

    remove: (id) => {
        set((state) => ({
            stack: state.stack.filter((item) => item.id !== id),
        }));
    },

    // Promise 弹窗（Confirm / 表单特别好用）
    openAsync: ({ view, type = "modal", params, modalProps, drawerProps }) => {
        return new Promise((resolve, reject) => {
            const id = nanoid();

            set((state) => ({
                stack: [
                    ...state.stack,
                    {
                        id,
                        view,
                        type,
                        visible: true,
                        modalProps,
                        drawerProps,
                        params: {
                            ...params,
                            onOk: (data: any) => {
                                resolve(data);
                                get().close(id);
                            },
                            onCancel: () => {
                                reject();
                                get().close(id);
                            },
                        },
                    },
                ],
            }));
        });
    },
}));