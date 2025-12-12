import AI from "@/components/chat/ai";
import { FC } from "react";

const LLMTools: FC<any> = ({component, callback, openModal, panel, component_type}) => {

    return <>
        <AI biz_type={"tools"} biz_id={component?.relation_id}></AI>
    </>

}

export default LLMTools