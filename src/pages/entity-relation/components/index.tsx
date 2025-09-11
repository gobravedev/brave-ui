import { Skeleton } from "antd";
import { FC, lazy, Suspense, useEffect, useState } from "react";

const ChatView = lazy(() => import('./chat'));
const DetailsView = lazy(() => import('./details'));

export const viewMapping: {
    key: string;
    label: string;
    component: React.ComponentType<{ close: () => void,data:any ,height:any}>;
}[] = [
        { key: "chat", label: "聊天窗口", component: ChatView },
        { key: "details", label: "详情", component: DetailsView },
        { key: "setting", label: "设置窗口", component: ChatView },
    ];

export const ComponentsRender: FC<{ height:any,data:any,view: string; close: () => void }> = ({height,data, view, close }) => {
    if (!view) return <div onClick={close}>未知类型</div>;
    const item = viewMapping.find((v) => v.key === view);
    if (!item) return <div>未知类型</div>;
    const {component:Component,key,...rest} = item
    // const Component = item.component;

    return <Suspense fallback={<Skeleton active></Skeleton>}>
        
        <Component close={close} data={data} {...rest} height={height}/>
    </Suspense>
};
