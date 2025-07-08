import { Button, Card, Col, Empty, Flex, message, notification, Pagination, Popconfirm, Row, Spin, Tag, Tooltip } from "antd"
import Item from "antd/es/list/Item"
import { FC, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useOutletContext, useParams } from "react-router"
import { ApartmentOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

import Meta from "antd/es/card/Meta"
import { colors } from '@/utils/utils'
import { pagePipelineComponents } from '@/api/pipeline'
import { CreateOrUpdatePipelineComponent } from '@/components/create-pipeline'
import axios from "axios"
import { useModal } from "@/hooks/useModal"
import { usePagination } from "@/hooks/usePagination"
import path from "path"
import { CreateOrUpdateNamespace, InstallNamespace } from "../namespace-operature"
import DependComponent from "../depend-component"
const PipelineComponentsCard: FC<any> = ({ params, map }) => {
    // const [pipelineComponents, setPipelineComponents] = useState<any>([])

    const { data: pipelineComponents, pageNumber, totalPage, loading, reload, pageSize, setPageNumber } = usePagination({
        pageApi: pagePipelineComponents,
        params: params || {},
        map: map ? map : (item: any) => ({
            id: item.id,
            component_id: item.component_id,
            name: item.name,
            category: item.category,
            img: item.img,
            tags: item.tags,
            description: item.description,
            order: item.order_index,
            path: `/pipeline/${item.component_id}`,
            namespace: item.namespace,
            namespace_name: item.namespace_name
        })
    })
    // result = {
    //     "id":item.id,
    //     "component_id":item.component_id,
    //     "path":item.component_id,
    //     "name":data['name'],
    //     "category":data['category'],
    //     "img":f"/brave-api/img/{data['img']}",
    //     "tags":data['tags'],
    //     "description":data['description'] if 'description' in data else "",
    //     "order":item.order_index
    // }

    const navigate = useNavigate();
    const { messageApi } = useOutletContext<any>()
    const { modal, openModal, closeModal } = useModal();

    // const menuItems = useSelector((state: any) => state.menu.items)
    // const sseData = useSelector((state: any) => state.global.sseData)

    // const loadPipeine = async () => {
    //     const resp: any = await pagePipelineComponents({})
    //     // console.log(data)
    //     // const menu = data.map((group: any) => ({
    //     //     name: group.name,
    //     //     items: group.items.map((item: any) => {
    //     //         const { path, name, ...rest } = item
    //     //         return {
    //     //             key: `pipeline/${path}`,
    //     //             label: name,
    //     //             ...rest
    //     //         }
    //     //     })
    //     // }));
    //     console.log(resp)

    //     // setMenu(menu)
    // }
    // const datelePipeline = async (pipelineId: any) => {
    //     try {
    //         const resp = await axios.delete(`/delete-pipeline/${pipelineId}`)
    //         messageApi.success("删除成功!")
    //         loadPipeine()
    //     } catch (error: any) {
    //         console.log(error)
    //         messageApi.error(`删除失败!${error.response.data.detail}`)
    //     }
    // }
    // useEffect(() => {
    //     loadPipeine()
    //     // console.log(menu)
    // }, [])

    // indivi
    return <div style={{ maxWidth: "1500px", margin: "1rem auto" }}>
        {/* {JSON.stringify(sseData)} */}
        <Flex justify="flex-end" gap="small">
            <Button color="cyan" variant="solid" onClick={() => {

                openModal("modalA", {
                    data: undefined,
                    structure: {
                        component_type: "pipeline",
                    }
                })
            }}>创建管道</Button>



            <Button color="cyan" variant="solid" onClick={() => {
                openModal("modalB")
            }}>创建/更新namespace</Button>
            <Button color="cyan" variant="solid" onClick={() => {
                openModal("modalC")
            }}>安装namespace</Button>
            <Button color="primary" variant="solid" onClick={reload}>刷新</Button>
        </Flex>
        <div style={{ marginBottom: "2rem" }}>
        </div>
        <Spin spinning={loading}>
            {Array.isArray(pipelineComponents) && pipelineComponents.length != 0 ? <Row gutter={16} style={{ position: "relative" }}>

                {pipelineComponents.map((item: any, index: any) => (
                    <Col key={index} lg={4} sm={6} xs={24} style={{ marginBottom: "1rem", cursor: "pointer" }}>
                        <Card hoverable
                            // title={item.label}
                            // variant="borderless" 
                            style={{
                                height: "100%"
                            }}
                            cover={<img alt={item.label} src={item.img} />}
                            onClick={() => navigate(`${item.path}`)}>


                            <Meta title={<>
                                {item.name}
                                <Tooltip title={item?.namespace}>
                                    <span style={{ margin: "0", color: "rgba(0, 0, 0, 0.45)", fontSize: "0.5rem" }}> {item?.namespace_name}</span>
                                </Tooltip>
                            </>} description={item?.description} style={{ marginBottom: "1rem" }} />
                            {item.tags && Array.isArray(item.tags) && item.tags.map((tag: any, index: any) => (
                                <Tooltip key={index} title={tag}>
                                    <Tag style={{
                                        wordBreak: "break-word",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        maxWidth: 100,
                                        display: "inline-block",
                                        cursor: "default"
                                    }} color={colors[index]}>{tag}</Tag>
                                </Tooltip>

                            ))}
                            {/* {JSON.stringify(item)} */}
                            <div onClick={(e) => {
                                e.stopPropagation()
                                openModal("modalG", item)
                                // setCreateOpen(true)
                                // console.log(item)
                                // setRecord(item)
                            }} style={{
                                position: "absolute",
                                right: 10,
                                bottom: 10,
                                fontSize: 15,
                                color: "rgba(0,0,0,0.45)",
                                cursor: "pointer",
                            }}>
                                <ApartmentOutlined />
                            </div>
                            {/* <div style={{
                                position: "absolute",
                                right: 40,
                                bottom: 10,
                                fontSize: 15,
                                color: "rgba(0,0,0,0.45)",
                                cursor: "pointer",
                            }}>
                                <Tooltip title={item.namespace}>
                                    {item.namespace_name}
                                </Tooltip>
                            </div> */}
                            {/* <EditOutlined
                                onClick={(e) => {
                                    e.stopPropagation()
                                    openModal("modalA", {
                                        data: item,
                                        structure: {
                                            component_type: "pipeline",
                                        }
                                    })
                                    // setCreateOpen(true)
                                    // console.log(item)
                                    // setRecord(item)
                                }}
                                style={{
                                    position: "absolute",
                                    right: 40,
                                    bottom: 10,
                                    fontSize: 15,
                                    color: "rgba(0,0,0,0.45)",
                                    cursor: "pointer",
                                }}
                            />
                            <Popconfirm title="是否删除?" onConfirm={(e: any) => {
                                e.stopPropagation();
                                datelePipeline(item.pipeline_id)
                            }} onCancel={(e: any) => { e.stopPropagation() }} >
                                <DeleteOutlined
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        position: "absolute",
                                        right: 10,
                                        bottom: 10,
                                        fontSize: 15,
                                        color: "rgba(0,0,0,0.45)",
                                        cursor: "pointer",
                                    }}
                                />
                            </Popconfirm> */}
                        </Card>
                    </Col>
                ))}

            </Row> : <Empty></Empty>}
        </Spin>

        {totalPage != 0 && <Flex style={{ marginTop: "1rem" }} align="center">
            一共{totalPage}条数据 &nbsp;
            <Pagination
                current={pageNumber}
                pageSize={pageSize}
                total={totalPage}
                onChange={(p) => setPageNumber(p)}
                showSizeChanger={false}
            />
        </Flex>}
        {/* <CreatePipeline
            callback={loadPipeine}
            pipelineStructure={{
                pipeline_type: "wrap_pipeline",
                parent_pipeline_id: "0"

            }}
            open={createOpen}
            setOpen={setCreateOpen}
            data={record}></CreatePipeline> */}

        <CreateOrUpdatePipelineComponent
            callback={reload}
            // pipelineStructure={pipelineStructure}
            // data={record}
            visible={modal.key == "modalA" && modal.visible}
            onClose={closeModal}
            params={modal.params}></CreateOrUpdatePipelineComponent>

        <CreateOrUpdateNamespace
            visible={modal.key == "modalB" && modal.visible}
            onClose={closeModal}
            params={modal.params}></CreateOrUpdateNamespace>
        <InstallNamespace
            visible={modal.key == "modalC" && modal.visible}
            onClose={closeModal}
            params={modal.params}></InstallNamespace>

        <DependComponent
            visible={modal.key == "modalG" && modal.visible}
            onClose={closeModal}
            callback={reload}
            params={modal.params}></DependComponent>
    </div>
}

export default PipelineComponentsCard