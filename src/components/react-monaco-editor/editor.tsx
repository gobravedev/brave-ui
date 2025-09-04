// yarn add @monaco-editor/react
// yarn add monaco-editor

import type { FC } from 'react'
import { useRef } from 'react'
import Editor from '@monaco-editor/react';
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
// import pythonWorker from 'monaco-editor/esm/vs/language/python/ts.worker?worker';
import { Drawer, Modal } from 'antd';

const MonacoEditorComp: FC<any> = ({onChange, value, editorRef, defaultLanguage, format, height }) => {
    // const editorRef = useRef<any>(null);

    self.MonacoEnvironment = {
        getWorker(_, label) {
            if (label === 'json') {
                return new jsonWorker();
            }
            if (label === 'css' || label === 'scss' || label === 'less') {
                return new cssWorker();
            }
            if (label === 'html' || label === 'handlebars' || label === 'razor') {
                return new htmlWorker();
            }
            if (label === 'typescript' || label === 'javascript') {
                return new tsWorker();
            }
            // if (label === 'python') {
            //     return new pythonWorker();
            // }
            return new editorWorker();
        },
    };
    loader.config({ monaco });
    // loader.init().then(/* ... */);
    function handleEditorDidMount(editor: any, monaco: any) {
        if (editorRef) {
            editorRef.current = editor;
            if (format) {
                editor.onDidChangeModelDecorations(async () => {
                    await editorRef.current.getAction('editor.action.formatDocument').run();
                });
               
            }
        }

    }

    function showValue() {
        alert(editorRef.current.getValue());
    }


    return <>
        {/* <button onClick={showValue}>Show value</button> */}
        <Editor
            height={height ? height : "65vh"}
            value={value}
            theme="vs-dark"
            onChange={onChange}
            defaultLanguage={defaultLanguage}
            //   defaultValue={defaultValue}
            onMount={handleEditorDidMount}
            options={{
                formatOnPaste: true
            }}
        />
    </>
}

export default MonacoEditorComp




