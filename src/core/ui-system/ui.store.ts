// src/core/ui-system/ui.store.ts

import { create } from "zustand";
import { nanoid } from "nanoid";

export type UIType = "modal" | "drawer";

export type UIItem = {
    id: string;
    view: string;
    type: UIType;
    visible: boolean;
    params?: any;
};

type OpenConfig = {
    view: string;
    type?: UIType;
    params?: any;
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

    open: ({ view, type = "modal", params }) => {
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
                },
            ],
        }));

        return id;
    },

    openSingle: ({ view, type = "modal", params }) => {
        const id = nanoid();

        set({
            stack: [
                {
                    id,
                    view,
                    type,
                    visible: true,
                    params,
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
    openAsync: ({ view, type = "modal", params }) => {
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