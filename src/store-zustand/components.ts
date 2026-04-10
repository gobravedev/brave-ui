import { create } from "zustand";

// 每种组件暴露的能力（类型可扩展）
export type TableInstance = { reload: () => void; loadLastPage: () => void; search: (kw: string) => void };
export type DrawerInstance = { open: () => void; close: () => void };
export type ModalInstance = { open: () => void; close: () => void; setLoading: (v: boolean) => void };
export type FormInstance = { setValue: (name: string, v: any) => void; reset: () => void, updateFormStatus: () => void };
export type ChartInstance = { refresh: () => void };

// 统一的组件 store
export type ComponentStore = {
    tables: Record<string, TableInstance>;
    drawers: Record<string, DrawerInstance>;
    modals: Record<string, ModalInstance>;
    forms: Record<string, FormInstance>;
    charts: Record<string, ChartInstance>;
    analysis: Record<string, any>; // 这里可以根据实际情况定义更具体的类型

    register: <T>(category: keyof ComponentStore, id: string, instance: T) => void;
    unregister: (category: keyof ComponentStore, id: string) => void;

    invoke: (category: keyof ComponentStore, id: string, method: string, args?: any[]) => void;
};

export const useComponentStore = create<ComponentStore>((set, get) => ({
    tables: {},
    drawers: {},
    modals: {},
    forms: {},
    charts: {},
    analysis: {},

    register: (category, id, instance) => {
        console.log(`Registering component - Category: ${category}, ID: ${id}`);
        set((state) => ({
            [category]: { ...(state as any)[category], [id]: instance },
        }))
    },

    unregister: (category, id) => {
        console.log(`Unregistering component - Category: ${category}, ID: ${id}`);  
        set((state) => {
            const map = { ...(state as any)[category] };
            delete map[id];
            return { [category]: map };
        })
    },

    invoke: (category, id, method, args = []) => {
        console.log(`Invoking method on component - Category: ${category}, ID: ${id}, Method: ${method}, Args: ${JSON.stringify(args)}`);
        const comp = (get() as any)[category]?.[id];
        if (comp && typeof comp[method] === "function") {
            if( args instanceof Array){
                comp[method](...args);
            } else {
                comp[method](args);
            }
            // comp[method](...args);
        }
    },
}));