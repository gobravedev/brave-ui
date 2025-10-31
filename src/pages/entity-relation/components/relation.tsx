import { Button, Card, Flex, List, Popconfirm, Tag, Typography } from "antd"
import { FC, useEffect, useState } from "react"
import { CloseOutlined, DeleteOutlined, RedoOutlined } from '@ant-design/icons'
import axios from "axios"
import { useOutletContext } from "react-router"

const RelationView: FC<any> = ({ close, height, data: params, loadGraph, ...rest }) => {
    const [data, setData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(false)
    const { messageApi } = useOutletContext<any>()

    const loadData = async () => {
        setLoading(true)
        const resp = await axios.get(`/entity-relation/find-by-paired-entity/${params?.fromNode?.id}/${params?.toNode?.id}`)
        setData(resp.data)
        setLoading(false)
    }
    useEffect(() => {
        if (params?.fromNode && params?.toNode) {
            loadData()
        }

    }, [params?.fromNode, params?.toNode])
    return <Card
        loading={loading}
        styles={{
            body: {
                padding: "0.5rem",
                height: "100%",
                overflowY: "auto"
            }
        }}
        title={<>
            {`${rest?.label} (${params?.fromNode?.label})->(${params?.toNode?.label})`}
            {/* <Tag style={{ marginLeft: "0.5rem" }}>{params?.label}</Tag> */}
        </>}
        size="small"
        extra={<>
            <Flex gap="small">
                <Popconfirm title={`删除(${data?.from_name})-[${data?.type}]-(${data?.to_name})?`} onConfirm={async () => {
                    await axios.delete(`/entity-relation/relation/${data.rid}`)
                    messageApi.success("删除成功")
                    close()
                    loadGraph()
                }}>
                    <DeleteOutlined />
                </Popconfirm>
                <RedoOutlined onClick={loadData} />

                <CloseOutlined onClick={close} />
            </Flex>
        </>}
        style={{
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            padding: "0.5rem",
            overflow: "hidden",
            height: height,
        }}
    >
        {/* {JSON.stringify()} */}

        <StudyList data={data?.map((it:any)=>it.study)}></StudyList>


        {/* <Button size="small" danger variant="solid" onClick={async () => {
            await axios.delete(`/entity-relation/relation/${data.rid}`)
            messageApi.success("删除成功")
        }}>删除</Button> */}

    </Card>
}
export default RelationView






// const data = [
//     {
//         entity_id: '2ygM3iJ9yeGdWPgHHfpaPD',
//         entity_name: 'Zhang Q 2021',
//         title: 'Comparison of gut microbiota between adults with autism spectrum disorder and obese adults',
//         pmid: '33717692',
//         doi: '10.7717/peerj.10946',
//     },
// ];


function StudyList({data}:any) {
    return (
        <Card title="Supporting Studies">
            <List
                itemLayout="vertical"
                dataSource={data}
                renderItem={(study:any) => (
                    <List.Item key={study.entity_id}>
                        {/* <Typography.Title level={5}>{study.entity_name}</Typography.Title> */}
                        <Typography.Paragraph>{study.title}</Typography.Paragraph>
                        <div>
                            <Tag color="blue">PMID: {study.pmid}</Tag>
                            <Tag color="green">DOI: {study.doi}</Tag>
                        </div>
                    </List.Item>
                )}
            />
        </Card>
    );
}