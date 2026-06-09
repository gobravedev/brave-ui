import { Drawer, Skeleton, Spin } from "antd";
import { FC, lazy, Suspense } from "react";
const MonacoEditorComp = lazy(() => import('./editor'));
// import  MonacoEditorComp from './editor'



export const MonacoEditor: FC<any> = ({ onChange, value, editorRef, defaultLanguage, format, height, onEditorMount }) => {
    return <>
        <Suspense fallback={<Skeleton active></Skeleton>}>
            
            <MonacoEditorComp onChange={onChange} value={value} editorRef={editorRef} defaultLanguage={defaultLanguage} format={format} height={height} onEditorMount={onEditorMount} > </MonacoEditorComp>

        </Suspense>
    </>
}

const MonacoEditorModal: FC<any> = ({ visible, onClose, value, editorRef, defaultLanguage, format, height }) => {
    if (!visible) return null;
    return <Drawer open={visible} onClose={onClose}>
        <MonacoEditor value={value} editorRef={editorRef} defaultLanguage={defaultLanguage} format={format} height={height} />
    </Drawer>
}

export default MonacoEditorModal