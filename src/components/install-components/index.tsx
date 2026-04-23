import { Button, Card, Col, Empty, Flex, Input, List, message, Modal, notification, Pagination, Popconfirm, Row, Segmented, Skeleton, Space, Spin, Switch, Tabs, Tag, Tooltip, Typography } from "antd"
import Item from "antd/es/list/Item"
import { FC, use, useEffect, useMemo, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { DownloadOutlined, RedoOutlined } from '@ant-design/icons';

import Meta from "antd/es/card/Meta"
import { colors } from '@/utils/utils'
import axios from "axios"
import { useGlobalMessage } from "@/hooks/useGlobalMessage"
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

    // const isRemote = storePosition == "Remote"
    useEffect(() => {
        loadStoreList()
    }, [relation_type, address])

    const loadStoreList = async () => {
        try {
            setLoading(true)
            const resp = await axios.get(`/component-store/list-stores?address=${address}`)
            let storesList = resp.data
            if (address == "github") {
                const selfStore = JSON.parse(storeRepos || "[]").filter((item: any) => item.address == address)
                storesList = [
                    ...selfStore,
                    ...storesList
                ]

            }
            setStoreList(storesList)

            // storeRepos
            if (storesList.length > 0) {
                const data = storesList[0]
                setTabkey(data.store_name)
                loadData(data.store_name, undefined, data?.store_path)
                setCurrStorePath(data?.store_path)
            } else {
                setComponents([])
            }
            setLoading(false)

        } catch (error: any) {
            // message.error(error.message)
        }

    }
    const loadData = async (store_name: any, remote_force: any = undefined, store_path = undefined) => {
        setComponentLoading(true)
        // list-by-type/${store_name}?component_type=${params?.component_type}&is_remote=${isRemote ? 'true' : 'false'}
        try {
            const resp = await axios.post(`/component-store/list-relations`, {
                store_name: store_name,
                relation_type: relation_type,
                address: address,
                remote_force: remote_force,
                token: githubToken,
                store_path: store_path ? store_path : currStorePath

            })
            const category = resp.data.data.map((item: any) => item.category)
            setCategory(["all", ...Array.from(new Set(category))])

            setComponents(resp.data.data)
            setStore(resp.data)


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
    return <>

        <Space.Compact style={{ width: '100%' }}>

            <Input placeholder="https://github.com/pybrave/enrichment-analysis.git"
                value={downloadParams?.url || ""}
                onChange={(e) => setDownloadParams({
                    ...downloadParams,
                    url: e.target.value
                })}
            />

            <Button type="primary" onClick={async () => {
                // /download-store
                const resp = await axios.post(`/download-store`, downloadParams)
                setCmd(`${resp.data?.cmd}`)
            }}>Download</Button>
        </Space.Compact>
        <Flex gap="small" justify="end" style={{ marginTop: "0.5rem" }} align="center" >
            <span>force:</span>
            <Switch size="small" checked={downloadParams?.force || false} onChange={(checked) => {
                setDownloadParams({
                    ...downloadParams,
                    force: checked
                })
            }}></Switch>
        </Flex>


        <Spin spinning={loading}>
            {/* {JSON.stringify(storeList)} */}
            <Tabs
                size="small"
                tabBarExtraContent={<Flex gap={"small"}>
                    {/* <Segmented<string>
                        value={address}
                        options={[
                            {
                                label: "Local",
                                value: "local"
                            }, {
                                label: "Github",
                                value: "github"
                            }
                        ]}
                        onChange={(value) => {
                            // console.log(value); // string
                            setAddress(value)
                        }}
                    /> */}
                    <Button size="small" icon={<RedoOutlined></RedoOutlined>}
                        loading={loading}
                        onClick={() => loadStoreList()}
                    ></Button>
                    {/* <RedoOutlined style={{ cursor: "pointer" }} onClick={() => loadStoreList()} /> */}
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


            <Card size="small" extra={<Space>
                {store?.lock_data?.url && <Button color="red" variant="solid" size="small" onClick={async () => {
                    // /download-store/stop
                    const resp = await axios.post(`/git-stop`, {
                        url: store?.lock_data?.url,
                    })
                    message.success("Stop success!")
                }}>Stop</Button>}
                {store?.git_url && <Popconfirm title={`Git Pull ${store.git_url} ?`} onConfirm={async () => {
                    // /git-pull
                    await axios.post(`/git-pull`, {
                        url: store.git_url
                    })

                }}>
                    <Button color="cyan" variant="solid" size="small">Git Pull</Button>
                </Popconfirm>}

                <Button size="small" icon={<RedoOutlined></RedoOutlined>}
                    loading={componentLoading}
                    onClick={() => {
                        if (address == "github") {
                            loadData(tabKey, true)
                        } else {
                            loadData(tabKey)
                        }
                    }}
                ></Button>
            </Space>}>

                <Spin spinning={componentLoading}>
                    {store?.lock_data?.url ? <>
                        <Typography.Text type="danger">Downloading {store.lock_data.url} ...</Typography.Text>

                    </> : <Row>
                        <Col lg={21} sm={21} xs={24}>
                            {Array.isArray(filteredComponents) && filteredComponents.length != 0 ? <Row gutter={16} style={{ position: "relative" }}>

                                {filteredComponents.map((item: any, index: any) => (
                                    <Col key={index} lg={4} sm={4} xs={24} style={{ marginBottom: "1rem", cursor: "pointer" }}>
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

                    </Row>}

                </Spin>

            </Card>

        </Spin>

        {cmd && <pre>{cmd}</pre>}

    </>


}
export default InstallComponents