
import Code from "@/components/module-edit/code"
import React from "react"


const ScriptCode: React.FC<any> = ({ script_id }) => {
    return <>
        <Code script_id={script_id}></Code>
    </>
}

export default ScriptCode