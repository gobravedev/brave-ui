import { Skeleton } from 'antd';
import { FC, lazy, memo, Suspense } from 'react';

const PipelineFlowComponent = lazy(() => import('./pipeline/components/pipeline-flow'))
const SoftwareComponent = lazy(() => import('./software'))
const ScriptComponent = lazy(() => import('./script'))
const ScriptV2Component = lazy(() => import('./script/indexV2'))

const FileComponent = lazy(() => import('./file'))
const FileV2Component = lazy(() => import('./components/create-or-update-component'))
const CreateOrUpdateComponent = lazy(() => import('./components/create-or-update-component'))
const AnalysisResultPageAdapter = lazy(() => import('./components/analysis-result-page'))
const PipelineInputComponent = lazy(() => import('./pipeline/components/pipeline-input'))
const LLMFile = lazy(()=>import("./components/llm-file"))
const LLMTools = lazy(()=>import("./components/llm-tools"))
const ScriptDesc = lazy(()=>import("./components/script-desc"))
const LLMScript = lazy(()=>import("./components/llm-script"))
const ScriptCode = lazy(()=>import("./components/script-code"))
const ComponentStructure = lazy(()=>import("./components/component-structure"))
const ComponentScript = lazy(()=>import("./components/component-script"))
const PreviewRelationExample = lazy(() => import('./components/preview-example'))
const ScriptView = lazy(() => import('./components/script-view'))
const FileView = lazy(() => import('./components/file-view'))
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
        { key: "createOrUpdateComponent", label: "CreateOrUpdateComponent", component: CreateOrUpdateComponent },
        { key: "analysisResult", label: "analysisResult", component: AnalysisResultPageAdapter },
        
        { key: "llmFile", label: "llmFile", component: LLMFile },
        { key: "llmTools", label: "llmTools", component: LLMTools },
        { key: "llmScript", label: "llmScript", component: LLMScript },
        
        {key:"scriptView", label:"scriptView", component: ScriptView},
        {key:"fileView", label:"fileView", component: FileView},

        { key: "scriptDesc", label: "scriptDesc", component: ScriptDesc },
        { key: "scriptCode", label: "scriptCode", component: ScriptCode },

        { key: "component-structure", label: "component-structure", component: ComponentStructure },
        { key: "component-script", label: "component-script", component: ComponentScript },

        { key: "preview-relation-example", label: "preview-relation-example", component: PreviewRelationExample },



        { key: "workflow-input", label: "workflow-input", component: PipelineInputComponent },

    ];

const ComponentsDetailsRender: FC<any> = ({ view, ...rest }) => {
    if (!view) return null
    const item = viewMapping.find((v) => v.key === view);
    if (!item) return <div>Unknow component {view}</div>;
    const { component: Component, key } = item
    // const Component = item.component;

    return <Suspense fallback={<Skeleton active></Skeleton>} >
        <Component  {...rest} />
    </Suspense>
}

export default memo(ComponentsDetailsRender);