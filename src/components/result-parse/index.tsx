import { Button, message, Modal, Spin, Typography } from "antd"
import axios from "axios";
import { FC, useEffect, useState } from "react"
import { useOutletContext } from "react-router";
export const parseAnalysisResultAPi = (id: any, save: boolean) => axios.post(`/fast-api/parse-analysis-result/${id}?save=${save}`)

const ResultParse: FC<any> = ({ visible, onClose, params, callback }) => {
    if (!visible) return null;
    const [data, setData] = useState<any>()
    const [loading, setLoading] = useState<any>()
    const {messageApi} = useOutletContext<any>()
    const loadData = async (save:boolean) => {
        setLoading(true)
        try{
            const resp = await parseAnalysisResultAPi(params.analysis_id, save)
            setData(resp.data)
            setLoading(false)
            if(callback && save){
                callback()
            }
        }catch(error:any){
            setLoading(false)
            messageApi.error(error.response.data.detail)
        }
    }
    useEffect(() => {
        loadData(false)
    }, [JSON.stringify(params)])
    return <>
        <Modal
            title="结果解析"
            footer={<>
                <Button type="primary" onClick={()=>loadData(false)}>刷新</Button>
                <Button type="primary" onClick={()=>{loadData(true);onClose()}}>解析</Button>
            </>}
            open={visible}
            onCancel={onClose}
            onClose={onClose}

            width={"70%"}>
            <Spin spinning={loading}>
                <Typography>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </Typography>
            </Spin>

        </Modal>
    </>
}

export default ResultParse