import { Skeleton } from "antd";
import { FC, lazy, Suspense, useEffect, useState } from "react";

const ChatView = lazy(() => import('./chat'));
const NodeView = lazy(() => import('./details'));
const RelationView = lazy(() => import('./relation'));
export const viewMapping: {
    key: string;
    label: string;
    component: React.ComponentType<{ close: () => void,data:any ,height:any,graphOpt:any}>;
}[] = [
        { key: "chat", label: "聊天窗口", component: ChatView },
        { key: "details", label: "详情", component: NodeView },
        { key: "relation", label: "关系", component: RelationView },
    ];

export const ComponentsRender: FC<{ graphOpt:any,height:any,data:any,view: string; close: () => void }> = ({graphOpt,height,data, view, close }) => {
    if (!view) return <div onClick={close}>未知类型</div>;
    const item = viewMapping.find((v) => v.key === view);
    if (!item) return <div>未知类型</div>;
    const {component:Component,key,...rest} = item
    // const Component = item.component;

    return <Suspense fallback={<Skeleton active></Skeleton>}>
        
        <Component close={close} data={data} {...rest} height={height} graphOpt={graphOpt}/>
    </Suspense>
};
