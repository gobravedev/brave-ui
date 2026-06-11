
import React from 'react';
// import { DocumentEditor } from "@onlyoffice/document-editor-react";

var onDocumentReady = function (event:any) {
    console.log("Document is loaded");
};

var onLoadComponentError = function (errorCode:any, errorDescription:any) {
    switch(errorCode) {
        case -1: // Unknown error loading component
            console.log(errorDescription);
            break;

        case -2: // Error load DocsAPI from http://documentserver/
            console.log(errorDescription);
            break;

        case -3: // DocsAPI is not defined
            console.log(errorDescription);
            break;
    }
};

// http://localhost:8080/test1.xlsx
const OnlyOffice = () => {
    const origin = window.location.origin;
    const onlyOfficeDocURL = "http://198.19.5.216:8000/test1.xlsx";
    const callbackBaseURL = "http://198.19.5.216:8084";
    const docPath = "/home/admin/Downloads/test1.xlsx";
    return <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* <DocumentEditor
            id="docxEditor"
            documentServerUrl={`${origin}/onlyoffice/`}
            height="100%"
            width="100%"
            config={{
                "document": {
                    "fileType": "xlsx",
                    "key": "test1xlsx",
                    "title": "test1.xlsx",
                    "url": onlyOfficeDocURL,
                    "permissions": {
                        "edit": true,
                        "download": true,
                        "print": true
                    }
                },
                "documentType": "cell",
                "editorConfig": {
                    "mode": "edit",
                    "callbackUrl": `${callbackBaseURL}/go-onlyoffice/callback?path=${encodeURIComponent(docPath)}`,
                    "userdata": JSON.stringify({ path: docPath }),
                    "customization": {
                        "forcesave": true
                    }
                },
                "events": {
                    "onDocumentReady": onDocumentReady
                }
            }}
            onLoadComponentError={onLoadComponentError}
        /> */}
    </div>
}

export default OnlyOffice;