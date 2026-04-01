import { FC } from "react"
import ResultList from "./indexV2"
import { Empty } from "antd"

 const OutputFileComponent:FC<any> = ({component, operatePipeline,...rest}) => {
    return <>
        {
            Array.isArray(component.outputFile) && component.outputFile.length > 0 ? <ResultList
                software={rest}
                operatePipeline={operatePipeline}
                relationType="software_output_file"
                title={`Output File ${component.outputFile.length > 0 ? "" : component.outputFile.map((it: any) => it.label)}`}
                shouldTrigger={true}
                analysisType={"sample"}
                analysisMethod={component.outputFile}></ResultList> : <>
        
                <Empty></Empty>
            </>
        }
    </>
}

export default OutputFileComponent