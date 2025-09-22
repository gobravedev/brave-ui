import { Skeleton } from "antd";
import { FC, lazy, Suspense, useEffect, useState } from "react";

const ChatView = lazy(() => import('./chat'));
const NodeView = lazy(() => import('./details'));
const RelationView = lazy(() => import('./relation'));
const DataFiletr = lazy(()=>import('./data-filter'))
export const viewMapping: {
    key: string;
    label: string;
    component: React.ComponentType<{ close: () => void,data:any ,queryParams:any,height:any,graphOpt:any}>;
}[] = [
        { key: "chat", label: "ai chat", component: ChatView },
        { key: "details", label: "details", component: NodeView },
        { key: "relation", label: "relationship", component: RelationView },
        { key: "dataFilter", label: "data screening", component: DataFiletr },
    ];

export const ComponentsRender: FC<{ graphOpt:any,height:any,data:any,queryParams:any,view: string; close: () => void }> = ({graphOpt,height,data,queryParams, view, close }) => {
    if (!view) return <div onClick={close}>未知类型</div>;
    const item = viewMapping.find((v) => v.key === view);
    if (!item) return <div>未知类型</div>;
    const {component:Component,key,...rest} = item
    // const Component = item.component;

    return <Suspense fallback={<Skeleton active></Skeleton>}>
        
        <Component close={close} data={data} queryParams={queryParams} {...rest} height={height} graphOpt={graphOpt}/>
    </Suspense>
};
