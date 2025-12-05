import { Skeleton } from 'antd';
import { FC, lazy, memo, Suspense } from 'react';

const PipelineFlowComponent = lazy(() => import('./pipeline/components/pipeline-flow'))
const SoftwareComponent = lazy(() => import('./software'))
const ScriptComponent = lazy(() => import('./script'))
const ScriptV2Component = lazy(() => import('./script/indexV2'))

const FileComponent = lazy(() => import('./file'))
const FileV2Component = lazy(() => import('./file/indexV2'))

const PipelineInputComponent = lazy(() => import('./pipeline/components/pipeline-input'))
const viewMapping: {
    key: string;
    label: string;
    component: React.ComponentType<any>;
}[] = [
        { key: "workflow2", label: "workflow", component: PipelineFlowComponent },
        { key: "software", label: "software", component: SoftwareComponent },
        { key: "tools", label: "software", component: SoftwareComponent },

        { key: "script", label: "script", component: ScriptComponent },
        { key: "file", label: "file", component: FileComponent },
        { key: "fileV2", label: "file", component: FileV2Component },

        { key: "scriptV2", label: "script", component: ScriptV2Component },

        { key: "workflow-input", label: "workflow-input", component: PipelineInputComponent },

    ];

const ComponentsDetailsRender: FC<any> = ({ view, ...rest }) => {
    if (!view) return null
    const item = viewMapping.find((v) => v.key === view);
    if (!item) return <div>Unknow component {view}</div>;
    const { component: Component, key } = item
    // const Component = item.component;

    return <Suspense fallback={<Skeleton active></Skeleton>}>
        <Component  {...rest} />
    </Suspense>
}

export default memo(ComponentsDetailsRender);