import { ActionDispatcher } from "@/llmv2/dispatcher";
import ComponentsPage from "./component/page"
import { Button, Empty, Flex } from "antd";
import { useStoreRender } from "@/context/render/RenderProvider";
import axios from "axios";
import { invoke } from "@/core/ui-system/invokeV2";
import { useRef } from "react";


const ScriptPage = () => {
    const { relation } = useStoreRender()
    if (!relation) return <Empty description="No tools found"></Empty>

    const ref = useRef<any>(null)


    const addScriptToNode = async (scriptId: any) => {
        // /tools/script-to-node/{component_id}
        if (!relation.relation_id) {
            console.error("relation_id 不存在！")
            return
        }
        const resp = await axios.get(`/tools/script-to-node/${scriptId}/${relation.relation_id}`)
        // return resp.data
        // console.log("Response from script-to-node API", resp.data)
        const data = {
            action: "component.invoke",
            payload: {
                category: "graph",
                id: relation.relation_id,
                method: "addNode",
                args: resp.data
            }
        }
        ActionDispatcher.dispatch(data.action, data.payload);
    }
    return <div>
        {/* <Button onClick={() => {


        }}>
            addNode
        </Button> */}
        {/* <Flex justify="end" >
          

        </Flex> */}
        <ComponentsPage ref={ref} component_type="script" setComponent={(record: any) => {
            addScriptToNode(record.component_id)
            // console.log("Selected component in ScriptPage", record)
        }} />
    </div>
}
export default ScriptPage