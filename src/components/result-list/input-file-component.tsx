import { FC } from "react"
import ResultList from "./indexV2"
import { Empty } from "antd"

 const InputFileComponent:FC<any> = ({component, operatePipeline,...rest}) => {
    return <>
        {
            Array.isArray(component.inputFile) && component.inputFile.length > 0 ? <ResultList
                software={rest}
                operatePipeline={operatePipeline}
                relationType="software_input_file"
                title={`Input File ${component.inputFile.length > 0 ? "" : component.inputFile.map((it: any) => it.label)}`}
                shouldTrigger={true}
                analysisType={"sample"}
                analysisMethod={component.inputFile}></ResultList> : <>
        
                <Empty></Empty>
            </>
        }
    </>
}

export default InputFileComponent