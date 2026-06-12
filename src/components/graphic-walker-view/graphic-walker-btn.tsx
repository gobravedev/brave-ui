import { invoke } from "@/core/ui-system/invokeV2"
import { Button } from "antd"
import { FC } from "react"

const GraphicWalkerBtn:FC<any> = ({analysis_result_id}) => {

    return <Button size="small" onClick={() => {
            invoke.graphicWalkerContent.open({
                analysis_result_id: analysis_result_id
            }, {
                title: "Data Explore",
                width: "90%",
                footer: null
            })
        }}>点击查看数据</Button>
}

export default GraphicWalkerBtn;