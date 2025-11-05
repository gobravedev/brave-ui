import { Skeleton } from 'antd';
import { FC, lazy, Suspense } from 'react';


const FileBrowser = lazy(() => import('@/components/file-browser'));
const LogFile = lazy(() => import('@/components/log-file'));
const RunningContainer = lazy(() => import('@/components/container'));
const viewMapping: {
    key: string;
    label: string;
    component: React.ComponentType<any>;
}[] = [
        { key: "fileBrowser", label: "fileBrowser", component:FileBrowser },
        {key:"logFile",label:"logFile",component:LogFile},
        {key:"runningContainer",label:"runningContainer",component:RunningContainer},
        // {key:"script",label:"script",component:ScriptComponent},
        // {key:"file",label:"file",component:FileComponent},
        // {key:"workflow-input",label:"workflow-input",component:PipelineInputComponent},

    ];

const ComponentsRender:FC<any> = ({ visible, params, onClose, callback}) => {
    if (!params?.view || !visible) return null
    const view = params?.view
    const item = viewMapping.find((v) => v.key === view);
    if (!item) return <div>unknow {view}</div>;
    const { component: Component, key } = item
    // const Component = item.component;
    
    return <Suspense fallback={<Skeleton active></Skeleton>}>
        <Component  {...params}  onClose={onClose} callback={callback} />
    </Suspense>
}

export default ComponentsRender;