import { useGlobalMessage } from "@/hooks/useGlobalMessage";
import { Empty, Modal, Popconfirm, Space, Tabs, Tooltip } from "antd"
import axios from "axios";
import { FC, useEffect, useState } from "react"
import { useSelector } from "react-redux";
import { DownloadOutlined } from "@ant-design/icons";
import BigTable from "@/components/big-table";
const PreviewRelationExample: FC<any> = ({ visible, params, onClose, callback }) => {
    if (!visible) return null;
    const [data, setData] = useState<any>([]);
    const { project, baseURL } = useSelector((state: any) => state.user);
    const message = useGlobalMessage();
    const [tabKey, setTabKey] = useState<string>();

    useEffect(() => {
        if (visible && params?.relation_id && params?.inputFile) {
            if (Array.isArray(params?.inputFile) && params?.inputFile.length > 0) {
                const input_file_component_id = params?.inputFile[0]?.component_id
                loadData(params?.relation_id, input_file_component_id);
                setTabKey(input_file_component_id);
            }
        }
    }, [params?.relation_id, params?.inputFile])

    // useEffect(() => {
    //     if (tabKey && params?.relation_id) {
    //         loadData(params?.relation_id, tabKey);
    //     }
    // }, [tabKey])

    const loadData = async (relation_id: any, input_file_component_id: any) => {
        const resp = await axios.get(`/analysis-result/preview-example/${relation_id}/${input_file_component_id}`)
        setData(resp.data);
    }

    return <Modal open={visible} onCancel={onClose} width={"70%"}
        footer={<Space>



        </Space>} title="Preview Example">

        {params?.inputFile ? <>
            <Tabs
                tabBarExtraContent={data?.url && <Space>

                    <Tooltip title={`Download Example File ${data.url}`}>
                        <a onClick={async () => {
                            // const resp = await axios.get(`/analysis-result/download-example/${params.component_id}`)
                            window.open(`${baseURL}${data.url}`, '_blank');
                            message.success(`Example ${baseURL}${data.url} downloading...`)
                        }}> <DownloadOutlined /></a>
                    </Tooltip>

                    <Popconfirm title="Confirm adding example?" onConfirm={async () => {
                        await axios.post(`/analysis-result/add-example/${data?.component_id}?project=${project}&path=${data?.suffix}`)
                        message.success("Example added successfully!")
                        // reload()
                        callback && callback();
                        onClose();
                    }}>
                        <a>Import</a>
                    </Popconfirm>
                </Space>}
                activeKey={tabKey}
                onChange={(val:any)=>{
                    setTabKey(val)
                    loadData(params?.relation_id, val);
                }}
                items={params?.inputFile.map((file: any) => ({
                    key: file.component_id,
                    label: <Space>
                        <Tooltip title={data?.path}>
                            {file.component_name}
                        </Tooltip>


                    </Space>,
                    children: <>

                        {data?.error ? <>
                            {JSON.stringify(data, null, 2)}
                        </> : <>
                            {data?.content?.tables && <>
                                <BigTable shape={{}} rows={data?.content?.tables} />
                            </>}
                        </>}
                    </>
                }))}></Tabs>
        </> : <>
            <Empty description="No Input File"></Empty>
        </>
        }


        {/* {JSON.stringify(params?.inputFile, null, 2)} */}

        {/* {JSON.stringify(data, null, 2)} */}
        {/* {project} */}



        {/* <BigTable shape={tableRowsInfo} rows={[tableColumns,
            ...filteredData]} /> */}
    </Modal >
}

export default PreviewRelationExample;