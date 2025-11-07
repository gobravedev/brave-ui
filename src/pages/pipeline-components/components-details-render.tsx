import { Skeleton } from 'antd';
import { FC, lazy, memo, Suspense } from 'react';

const PipelineFlowComponent = lazy(() => import('./pipeline/components/pipeline-flow'))
const SoftwareComponent = lazy(() => import('./software'))
const ScriptComponent = lazy(() => import('./script'))
const FileComponent = lazy(() => import('./file'))
const PipelineInputComponent = lazy(() => import('./pipeline/components/pipeline-input'))
const viewMapping: {
    key: string;
    label: string;
    component: React.ComponentType<any>;
}[] = [
        { key: "workflow", label: "workflow", component:PipelineFlowComponent },
        {key:"software",label:"software",component:SoftwareComponent},
        {key:"script",label:"script",component:ScriptComponent},
        {key:"file",label:"file",component:FileComponent},
        {key:"workflow-input",label:"workflow-input",component:PipelineInputComponent},

    ];

const ComponentsDetailsRender:FC<any> = ({ view, ...rest }) => {
    if (!view) return null
    const item = viewMapping.find((v) => v.key === view);
    if (!item) return <div>未知类型{view}</div>;
    const { component: Component, key } = item
    // const Component = item.component;
    
    return <Suspense fallback={<Skeleton active></Skeleton>}>
        <Component  {...rest} />
    </Suspense>
}

export default memo(ComponentsDetailsRender);