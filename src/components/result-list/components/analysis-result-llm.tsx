import BigTable from "@/components/big-table"
import AI from "@/components/chat/ai"
import { el } from "@faker-js/faker"
import { Button, Card, Col, Row, Space } from "antd"
import axios from "axios"
import { FC, useEffect, useState } from "react"

const AnalysisResultLLM: FC<any> = ({ file_name, file_type, analysis_result_id, onClose,content }) => {
    const [tableRows, setTableRows] = useState<any[]>([])
    const [tableRowLoading, setTableRowLoading] = useState<boolean>(false)
    const [tableRowsInfo, setTableRowsInfo] = useState<{ nrow: number; ncol: number }>({ nrow: 0, ncol: 0 })
    const [rowNum, setRowNum] = useState<number>(100)
    const [leftOpen, setLeftOpen] = useState<boolean>(false)
    const loadTable = async () => {
        setTableRowLoading(true)
        const resp = await axios.get(`/analysis-result/table/${analysis_result_id}?row_num=${rowNum}`, {
            timeout: 20000
        })
        setTableRows(resp.data.tables)
        setTableRowLoading(false)
        setTableRowsInfo({
            "nrow": resp.data.nrow,
            "ncol": resp.data.ncol
        })
    }

    const openOrCloseFile = () => {
        if (leftOpen) {
            setLeftOpen(false)
        } else {
            setLeftOpen(true)
            if (file_type == "collected") {
                loadTable()
            }
        }

    }
    useEffect(() => {
        setLeftOpen(false)
    }, [analysis_result_id])


    return <Card
        title={`LLM Chat - ${file_name}`}
        extra={<Space>
            <Button size="small" color="cyan" variant="solid" onClick={openOrCloseFile}>{leftOpen ? "Close" : "Open"} File</Button>
            {onClose && <Button size="small" color="blue" variant="solid" onClick={() => onClose()}>Close</Button>}

        </Space>}
        size="small"
    >

        <Row gutter={[16, 16]}>
            {leftOpen && <>
                <Col lg={12} sm={12} xs={24}>
                    {file_type == "collected" ? <>
                        <BigTable 
                        maxHeight={"60vh"}
                        shape={tableRowsInfo} rows={[
                            ...tableRows]} />
                    </> : <Card size="small" title="File Content Preview">
                        <div>Preview not available for file type: {file_type}</div>
                        {JSON.stringify(content)}
                    </Card>}

                </Col>
            </>}

            <Col lg={leftOpen ? 12 : 24} sm={leftOpen ? 12 : 24} xs={24}>
                <Card size="small" title="LLM Assistant">
                    <AI biz_type={"analysis_result"} biz_id={analysis_result_id}></AI>
                </Card>

            </Col>
        </Row>



    </Card>
}

export default AnalysisResultLLM