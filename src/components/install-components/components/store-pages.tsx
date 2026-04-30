import { usePagination } from "@/hooks/usePagination"
import { Button, Card, Col, Empty, Flex, Input, Pagination, Popconfirm, Row, Skeleton, Space, Tag, Tooltip } from "antd"
import Meta from "antd/es/card/Meta"
import { FC, forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { colors } from '@/utils/utils'
import { DownloadOutlined, RedoOutlined } from '@ant-design/icons'
import { Spin } from "antd/lib"
import axios from "axios"
import { useGlobalMessage } from "@/hooks/useGlobalMessage"
import { useNavigate } from "react-router"
import { useComponentStore } from "@/store-zustand/components"
const StorePages = forwardRef<any, any>(({ onOk, onCancel }, ref) => {


    const [params, setParams] = useState<any>({})
    // /page-stores
    const { data, pageNumber, totalPage, loading, reload, pageSize, setPageNumber, search } = usePagination({
        id: "store-page",
        url: `/page-stores`,
        params:params,
        // params: { category: activeCategory, ...params },
        // map: mapFun,
        initialPageSize: 12
    })
    const { baseURL } = useSelector((state: any) => state.user)
    const { Search } = Input;
    const message = useGlobalMessage()
    const navigate = useNavigate();

    useImperativeHandle(ref, () => ({
        reload: () => {
            reload()
        }
    }));

    const { register, unregister } = useComponentStore();

    const instance = useMemo(() => {
        return {
            clone: () => {
                reload()
                // setContentRefreshToken((value) => value + 1)
                // setSidebarRefreshToken((value) => value + 1)
            }, pull: () => {
                // loadData(storeId)
                reload()
                // setContentRefreshToken((value) => value + 1)
            }, stop: () => {
                reload()
                // setSidebarRefreshToken((value) => value + 1)
            }, already_exists: (args:any) => {
                // console.log("111111111111111")
                // search("aaa")
                message.error("Component already exists in your tools, please go to tools page to check or uninstall it first.")
                if(args?.id){
                    setParams({ ...params, storeId: args.id });
                }
                reload()
            }
        };
    }, []);


    useEffect(() => {
        register("store", "*", instance);
        return () => {
            unregister("store", "*", instance);
        };
    }, [instance, register, unregister]);



    return <>

        {/* {JSON.stringify(data)} */}
        <Card
            title={<Space>
                <Search
                    size="small"
                    placeholder="Search Components"
                    allowClear
                    enterButton
                    onSearch={(value) => { search(value) }}
                    style={{ width: 400 }}
                />
                {params?.storeId &&  <Tag closable onClose={()=> setParams({ ...params, storeId: null })}>{params.storeId}</Tag>}
            </Space>}
            size="small" extra={<Space>
                <Button size="small" color="cyan" variant="solid" icon={<RedoOutlined />} onClick={reload}></Button>

            </Space>}>
            {data ? <>
                {data.length === 0 ? <Empty description="No data" /> : <Spin spinning={loading}>
                    <Row gutter={16} >
                        {data.map((item: any, index: any) => (
                            <Col key={index} lg={6} sm={4} xs={24} style={{ marginBottom: "1rem", cursor: "pointer" }}>
                                <Card hoverable
                                    size="small"
                                    className="custom-card"
                                    // title={item.label}
                                    // variant="borderless" 
                                    variant="borderless"
                                    style={{
                                        height: "100%",
                                        border: "1px solid #f0f0f0",   // 默认灰色边框
                                        borderRadius: "12px",          // 圆角
                                        overflow: "hidden",
                                        transition: "all 0.3s ease",   // 平滑过渡
                                        // boxShadow: "none"

                                    }}
                                    title={<Space>
                                        {item?.status != "done" && (
                                            <Button
                                                color="red"
                                                variant="solid"
                                                size="small"
                                                onClick={async () => {
                                                    await axios.post(`/git-stop/${item?.store_id}`);
                                                    message.success("Stop success!");
                                                    reload();
                                                }}
                                            >
                                                Stop
                                            </Button>
                                        )}
                                        {item?.status === "done" && (
                                            <Popconfirm
                                                title={`Git Pull ${item?.url} ?`}
                                                onConfirm={async () => {
                                                    await axios.post(`/git-pull/${item?.store_id}`);
                                                    message.success("Git pull success!");
                                                    reload();
                                                }}
                                            >
                                                <Button color="cyan" variant="solid" size="small">
                                                    Git Pull
                                                </Button>
                                            </Popconfirm>
                                        )}
                                        <Popconfirm
                                            title={`Delete Store ${item?.name} ?`}
                                            onConfirm={async () => {
                                                await axios.post(`/delete-store/${item?.store_id}`);
                                                message.success("Delete success!");
                                                reload();
                                            }}
                                        >
                                            <Button color="red" variant="solid" size="small">
                                                Delete
                                            </Button>
                                        </Popconfirm>

                                    </Space>}
                                    bodyStyle={{
                                        padding: "12px 16px",          // 内边距更紧凑
                                    }}
                                    cover={<div style={{ height: "15rem" }}>
                                        {item?.status == "running" ? <>
                                            <Skeleton active></Skeleton>
                                        </> :
                                            <img style={{ height: "100%", width: "100%", objectFit: "cover" }} alt={item.label} src={`${baseURL}${item.img}`} />

                                        }
                                    </div>}
                                // onClick={() => {

                                // }}
                                >


                                    <Meta title={<Flex gap={"small"} wrap>
                                        <Tooltip title={<>
                                            AppId: {item.app_id}
                                            <br />
                                            path: {item.path}

                                        </>}>
                                            <span>{item.name}</span>
                                        </Tooltip>
                                        {item?.status != "running" &&
                                            <>
                                                {onOk && <Popconfirm
                                                    okButtonProps={{ color: `${item.tool_id ? "red" : "blue"}`, variant: "solid" }}
                                                    okText={item.tool_id ? "Reinstall" : "Install"}
                                                    title={item.tool_id ? `Reinstall ${item.name} ?` : `Install ${item.name} ?`}
                                                    onConfirm={async () => {
                                                        await axios.post(
                                                            `/install-relation`,
                                                            {
                                                                // path: item.file_path,
                                                                force: true,
                                                                store_id: item.store_id,
                                                            },
                                                            {
                                                                timeout: 60000,
                                                            }
                                                        );
                                                        message.success(item.tool_id ? `Reinstall success!` : `Install success!`);
                                                        onOk && onOk();
                                                    }}
                                                >
                                                    {/* <DownloadOutlined style={{ cursor: "pointer" }} /> */}
                                                    <Button size="small" color="blue" variant="solid" icon={<DownloadOutlined />} >{item.tool_id ? "Reinstall" : "Install"}</Button>
                                                </Popconfirm>}

                                                {item.tool_id && onCancel && <>
                                                    <Button size="small" color="blue" variant="solid" onClick={() => {
                                                        navigate(`/c/tools/${item.tool_id}`)
                                                        onCancel && onCancel()
                                                    }}>Go Tools</Button>
                                                </>}
                                            </>
                                        }


                                    </Flex>} description={item?.description} style={{ marginBottom: "1rem" }} />
                                    {item?.status != "running" &&

                                        <>

                                            {item?.category && <Tag style={{
                                                wordBreak: "break-word",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                maxWidth: 100,
                                                display: "inline-block",
                                                cursor: "default"
                                            }} color="blue">
                                                {item?.category}
                                            </Tag>}

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
                                        </>
                                    }



                                </Card>
                            </Col>
                        ))}
                    </Row>


                </Spin>}

            </> : <Skeleton active></Skeleton>}
            {totalPage != 0 && <Flex style={{ marginTop: "1rem" }} align="center">
                A total of {totalPage} records &nbsp;
                <Pagination
                    current={pageNumber}
                    pageSize={pageSize}
                    total={totalPage}
                    onChange={(p) => setPageNumber(p)}
                    showSizeChanger={false}
                />
            </Flex>}
        </Card>
    </>



})
export default StorePages