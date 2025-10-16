import { Button, Card, Col, Empty, Flex, Input, List, message, Modal, notification, Pagination, Popconfirm, Row, Segmented, Skeleton, Spin, Tabs, Tag, Tooltip } from "antd"
import Item from "antd/es/list/Item"
import { FC, use, useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useOutletContext, useParams } from "react-router"
import { ApartmentOutlined, CopyOutlined, DeleteOutlined, DownloadOutlined, EditOutlined, RedoOutlined } from '@ant-design/icons';

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
import "./index.css"
import { base } from "@faker-js/faker"
import { useGlobalMessage } from "@/hooks/useGlobalMessage"
const PipelineComponentsCard: FC<any> = ({ params, map }) => {
    const { Search } = Input;
    // const [searchText, setSearchText] = useState("");
    const { baseURL } = useSelector((state: any) => state.user)
    const navigate = useNavigate();
    const { messageApi } = useOutletContext<any>()
    const { modal, openModal, closeModal } = useModal();
    const [activeCategory, setActiveCategory] = useState<string | null>("all");

    // const [pipelineComponents, setPipelineComponents] = useState<any>([])
    const { component_type } = params
    const mapFun = (item: any) => {
        if (map) {
            item = map(item)
        }
        if (item["tags"]) {
            item["tags"] = JSON.parse(item["tags"])
        }
        // console.log(item)
        return {
            id: item.id,
            component_id: item.component_id,
            name: item.name,
            category: item.category,
            img: item.img,
            tags: item.tags,
            component_type: item.component_type,
            // description: item.description,
            order: item.order_index,
            path: `/component/${component_type}/${item.component_id}`,
            namespace: item.namespace,
            namespace_name: item.namespace_name
        }

    }
    // const params_ = {
    //     ...params,
    //     keywords:searchText

    // }
    const { data: pipelineComponents, pageNumber, totalPage, loading, reload, pageSize, setPageNumber, search } = usePagination({
        pageApi: pagePipelineComponents,
        params: { category: activeCategory, ...params },
        map: mapFun,
        initialPageSize: 12
    })
    const [category, setCategory] = useState<any[]>([])
    const [categoryLoading, setCategoryLoading] = useState(false)
    const loadCateory = async () => {
        setCategoryLoading(true)
        const resp = await axios.get(`/component/get-all-category`)
        setCategory(["all", ...resp.data])
        setCategoryLoading(false)
    }
    useEffect(() => {
        loadCateory()
    }, [])
    // useEffect(() => {
    //     const loadData = async () => {

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
    //     }
    // }
    // useEffect(() => {
    //     loadPipeine()
    //     // console.log(menu)
    // }, [])

    // indivi
    return <div style={{ maxWidth: "1800px", margin: "1rem auto" }}>
        {/* {JSON.stringify(sseData)} */}
        <Card size="small">
            <Flex justify="space-between" gap="small">
                <Search
                    size="small"
                    placeholder="Search Components"
                    allowClear
                    enterButton
                    onSearch={(value) => { search(value) }}
                    style={{ width: 400 }}
                />
                <Flex gap="small">
                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                        openModal("installComponents", { component_type: component_type })
                    }}>Intsall Components </Button>

                    <Button size="small" color="cyan" variant="solid" onClick={() => {

                        openModal("modalA", {
                            data: undefined,
                            structure: {
                                component_type: component_type,
                            }
                        })
                    }}>Create Components </Button>



                    {/* <Button size="small" color="cyan" variant="solid" onClick={() => {
                    openModal("modalB")
                }}>Create/Update  namespace</Button> */}
                    {/* <Button size="small" color="cyan" variant="solid" onClick={() => {
                    openModal("modalC")
                }}>Install namespace</Button> */}
                    <Button size="small" color="primary" variant="solid" onClick={reload}>Refresh</Button>
                </Flex>
            </Flex>
        </Card>
        {/* <div style={{ marginBottom: "2rem" }}>
        </div> */}

        {/* {JSON.stringify(pipelineComponents)} */}

        <Row style={{ marginTop: "1rem" }} gutter={16}>
            <Col lg={21} sm={21} xs={24} >
                <Card size="small">
                    <Spin spinning={loading}>
                        {Array.isArray(pipelineComponents) && pipelineComponents.length != 0 ? <Row gutter={16} style={{ position: "relative" }}>

                            {pipelineComponents.map((item: any, index: any) => (
                                <Col key={index} lg={6} sm={4} xs={24} style={{ marginBottom: "1rem", cursor: "pointer" }}>
                                    <Card hoverable
                                        size="small"
                                        className="custom-card"
                                        // title={item.label}
                                        // variant="borderless" 
                                        style={{
                                            height: "100%",
                                            border: "1px solid #f0f0f0",   // 默认灰色边框
                                            borderRadius: "12px",          // 圆角
                                            overflow: "hidden",
                                            transition: "all 0.3s ease",   // 平滑过渡

                                        }}
                                        bodyStyle={{
                                            padding: "12px 16px",          // 内边距更紧凑
                                        }}
                                        cover={<div style={{ height: "15rem" }}>
                                            <img style={{ height: "100%", width: "100%", objectFit: "cover" }} alt={item.label} src={`${baseURL}${item.img}`} />
                                        </div>}
                                        onClick={() => navigate(`${item.path}`)}>


                                        <Meta title={<Flex gap={"small"}>
                                            <span>{item.name}</span>
                                            <Popconfirm title="Copy component ?" onConfirm={async (e: any) => {
                                                e.stopPropagation()
                                                await axios.post(`/copy-component/${item.component_id}`)
                                                message.success("Component copied!")
                                                reload()
                                            }}>

                                                <CopyOutlined onClick={(e) => {
                                                    e.stopPropagation()

                                                }} />

                                            </Popconfirm>
                                            {/* <Tooltip title={item?.namespace}>
                                    <span style={{ margin: "0", color: "rgba(0, 0, 0, 0.45)", fontSize: "0.5rem" }}> {item?.namespace_name}</span>
                                </Tooltip> */}
                                        </Flex>} description={item?.description} style={{ marginBottom: "1rem" }} />
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
                </Card>
            </Col>
            <Col lg={3} sm={3} xs={24}>
                <Card
                    extra={<RedoOutlined style={{ cursor: "pointer" }} onClick={() => loadCateory()} />}
                    size="small"
                    loading={categoryLoading}
                    title={<span style={{ fontWeight: 600 }}>Category</span>}
                    bordered={false}
                    style={{
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        height: "100%",
                    }}
                    bodyStyle={{ padding: "0.75rem" }}
                >
                    {categoryLoading ? (
                        <Skeleton active paragraph={{ rows: 5 }} />
                    ) : (
                        <List
                            dataSource={category}
                            split={false}
                            renderItem={(item) => (
                                <List.Item
                                    style={{
                                        padding: "6px 0",
                                        border: "none",
                                    }}
                                >
                                    <Button
                                        block
                                        type={activeCategory === item ? "primary" : "default"}
                                        onClick={() => setActiveCategory(item)}
                                        style={{
                                            textAlign: "left",
                                            borderRadius: "8px",
                                            transition: "all 0.2s",
                                        }}
                                        className="hover:shadow-md"
                                    >
                                        {item}
                                        {/* {activeCategory === item && (
                                            <Tag
                                                color="blue"
                                                style={{
                                                    float: "right",
                                                    marginTop: "2px",
                                                }}
                                            >
                                                ✓
                                            </Tag>
                                        )} */}
                                    </Button>
                                </List.Item>
                            )}
                        />
                    )}
                </Card>
            </Col>
        </Row>




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

        {/* <CreateOrUpdateNamespace
            visible={modal.key == "modalB" && modal.visible}
            onClose={closeModal}
            params={modal.params}></CreateOrUpdateNamespace> */}
        {/* <InstallNamespace
            visible={modal.key == "modalC" && modal.visible}
            onClose={closeModal}
            params={modal.params}></InstallNamespace> */}

        <DependComponent
            visible={modal.key == "modalG" && modal.visible}
            onClose={closeModal}
            callback={reload}
            params={modal.params}></DependComponent>

        <InstallComponents
            visible={modal.key == "installComponents" && modal.visible}
            onClose={closeModal}
            callback={reload}
            params={modal.params}
        ></InstallComponents>
    </div>
}

export default PipelineComponentsCard



const InstallComponents: FC<any> = ({ visible, onClose, params, callback }) => {
    const [storeList, setStoreList] = useState<any>([])
    const [components, setComponents] = useState<any>([])
    const [loading, setLoading] = useState(false)
    const [componentLoading, setComponentLoading] = useState(false)

    const [tabKey, setTabkey] = useState<any>()
    const { baseURL } = useSelector((state: any) => state.user)
    const message = useGlobalMessage()
    const [address, setAddress] = useState("github")
    // const [token, setToken] = useState()
    const { githubToken } = useSelector((state: any) => state.user)
    const [category, setCategory] = useState<any[]>([])
    const [activeCategory, setActiveCategory] = useState("all")

    // const isRemote = storePosition == "Remote"
    useEffect(() => {
        if (visible && params?.component_type) {
            loadStoreList()

        }
    }, [visible, params?.component_type, address])

    const loadStoreList = async () => {
        try {
            setLoading(true)
            const resp = await axios.get(`/component-store/list-stores?address=${address}`)
            setStoreList(resp.data)
            if (resp.data.length > 0) {
                setTabkey(resp.data[0].store_name)
                loadData(resp.data[0].store_name)
            } else {
                setComponents([])
            }
            setLoading(false)

        } catch (error: any) {
            // message.error(error.message)
        }

    }
    const loadData = async (store_name: any, remote_force: any = undefined) => {
        setComponentLoading(true)
        // list-by-type/${store_name}?component_type=${params?.component_type}&is_remote=${isRemote ? 'true' : 'false'}
        try {
            const resp = await axios.post(`/component-store/list-components`, {
                store_name: store_name,
                component_type: params?.component_type,
                address: address,
                remote_force: remote_force,
                token: githubToken
            })
            const category = resp.data.map((item: any) => item.category)
            setCategory(["all", ...Array.from(new Set(category))])

            setComponents(resp.data)

        } catch (error) {

        }
        setComponentLoading(false)


    }

    const filteredComponents = useMemo(() => {
        if (activeCategory == "all") return components;
        return components.filter((item: any) => item.category == activeCategory);
    }, [components, activeCategory]);

    // useEffect(() => {
    //     resp.data.filter((item: any) => {
    //         if (activeCategory == "all") {
    //             return true
    //         } else {
    //             return false//item.category == activeCategory
    //         }
    //     })
    // }, [])
    const getImgPath = (img: any) => {
        if (img.startsWith("http")) {
            return img
        }
        return `${baseURL}${img}`
    }
    return <Modal footer={null} title={<Flex gap={"small"}>

        <span>{`Install Components`} </span>
        <RedoOutlined style={{ cursor: "pointer" }} onClick={() => {
            if (address == "github") {
                loadData(tabKey, true)
            } else {
                loadData(tabKey)
            }

        }} />
    </Flex>} width={"90%"} open={visible} onClose={onClose} onCancel={onClose}>
        {/* {JSON.stringify(components)} */}

        <Spin spinning={loading}>
            {/* {JSON.stringify(storeList)} */}
            <Tabs
                size="small"
                tabBarExtraContent={<Flex gap={"small"}>
                    <Segmented<string>
                        value={address}
                        options={[
                            {
                                label: "Github",
                                value: "github"
                            }, {
                                label: "Local",
                                value: "local"
                            }
                        ]}
                        onChange={(value) => {
                            // console.log(value); // string
                            setAddress(value)
                        }}
                    />
                    <RedoOutlined style={{ cursor: "pointer" }} onClick={() => loadStoreList()} />
                </Flex>}
                activeKey={tabKey}
                onChange={(key) => {
                    setTabkey(key)
                    loadData(key)
                }}
                items={storeList.map((item: any) => ({
                    key: item.store_name,
                    label: item.name,
                }))}></Tabs>

            <Spin spinning={componentLoading}>
                <Row>
                    <Col lg={21} sm={21} xs={24}>
                        {Array.isArray(filteredComponents) && filteredComponents.length != 0 ? <Row gutter={16} style={{ position: "relative" }}>

                            {filteredComponents.map((item: any, index: any) => (
                                <Col key={index} lg={4} sm={4} xs={24} style={{ marginBottom: "1rem", cursor: "pointer" }}>
                                    <Popconfirm
                                        okButtonProps={{ color: `${item.installed ? "red" : "blue"}`, variant: "solid" }}
                                        okText={item.installed ? "Reinstall" : "Install"}
                                        title={
                                            item.installed ? `Reinstall ${item.component_name} ?` : `Install ${item.component_name} ?`
                                        }
                                        onConfirm={async () => {
                                            await axios.post(`/install-components`, {
                                                path: item.file_path,
                                                force: true,
                                                address: item.address,
                                                branch: item.branch,
                                                token: githubToken
                                                // is_remote:item.
                                            }, {
                                                timeout: 60000
                                            })
                                            message.success(item.installed ? `Reinstall success!` : `Install success!`)
                                            callback && callback()
                                            onClose && onClose()

                                        }}>
                                        <Card
                                            size="small"
                                            hoverable
                                            className="custom-card"
                                            title={<Tooltip title={item?.component_id}>
                                                {item.component_name}

                                            </Tooltip>}
                                            // title={item.label}
                                            // variant="borderless" 
                                            style={{
                                                height: "100%",
                                                border: "1px solid #f0f0f0",   // 默认灰色边框
                                                borderRadius: "12px",          // 圆角
                                                overflow: "hidden",
                                                transition: "all 0.3s ease",   // 平滑过渡

                                            }}
                                           
                                            cover={<div style={{ height: "15rem" }}>
                                                <img style={{ height: "100%", width: "100%", objectFit: "cover" }} alt={item.label}
                                                    src={getImgPath(item.img)} />
                                            </div>}
                                        >

                                            <Meta title={

                                                <Flex justify="space-between" align="center">



                                                    <Tag color={item.installed ? "#108ee9" : "#f5222d"} >
                                                        {item.installed ? "Installed" : "Not I nstalled"}
                                                    </Tag>

                                                    <DownloadOutlined style={{ cursor: "pointer" }} />

                                                    {/* </Popconfirm> */}

                                                </Flex>

                                            } description={item?.description} style={{ marginBottom: "1rem" }} />


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


                                        </Card>
                                    </Popconfirm>
                                </Col>
                            ))}

                        </Row> : <Empty></Empty>}
                    </Col>
                    <Col lg={3} sm={3} xs={24}>
                        <Tabs
                            activeKey={activeCategory}
                            onChange={(key) => setActiveCategory(key)}
                            tabBarStyle={{ marginBottom: 0 }}
                            type="card"
                            size="small"
                            tabPosition="right"
                            items={category.map((cat) => ({
                                key: cat,
                                label: cat
                            }))}

                        ></Tabs>
                    </Col>

                </Row>
            </Spin>


        </Spin>
    </Modal >
}