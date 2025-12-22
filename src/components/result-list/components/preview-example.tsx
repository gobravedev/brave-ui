import { useGlobalMessage } from "@/hooks/useGlobalMessage";
import { Modal, Popconfirm, Space, Tooltip } from "antd"
import axios from "axios";
import { FC, useEffect, useState } from "react"
import { useSelector } from "react-redux";
import { DownloadOutlined } from "@ant-design/icons";
import BigTable from "@/components/big-table";
const PreviewExample: FC<any> = ({ visible, params, onClose, callback }) => {
    if (!visible) return null;
    const [data, setData] = useState<any>([]);
    const { project, baseURL } = useSelector((state: any) => state.user);
    const message = useGlobalMessage();
    useEffect(() => {
        if (visible && params?.component_id) {
            loadData();
        }
    }, [params?.component_id])

    const loadData = async () => {
        const resp = await axios.get(`/analysis-result/preview-example/${params.component_id}`)
        setData(resp.data);
    }

    return <Modal open={visible} onCancel={onClose} width={"60%"}
        footer={<Space>
            <Popconfirm title="Confirm adding example?" onConfirm={async () => {
                await axios.post(`/analysis-result/add-example/${params.component_id}?project=${project}`)
                message.success("Example added successfully!")
                // reload()
                callback && callback();
            }}>
                <a>Example</a>
            </Popconfirm>

            <Tooltip title="Download Example File">

                <a onClick={async () => {
                    const resp = await axios.get(`/analysis-result/download-example/${params.component_id}`)
                    window.open(`${baseURL}${resp.data.example_url}`, '_blank');
                    message.success(`Example ${baseURL}${resp.data.example_url} downloading...`)
                }}> <DownloadOutlined /></a>
            </Tooltip>
        </Space>} title="Preview Example">

        {data?.error ? <>
            {JSON.stringify(data, null, 2)}
        </> : <>

            {data?.tables && <>
                <BigTable shape={{}} rows={data?.tables} />
            </>}
            {/* {JSON.stringify(data, null, 2)} */}
            {/* <BigTable shape={tableRowsInfo} rows={[]} /> */}
        </>}
        {/* {JSON.stringify(data, null, 2)} */}
        {/* {project} */}



        {/* <BigTable shape={tableRowsInfo} rows={[tableColumns,
            ...filteredData]} /> */}
    </Modal>
}

export default PreviewExample;