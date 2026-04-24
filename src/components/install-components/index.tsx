import { Button, Card, Col, Empty, Flex, Input, List, Menu, message, Modal, notification, Pagination, Popconfirm, Row, Segmented, Skeleton, Space, Spin, Switch, Tabs, Tag, Tooltip, Typography } from "antd"
import Item from "antd/es/list/Item"
import { FC, use, useEffect, useMemo, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { DownloadOutlined, IeOutlined, RedoOutlined, ReloadOutlined } from '@ant-design/icons';

import Meta from "antd/es/card/Meta"
import { colors } from '@/utils/utils'
import axios from "axios"
import { useGlobalMessage } from "@/hooks/useGlobalMessage"
import { invoke } from "@/core/ui-system/invokeV2";
import { el } from "@faker-js/faker";
import { useComponentStore } from "@/store-zustand/components";
const InstallComponents: FC<any> = ({ relation_type }) => {

    const [storeList, setStoreList] = useState<any>([])
    const [components, setComponents] = useState<any>([])
    const [loading, setLoading] = useState(false)
    const [componentLoading, setComponentLoading] = useState(false)

    const [tabKey, setTabkey] = useState<any>()
    const { baseURL } = useSelector((state: any) => state.user)
    const message = useGlobalMessage()
    const [address, setAddress] = useState("local")
    // const [token, setToken] = useState()
    const { githubToken, storeRepos } = useSelector((state: any) => state.user)
    const [category, setCategory] = useState<any[]>([])
    const [activeCategory, setActiveCategory] = useState("all")
    const [currStorePath, setCurrStorePath] = useState()
    const [downloadParams, setDownloadParams] = useState<any>()
    const [cmd, setCmd] = useState<any>("")
    const [store, setStore] = useState<any>()
    const [selectedStoreId, setSelectedStoreId] = useState<string>()
    const [openMenuKeys, setOpenMenuKeys] = useState<string[]>([])

    // const isRemote = storePosition == "Remote"
    useEffect(() => {
        loadStoreList()
    }, [relation_type, address])

    // useEffect(() => {
    //     setActiveCategory("all")
    // }, [selectedStoreId])

    const loadStoreList = async () => {
        try {
            setLoading(true)
            const resp = await axios.get(`/list-stores`)
            const nextStoreList = resp.data.map((item: any, index: any) => {
                const childrens = item.children || []
                return {
                    key: `group:${item.category || index}`,
                    label: item.category,
                    children: childrens.map((child: any, childIndex: any) => ({
                        key: `store:${child.store_id || item.store_id || `${index}-${childIndex}`}`,
                        label: child.name,
                        store_id: child.store_id || item.store_id,
                        raw: child
                    }))
                }
            })
            setStoreList(nextStoreList)

            const firstStore = nextStoreList.flatMap((item: any) => item.children || [])[0]
            if (firstStore?.store_id) {
                setSelectedStoreId(firstStore.store_id)
                setOpenMenuKeys([nextStoreList[0]?.key].filter(Boolean))
                loadData(firstStore.store_id)
            } else {
                setSelectedStoreId(undefined)
                setOpenMenuKeys([])
                setCategory([])
                setComponents([])
                setStore(undefined)
            }
            // let storesList = resp.data
            // if (address == "github") {
            //     const selfStore = JSON.parse(storeRepos || "[]").filter((item: any) => item.address == address)
            //     storesList = [
            //         ...selfStore,
            //         ...storesList
            //     ]

            // }
            // setStoreList(storesList)

            // // storeRepos
            // if (storesList.length > 0) {
            //     const data = storesList[0]
            //     setTabkey(data.store_name)
            //     loadData(data.store_name, undefined, data?.store_path)
            //     setCurrStorePath(data?.store_path)
            // } else {
            //     setComponents([])
            // }
        } catch (error: any) {
            // message.error(error.message)
        } finally {
            setLoading(false)
        }

    }
    const loadData = async (store_id: any) => {
        setComponentLoading(true)
        // list-by-type/${store_name}?component_type=${params?.component_type}&is_remote=${isRemote ? 'true' : 'false'}
        try {
            const resp = await axios.post(`/component-store/details-by-store-id/${store_id}?type=tools`)
            // const category = resp.data.data.map((item: any) => item.category)
            // setCategory(["all", ...Array.from(new Set(category))])

            setComponents(resp.data.data)
            setStore(resp.data)


        } catch (error) {

        }
        setComponentLoading(false)


    }
    const { register, unregister } = useComponentStore();

    const instance = useMemo(() => {
        return {
            clone: () => {
                if (selectedStoreId) {
                    loadData(selectedStoreId)
                    loadStoreList()
                }
            }, pull: () => {
                if (selectedStoreId) {
                    loadData(selectedStoreId)
                }
            }, stop: () => {
                // if (selectedStoreId) {
                //     loadData(selectedStoreId)
                // }
                loadStoreList()
            }
        };
    }, [selectedStoreId]);


    useEffect(() => {
        if (selectedStoreId) {
            register("store", selectedStoreId, instance);
            return () => {
                unregister("store", selectedStoreId, instance);
            };
        }
    }, [selectedStoreId, instance, register, unregister]);

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
    return <>
        {/* <Button onClick={() => { console.log(useComponentStore.getState().print()) }}>componentStore</Button> */}

        <Space.Compact style={{ width: '100%' }}>

            <Input placeholder="https://github.com/pybrave/enrichment-analysis.git"
                value={downloadParams?.url || ""}
                onChange={(e) => setDownloadParams({
                    ...downloadParams,
                    url: e.target.value
                })}
            />
            <Button type="default" onClick={async () => {
                const result = await invoke.remoteStore.openAsync({}, {
                    footer: null,
                    width: 800,
                    title: "Remote Store",
                })
                if (result) {
                    setDownloadParams({
                        ...downloadParams,
                        url: result
                    })
                }
            }} >Store</Button>
            <Button type="primary" onClick={async () => {
                if (!downloadParams?.url) {
                    message.error("Please input store url!")
                    return
                }
                // /download-store
                const resp = await axios.post(`/create-store`, downloadParams)
                // setCmd(`${resp.data?.cmd}`)

                if (resp.data?.store_id) {
                    message.success("create store!")
                    setSelectedStoreId(resp.data.store_id)
                    loadData(resp.data.store_id)
                    loadStoreList()
                }
            }}>Download</Button>
        </Space.Compact>
        {/* <Flex gap="small" justify="end" style={{ marginTop: "0.5rem" }} align="center" >
            <span>force:</span>
            <Switch size="small" checked={downloadParams?.force || false} onChange={(checked) => {
                setDownloadParams({
                    ...downloadParams,
                    force: checked
                })
            }}></Switch>
        </Flex> */}

        <Row gutter={[12, 12]} align="top" style={{ marginTop: "1rem" }}>
            <Col xs={24} lg={6} xl={6}>
                <Card size="small" title="Component Store" extra={<Button size="small" loading={loading} onClick={() => loadStoreList()} icon={<ReloadOutlined />}></Button>}>
                    <Menu
                        mode="inline"
                        items={storeList}
                        selectedKeys={selectedStoreId ? [`store:${selectedStoreId}`] : []}
                        openKeys={openMenuKeys}
                        onOpenChange={(keys) => setOpenMenuKeys(keys.map((key) => String(key)))}
                        onClick={({ key }) => {
                            const keyString = String(key)
                            if (!keyString.startsWith("store:")) {
                                return
                            }
                            const storeId = keyString.replace("store:", "")
                            setSelectedStoreId(storeId)
                            loadData(storeId)
                        }}
                    ></Menu>
                </Card>
            </Col>
            <Col xs={24} lg={18} xl={18}>
                <Card title={<>
                    {store?.store?.name && <>
                        <Tooltip title={store?.store?.url}>
                            <a href={store?.store?.url} target="_blank" rel="noopener noreferrer">{store?.store?.name}</a>
                        </Tooltip>
                    </>}

                </>} size="small" extra={<Space>
                    {selectedStoreId && store?.store?.status != "done" && <Button color="red" variant="solid" size="small" onClick={async () => {
                        // /download-store/stop
                        const resp = await axios.post(`/git-stop/${store?.store?.store_id}`)
                        message.success("Stop success!")
                    }}>Stop</Button>}
                    {selectedStoreId && store?.store?.status == "done" && <Popconfirm title={`Git Pull ${store.git_url} ?`} onConfirm={async () => {
                        await axios.post(`/git-pull/${store?.store?.store_id}`)

                    }}>
                        <Button color="cyan" variant="solid" size="small">Git Pull</Button>
                    </Popconfirm>}
                    {selectedStoreId && <Popconfirm title={`Delete Store ${store?.name || selectedStoreId} ?`} onConfirm={async () => {
                        await axios.post(`/delete-store/${selectedStoreId}`)
                        message.success("Delete success!")
                        loadStoreList()
                    }}>
                        <Button color="red" variant="solid" size="small">Delete</Button>
                    </Popconfirm>
                    }

                    <Button size="small" icon={<RedoOutlined></RedoOutlined>}
                        loading={componentLoading}
                        onClick={() => {
                            if (selectedStoreId) {
                                loadData(selectedStoreId)
                            }
                        }}
                    ></Button>
                </Space>}>

                    <Spin spinning={componentLoading}>
                        {store?.lock_data?.url ? <>
                            <Typography.Text type="danger">Downloading {store.lock_data.url} ...</Typography.Text>

                        </> : <>
                            {Array.isArray(filteredComponents) && filteredComponents.length != 0 ? <Row gutter={16} style={{ position: "relative" }}>

                                {filteredComponents.map((item: any, index: any) => (
                                    <Col key={index} lg={6} sm={4} xs={24} style={{ marginBottom: "1rem", cursor: "pointer" }}>
                                        <Popconfirm
                                            okButtonProps={{ color: `${item.installed ? "red" : "blue"}`, variant: "solid" }}
                                            okText={item.installed ? "Reinstall" : "Install"}
                                            title={
                                                item.installed ? `Reinstall ${item.name} ?` : `Install ${item.name} ?`
                                            }
                                            onConfirm={async () => {
                                                await axios.post(`/install-relation`, {
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
                                                // callback && callback()

                                            }}>
                                            <Card
                                                size="small"
                                                hoverable
                                                className="custom-card"
                                                title={<Tooltip title={item?.relation_id}>
                                                    {item.name}

                                                </Tooltip>}

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
                        </>}

                    </Spin>

                </Card>

            </Col>
        </Row>


        {/* <Spin spinning={loading}>
            <Tabs
                size="small"
                tabBarExtraContent={<Flex gap={"small"}>

                    <Button size="small" icon={<RedoOutlined></RedoOutlined>}
                        loading={loading}
                        onClick={() => loadStoreList()}
                    ></Button>
                </Flex>}
                activeKey={tabKey}
                onChange={(key) => {
                    setTabkey(key)
                    loadData(key)
                }}
                items={storeList.map((item: any) => ({
                    key: item.store_name,
                    label: <Tooltip title={item.store_path}>{item.name ? item.name : item.store_name}
                    </Tooltip>,
                }))}></Tabs>


        
        </Spin> */}

        {cmd && <pre>{cmd}</pre>}

    </>


}
export default InstallComponents