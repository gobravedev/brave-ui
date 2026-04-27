import { Button, Col, Input, Row, Space } from "antd"
import { FC, useEffect, useMemo, useState } from "react"
import axios from "axios"
import { useGlobalMessage } from "@/hooks/useGlobalMessage"
import { invoke } from "@/core/ui-system/invokeV2";
import { useComponentStore } from "@/store-zustand/components";
import StoreSidebar from "./components/store-sidebar";
import StoreContent from "./components/store-content";
const InstallComponents: FC<any> = ({ relation_type, onOk }) => {

    const message = useGlobalMessage()
    const [address, setAddress] = useState("local")
    const [downloadParams, setDownloadParams] = useState<any>()
    const [cmd, setCmd] = useState<any>("")
    const [selectedStoreId, setSelectedStoreId] = useState<string>()
    const [sidebarRefreshToken, setSidebarRefreshToken] = useState(0)
    const [contentRefreshToken, setContentRefreshToken] = useState(0)

    const { register, unregister } = useComponentStore();

    const instance = useMemo(() => {
        return {
            clone: () => {
                setContentRefreshToken((value) => value + 1)
                setSidebarRefreshToken((value) => value + 1)
            }, pull: () => {
                setContentRefreshToken((value) => value + 1)
            }, stop: () => {
                setSidebarRefreshToken((value) => value + 1)
            }
        };
    }, []);


    useEffect(() => {
        if (selectedStoreId) {
            register("store", selectedStoreId, instance);
            return () => {
                unregister("store", selectedStoreId, instance);
            };
        }
    }, [selectedStoreId, instance, register, unregister]);

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
                const resp = await axios.post(`/clone-store`, downloadParams)
                // setCmd(`${resp.data?.cmd}`)

                if (resp.data?.store_id) {
                    message.success("create store!")
                    setSelectedStoreId(resp.data.store_id)
                    setSidebarRefreshToken((value) => value + 1)
                    setContentRefreshToken((value) => value + 1)
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
                <StoreSidebar
                    relationType={relation_type}
                    address={address}
                    refreshToken={sidebarRefreshToken}
                    selectedStoreId={selectedStoreId}
                    onSelectStore={(storeId) => {
                        setSelectedStoreId(storeId)
                    }}
                />
            </Col>

            <Col xs={24} lg={18} xl={18}>
                <StoreContent
                    storeId={selectedStoreId}
                    // refreshToken={contentRefreshToken}
                    onStoreDeleted={() => {
                        setSelectedStoreId(undefined)
                        setSidebarRefreshToken((value) => value + 1)
                    }}
                    onOk={onOk}
                />
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