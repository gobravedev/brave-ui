import { useModal } from "@/hooks/useModal"
import { Alert, Button, Card, Flex, List, Popconfirm, Skeleton, Space, Table } from "antd"
import axios from "axios"
import { FC, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { RedoOutlined } from "@ant-design/icons"
import { InspectPanel } from "@/pages/container"
const RunningContainer: FC<any> = ({ analysis_id, onClose }) => {
    const [data, setData] = useState<any>([])
    const [loading, setLoading] = useState<boolean>(false)
    const { baseURL } = useSelector((state: any) => state.user)
    const [event, setEvent] = useState<any>()
    const sseData = useSelector((state: any) => state.global.sseData)
    const { modal, openModal, closeModal } = useModal();

    useEffect(() => {
        try {
            const sseData_ = sseData
            if (sseData_.event == "analysis_complete" || sseData_.event == "analysis_failed" || sseData_.event == "analysis_started") {
                loadData(false)
                setEvent(sseData_)
            }
        } catch (error) {

        }

    }, [sseData])
    const loadData = async (force: any) => {
        setLoading(true)
        // const resp = await axios.get(`/container/list-running-container?force=${force}`)
        const resp = await axios.post(`/container/find-running-container`, {
            analysis_id: analysis_id,
        })
        setData(resp.data)
        setLoading(false)
    }

    useEffect(() => {
        loadData(false)
    }, [baseURL])


    return <Card size="small" title={<>
        <Flex justify={"space-between"} align={"center"}>
            <div>Running Container ({analysis_id})</div>

        </Flex>

    </>}
        extra={<Space>
            {/* {JSON.stringify(event)} */}
            {onClose && <Button size="small" color="blue" variant="solid" onClick={() => onClose()}>Close</Button>}
            {/* <RedoOutlined style={{ cursor: "pointer" }} ></RedoOutlined> */}
            <Button size="small" icon={<RedoOutlined />} color="cyan" variant="solid" onClick={() => loadData(true)}>Refresh</Button>
        </Space>}
        style={{ marginBottom: "1rem" }}>
        {event && <Alert message={`${event.run_id}: ${event.event}`} type="success" />}


        {/* <List
            className="demo-loadmore-list"
            loading={loading}
            itemLayout="vertical"
            dataSource={data}
            renderItem={(item: any) => (
                <List.Item
                    actions={[
                        <Flex gap={"small"}>
                            <Popconfirm title="Stop?" onConfirm={async () => {
                                await axios.post(`/container/stop-container-by-run-id/${item.name}`)
                            }}>
                                <Button size="small" color="cyan" variant="solid">Stop</Button>
                            </Popconfirm>
                            <Button size="small" color="cyan" variant="solid"
                                onClick={() => {
                                    openModal("inspectPanel", {
                                        inspect: "inspect",
                                        id: item.name
                                    })
                                }}  >Inspect</Button>
                            <Button size="small" color="cyan" variant="solid"
                                onClick={() => {
                                    openModal("inspectPanel", {
                                        inspect: "image-inspect",
                                        id: item.image_id
                                    })
                                }}  >Image Inspect</Button>
                        </Flex>


                    ]}
                >
                    <Skeleton avatar title={false} loading={item.loading} active>
                        <List.Item.Meta

                            title={<p style={{ wordWrap: "break-word" }}>{item.image}</p>}
                            description={item.name}
                        />
                    </Skeleton>
                </List.Item>
            )}
        /> */}
        <ContainerTable
            data={data}
            loading={loading}
            openModal={openModal}
        ></ContainerTable>
        <InspectPanel
            visible={modal.key == "inspectPanel" && modal.visible}
            params={modal.params}
            onClose={closeModal}
        ></InspectPanel>


    </Card>
}
export default RunningContainer;



interface ContainerItem {
    analysis_id: string;
    image: string;
    run_id: string;
    name: string;
    id: string;
    image_id: string;
    status: string;
}

interface Props {
    data: ContainerItem[];
    loading: boolean;
    openModal: (key: string, params: any) => void;
}

const ContainerTable: React.FC<Props> = ({ data, loading, openModal }) => {
    const columns = [
         {
            title: "Status",
            dataIndex: "status",
            key: "status",
            ellipsis: true,
        },{
            title: "Image",
            dataIndex: "image",
            key: "image",
            ellipsis: true,
            render: (text: string) => (
                <p style={{ wordBreak: "break-all", margin: 0 }}>{text}</p>
            ),
        },
        {
            title: "Container Name",
            dataIndex: "name",
            key: "name",
            render: (text: string) => (
                <span style={{ fontFamily: "monospace" }}>{text}</span>
            ),
        },
        {
            title: "Analysis ID",
            dataIndex: "analysis_id",
            key: "analysis_id",
            ellipsis: true,
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, item: ContainerItem) => (
                <Flex gap="small">
                    <Popconfirm
                        title="Stop?"
                        onConfirm={async () => {
                            await axios.post(`/container/stop-container-by-run-id/${item.name}`);
                        }}
                    >
                        <Button size="small" color="cyan" variant="solid">
                            Stop
                        </Button>
                    </Popconfirm>

                    <Button
                        size="small"
                        color="cyan"
                        variant="solid"
                        onClick={() =>
                            openModal("inspectPanel", { inspect: "inspect", id: item.name })
                        }
                    >
                        Inspect
                    </Button>

                    <Button
                        size="small"
                        color="cyan"
                        variant="solid"
                        onClick={() =>
                            openModal("inspectPanel", { inspect: "image-inspect", id: item.image_id })
                        }
                    >
                        Image Inspect
                    </Button>
                </Flex>
            ),
        },
    ];

    return (
        <Table
            scroll={{ x: 'max-content', y: 55 * 5 }}
            loading={loading}
            rowKey="id"
            columns={columns}
            dataSource={data}
            pagination={false}
            bordered
            size="small"
            footer={()=><>
            A total of {data.length} running container{data.length>1?"s":""}
            </>}
        />
    );
};

