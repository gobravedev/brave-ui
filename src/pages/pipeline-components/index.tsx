import { Breadcrumb, Button, Card, message, Empty, Flex, Modal, Popconfirm, Skeleton, Switch, Tabs, Tag, Tooltip, Row, Col, Spin, Menu, Dropdown, Space, Collapse, Typography } from "antd"
import { FC, lazy, Suspense, useEffect, useRef, useState } from "react"
import AnalysisPanel, { UpstreamAnalysisInput, UpstreamAnalysisOutput } from '../../components/analysis-sotware-panel'
import Meta from "antd/es/card/Meta"
import { colors } from '@/utils/utils'

import axios from "axios"
import { useLocation, useNavigate, useOutletContext, useParams } from "react-router"
import { deletePipelineRelationApi, listPipeline } from "@/api/pipeline"
import { CreateORUpdatePipelineCompnentRelation, CreateOrUpdatePipelineComponent } from "../../components/create-pipeline"
import ModuleEdit from "../../components/module-edit"
import { useModal, useModals } from '@/hooks/useModal'
import ImportData from '@/components/import-data'
import BioDatabases from '@/components/bio-databases'
import ParamsView from "../../components/params-view"
// import InstallNamespace from "@/components/namespace-operature"
import DependComponent from "@/components/depend-component"
import MonacoEditorModal from "@/components/react-monaco-editor"
import React from "react"
import { BindSample, MetadataModal } from "@/pages/sample"
import MetadataForm from "@/components/metadata-form"
import AnalysisResultEdit from "@/components/analysis-result-edit"
import OpenFile from "@/components/open-file"
import PipelineFlow from "@/components/pipeline-flow"
import SortSoftwareModal from "@/components/sort-software"
import DescriptionModal from "@/components/description-modal"
import FormProject from "@/components/form-project"
import { useSelector } from "react-redux"
import { useGlobalMessage } from "@/hooks/useGlobalMessage"
import { useStickyTop } from "@/hooks/useStickyTop"
import Markdown from "@/components/markdown"
import PipelineComponent from './pipeline'
import ComponentsDetailsRender from "./components-details-render"
import { AppstoreOutlined, CloseOutlined, DeleteColumnOutlined, DeleteOutlined, DownOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { AI } from '@/components/chat'

const Pipeline: FC<any> = () => {

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search);
    const key = queryParams.get("key");



    console.log("Pipeline")
    const { component_type, component_id: name } = useParams()
    // console.log(pipelineId)
    const [pipeline, setPipeline] = useState<any>()
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true)

    const [test, setTest] = useState<any>(true)
    const [messageApi, contextHolder] = message.useMessage();
    const [component, setComponent] = useState<any>()
    const [size, setSize] = useState<any>((component_type && ["script111"].includes(component_type)) ? [18, 6] : [20, 0])
    const tableRef = {
        inputFile: useRef<HTMLInputElement>(null),
        outputFile: useRef<HTMLInputElement>(null)
    };


    // const [editor, setEditor] = useState<any>({
    //     open: false,
    // })
    // const updateEditor = (key: string, value: any) => {
    //     setEditor((prev: any) => ({
    //         ...prev,
    //         [key]: value
    //     }));
    // };
    const { modal, openModal, closeModal } = useModal();
    const { modals, openModals, closeModals } = useModals(["modalD", "metadataModal", "bindSample"])
    // const { project: { project_id } } = useSelector((state: any) => state.context)
    const { project: project_id, componentLayout } = useSelector((state: any) => state.user);

    const [menus, setMenus] = useState<any[]>([])
    const [menuKey, setMenuKey] = useState<string | null>(key)
    const [view, setView] = useState<string | null>()
    const [openKeys, setOpenKeys] = useState<string[]>([]);

    const [componentMap, setComponentMap] = useState<any>({})
    // 🔍 递归查找 key 的父级路径
    const findParentKeys = (items: any, targetKey: string, path: string[] = []): string[] | null => {
        for (const item of items) {
            if (item.key === targetKey) {
                return path; // 当前路径即为父级 keys
            }
            if (item.children) {
                const found = findParentKeys(item.children, targetKey, [...path, item.key]);
                if (found) return found;
            }
        }
        return null;
    };

    //  当 menuKey 改变时，自动展开它的父菜单
    useEffect(() => {
        if (menuKey) {
            const parents = findParentKeys(menus, menuKey);
            if (parents) setOpenKeys(parents);
        }
    }, [menuKey, menus]);

    const updateQueryParam = (paramName: string, newValue: string) => {
        const { pathname, search, hash } = window.location;

        // Parse current query string
        const searchParams = new URLSearchParams(search || "");

        // Update or add the parameter
        searchParams.set(paramName, newValue);

        // Determine if the app uses HashRouter
        const isHashRouter = hash.startsWith("#/");

        let newUrl = "";

        if (isHashRouter) {
            // Extract path and query part from the hash
            const [hashPath, hashSearch = ""] = hash.replace(/^#/, "").split("?");

            const hashParams = new URLSearchParams(hashSearch);
            hashParams.set(paramName, newValue);

            // Build new hash-based URL
            newUrl = `#${hashPath}?${hashParams.toString()}`;
        } else {
            // Build new browser-based URL
            newUrl = `${pathname}?${searchParams.toString()}`;
        }

        // Update browser URL without reloading the page
        window.history.pushState({}, "", newUrl);
    };


    const { ref: containerRef, top, isSticky } = useStickyTop(576);

    const loadFunction: any = (data: any[]) => {
        if (!data) return undefined
        return data.map((item: any) => {
            if ("paramsFun" in item) {
                item.paramsFun = eval(item.paramsFun)
            }
            if ("formJson" in item) {
                item['formJson'].map((it2: any) => {
                    if ("filter" in it2) {
                        it2['filter'].map((it3: any) => {
                            it3.method = eval(it3.method)
                            return it3
                        })
                    }

                    it2.field = eval(it2.field)
                    return it2
                })

            }
            return item
        })
    }
    const loadColumnRender: any = (data: any[]) => {
        if (!data) return []
        return data.map((item: any) => {
            if ("render" in item) {
                const render = eval(item.render)
                item.render = (_: any, record: any) => <>
                    {render(record)}
                </>
            }
            return item
        })
    }

    const getData = async ({ name, component_type }: any) => {
        let api = `/get-pipeline-v2/${name}?component_type=${component_type}`
        if (component_type == "script") {
            api = `/get-component-parent/${name}?component_type=${component_type}`
        }
        const resp = await axios.get(api)
        // console.log(resp.data)
        let pipeline = resp.data
        if ("content" in pipeline) {
            const contentJSON = JSON.parse(pipeline['content'])
            const { content, ...pipelineRest } = { ...contentJSON, ...pipeline }
            pipeline = pipelineRest
        }
        if (pipeline["tags"]) {
            pipeline["tags"] = JSON.parse(pipeline["tags"])
        }
        return pipeline
    }
    const loadData = async () => {
        setLoading(true)
        const pipeline = await getData({ name, component_type })

        setPipeline(pipeline)
        setLoading(false)
        console.log(pipeline)
        let components = pipeline;

        let menus: any[] = []
        let defaultMenuKey = ""
        let componentMap: any = {}
        let defalutView = null

        if (component_type === "pipeline") {
            menus = menus.concat([
                {
                    key: 'workflow',
                    label: 'Workflow Overview',
                }, {
                    key: 'workflow-input',
                    label: 'Workflow Input',
                },
            ])
            if (pipeline?.software) {
                // const software = pipeline?.software.map((item: any) => ({
                //     key: item.component_id,
                //     label: item.component_name || item.component_id,
                // }))
                // // menus = menus.concat(software)
                // menus.push({
                //     key: 'tools',
                //     label: 'Tools',
                //     children: software,
                // })
                const scripts = pipeline?.software.map((item: any, index: any) => {
                    const children = item.outputFile?.flatMap((it: any) => ([
                        //  {
                        //     key: it.component_id,
                        //     type: 'group',
                        //     label: `${it.component_name || it.component_id}`,
                        //     children: [...it.downstreamAnalysis?.map((it2: any) => ({
                        //         key: it2.component_id,
                        //         label: it2.component_name || it2.component_id,
                        //     }))],
                        // }

                        ...it.downstreamAnalysis?.map((it2: any) => ({
                            key: `${it2.component_id}_${index}`,
                            label: it2.component_name || it2.component_id,
                        }))
                    ]))
                    return {
                        key: `${item.component_id}-title`,
                        label: item.component_name || item.component_id,
                        icon: <AppstoreOutlined />,
                        children: [

                            {
                                key: item.component_id,
                                label: "Tools Analysis",
                            }, ...children || []
                        ],
                    }
                })
                menus = menus.concat(scripts)



                componentMap = pipeline.software.reduce((acc: any, item: any) => {
                    acc[item.component_id] = item
                    return acc
                }, {})


                // visualize downstream scripts
                const outputFileList = pipeline?.software.flatMap((item: any) => item.outputFile)
                const downstreamScripts = outputFileList?.filter((it: any) => it?.downstreamAnalysis)?.flatMap((item: any) => {
                    const { downstreamAnalysis, ...rest } = item
                    return downstreamAnalysis.map((item2: any) => ({
                        ...item2,
                        parent: [rest],
                    }))
                })

                const scriptComponentMap = downstreamScripts.reduce((acc: any, item: any) => {
                    acc[item.component_id] = item
                    return acc
                }, {})
                componentMap = { ...componentMap, ...scriptComponentMap }

            }

            defaultMenuKey = "workflow"
            defalutView = "workflow"
            // component = pipeline

        } else if (component_type === "software") {
            menus = menus.concat([
                {
                    key: 'software',
                    label: 'Tools Analysis',
                },
            ])
            defaultMenuKey = "software"
            defalutView = "software"
            // component = pipeline
            if (pipeline?.outputFile) {
                const scripts = pipeline?.outputFile.map((item: any) => (
                    {
                        key: item.component_id,
                        label: item.component_name || item.component_id,
                        type: 'group',
                        children: [...item.downstreamAnalysis.map((it: any) => ({
                            key: it.component_id,
                            component_type: "script",
                            label: it.component_name || it.component_id,
                        }))]
                    }

                ))
                menus = menus.concat(scripts)
                const downstreamScripts = pipeline?.outputFile.flatMap((item: any) => {
                    const { downstreamAnalysis, ...rest } = item
                    return downstreamAnalysis.map((item2: any) => ({
                        ...item2,
                        parent: [rest],
                    }))
                })

                componentMap = downstreamScripts.reduce((acc: any, item: any) => {
                    acc[item.component_id] = item
                    return acc
                }, {})
            }

        } else if (component_type === "script") {
            // component = pipeline
            if (pipeline?.parent) {
                const { parent, ...rest } = pipeline
                const filesMenus = parent.map((item: any) => ({
                    key: item.component_id,
                    label: item.component_name || item.component_id,
                }))
                menus = menus.concat(filesMenus)
                componentMap = parent.reduce((acc: any, item: any) => {
                    acc[item.component_id] = {
                        ...rest,
                        parent: [item],
                    }
                    return acc
                }, {})
                defalutView = "script"
            
                defaultMenuKey = parent[0]?.component_id || ""
                components = componentMap[defaultMenuKey]
            } else {
                defalutView = "script"
            }

            // setView("script")
        } else if (component_type === "file") {
            menus = menus.concat([
                {
                    key: 'file',
                    label: 'File',
                },
            ])
            defalutView = "file"
            defaultMenuKey = "file"
            // component = pipeline
            // setView("file")
            if (pipeline?.downstreamAnalysis) {
                const scripts = pipeline?.downstreamAnalysis.map((item: any) => ({
                    key: item.component_id,
                    label: item.component_name || item.component_id,
                }))
                menus = menus.concat(scripts)
                const { downstreamAnalysis, ...rest } = pipeline

                componentMap = downstreamAnalysis.reduce((acc: any, item: any) => {
                    acc[item.component_id] = { ...item, parent: [rest] }
                    return acc
                }, {})
            }

        }




        if (!menuKey) {
            setMenuKey(defaultMenuKey)
            setView(defalutView)
            setComponent(components)
            if (defaultMenuKey) {
                updateQueryParam("key", defaultMenuKey)
            }

        } else {
            let key = menuKey
            if (menuKey.includes("_")) {
                key = menuKey.split("_")[0]
            }
            if (key in componentMap) {

                console.log("componentMap[key]: ", componentMap[key])
                const component = componentMap[key]
                console.log("component: ", component)
                setComponent(component)
                setView(component.component_type)
            } else {
                setView(menuKey)
                setComponent(pipeline)
            }
        }

        // if (!view) {
        //     setView(defalutView)
        //     setComponent(pipeline)
        // } else {


        // }



        setMenus(menus)
        setComponentMap(componentMap)



    }



    const deletePipelineRelation = async (realtionId: any) => {
        try {
            const resp = await deletePipelineRelationApi(realtionId)
            messageApi.success("删除成功!")
            loadData()
        } catch (error: any) {
            console.log(error)
            messageApi.error(`${error.response.data.detail}`)
        }
    }
    const datelePipeline = async (pipelineId: any) => {
        try {
            const resp = await axios.delete(`/delete-pipeline/${pipelineId}`)
            messageApi.success("删除成功!")
            loadData()
        } catch (error: any) {
            console.log(error)
            messageApi.error(`${error.response.data.detail}`)
        }
    }
    const operatePipeline = {
        deletePipelineRelation: deletePipelineRelation,
        openModal: openModal,
        openModals: openModals
    }
    const onOpenChange = (keys: string[]) => {
        setOpenKeys(keys); // 允许多层展开
    };
    // const onOpenChange = (keys: string[]) => {
    //     // 只保持一个父级 SubMenu 展开
    //     const latestOpenKey = keys.find((key) => !openKeys.includes(key));
    //     if (latestOpenKey) {
    //         setOpenKeys([latestOpenKey]);
    //     } else {
    //         setOpenKeys([]);
    //     }
    // };
    useEffect(() => {
        loadData()
    }, [])
    return <div style={{ maxWidth: "1800px", margin: "1rem auto", padding: `${isSticky ? '0 16px 0 16px' : '0'}` }}>

        <Spin spinning={loading}>
            {/* {JSON.stringify(pipeline)} */}
            {/* {menuKey} */}
            <Row gutter={[isSticky ? 16 : 0, 16]} style={{}} ref={containerRef} >
                {(component_type && ["software", "pipeline", "file", "script"].includes(component_type)) &&
                    <Col lg={4} sm={4} xs={24}
                        style={isSticky ? {
                            overflow: "hidden",
                            // marginTop: "1rem",
                            position: "sticky",
                            top: `${top}px`, // 吸顶距离
                            alignSelf: "flex-start", // 避免被stretch
                            height: `88vh`, // 可选：固定高度，让内部滚动
                        } : {}}

                    >
                        {/* {top} */}
                        <Card
                            title={pipeline?.component_name}
                            extra={<>
                            </>}
                            style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                height: " 100%"
                            }}
                            styles={{
                                body: {
                                    // height: "90%",
                                    flex: 1,
                                    overflowY: "auto"
                                }
                            }}
                            size="small" >

                            <Menu
                                onOpenChange={onOpenChange}

                                inlineCollapsed={false}
                                openKeys={openKeys}
                                selectedKeys={[menuKey || ""]}
                                onSelect={(k: any) => {
                                    let key = k.key
                                    console.log("k: ", k)
                                    setMenuKey(key)
                                    updateQueryParam("key", key)
                                    if (key.includes("_")) {
                                        key = key.split("_")[0]
                                    }
                                    if (key in componentMap) {
                                        console.log("componentMap[key]: ", componentMap[key])
                                        const component = componentMap[key]
                                        console.log("component: ", component)
                                        setComponent(component)
                                        setView(component.component_type)
                                    } else {
                                        setView(key)
                                        setComponent(pipeline)
                                    }

                                }}
                                // onClick={() => { }}
                                mode="inline"
                                style={{ flex: 1, minWidth: 0, background: 'transparent', border: 0 }}
                                // selectedKeys={[]}
                                items={menus} />

                        </Card>
                    </Col>}
                <Col lg={size[0]} sm={size[0]} xs={24}
                    style={{

                        display: "flex",
                        flexDirection: "column", // 让 Card 撑满高度
                        height: "100%",          // 关键：继承 Row 的高度
                    }}
                >
                    <Card size="small"
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            height: " 100%"
                        }}
                        styles={{
                            body: {
                                padding: 0,
                                // height: "90%",
                                flex: 1,
                                overflowY: "auto"
                            }
                        }}
                        title={<>
                            {component?.component_name} <Tag color="blue">{component?.script_type}</Tag>
                            {component?.category &&
                                <Tag style={{ marginLeft: "0.5rem" }} color="blue">{component?.category}</Tag>
                            }

                        </>}
                        extra={<Flex justify={"space-between"} align={"center"} gap="small">

                            <Flex gap="small" wrap>
                                <QuestionCircleOutlined
                                    onClick={() => {
                                        setSize([14, 6])
                                    }}
                                    style={{ color: "#1890ff" }} />

                                {component?.component_type != "pipeline" && <>

                                    <Popconfirm title="Whether to remove?" onConfirm={() => {
                                        operatePipeline.deletePipelineRelation(component.relation_id)
                                    }}>
                                        <Tooltip title={`Remove ${component?.component_type}`}>
                                            <DeleteOutlined style={{ color: "red" }} />
                                        </Tooltip>
                                    </Popconfirm>
                                </>}


                                {component_type == "pipeline" && <>
                                    {/* <Button size="small" color="cyan" variant="solid" onClick={() => {
                                        openModal("sortSoftware", { software: pipeline.software })
                                    }}>Update Sorting</Button> */}


                                    {/* <Button size="small" color="cyan" variant="solid" onClick={() => {
                                        operatePipeline.openModal("modalA", {
                                            data: undefined, pipelineStructure: {
                                                relation_type: "pipeline_software",
                                                parent_component_id: component.component_id,
                                                pipeline_id: component.component_id

                                            }
                                        })
                                    }}>Add Tools</Button> */}

                                </>
                                }
                                {/* {
                                    component?.component_type == "software" && <>

                                        <Popconfirm title="Whether to remove Tools?" onConfirm={() => {
                                            operatePipeline.deletePipelineRelation(component.relation_id)
                                        }}>
                                            <Button size="small" color="red" variant="solid" >Remove Tools</Button>
                                        </Popconfirm>
                                    </>
                                } */}
                                <Button size="small" color="cyan" variant="solid" onClick={() => {
                                    openModal("publishModal", { ...pipeline, component_type: component_type })
                                }}>Publish</Button>

                                <Button size="small" color="cyan" variant="solid" onClick={() => {
                                    operatePipeline.openModal("projectForm", { project_id: project_id })
                                }}>Edit Project</Button>

                                <Button size="small" color="cyan" variant="solid" onClick={() => {
                                    operatePipeline.openModal("modalG", pipeline)
                                }}>Dependencies</Button>
                                <Button size="small" color="cyan" variant="solid" onClick={() => {
                                    openModals("metadataModal", { ...pipeline, operatePipeline: operatePipeline })
                                }}>Metadata</Button>

                                <Button size="small" color="cyan" variant="solid" onClick={() => {
                                    openModal("modalC", {
                                        data: component, structure: {
                                            component_type: component?.component_type,
                                        }
                                    })
                                }}>Edit {component?.component_type}</Button>



                                {component?.databases && <>
                                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                                        operatePipeline.openModal("modalE", component.databases)
                                    }}>Database</Button>
                                </>}
                                {["pipeline", "software", "script"].includes(component?.component_type || "") && <>
                                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                                        operatePipeline.openModal("modalB", {
                                            component_id: component?.component_id,
                                        })
                                    }}>Component Code</Button>

                                </>}


                                {component_type == "pipeline" && <>
                                    <Dropdown menu={{
                                        onClick: (val: any) => {
                                            const key = val.key
                                            switch (key) {
                                                case "new-tool":
                                                    operatePipeline.openModal("modalC", {
                                                        data: undefined, structure: {
                                                            component_type: "software",
                                                            relation_type: "pipeline_software",
                                                            parent_component_id: pipeline
                                                                .component_id,
                                                            pipeline_id: pipeline.component_id
                                                        }
                                                    })
                                                    break;
                                                case "add-tool":
                                                    operatePipeline.openModal("modalA", {
                                                        data: undefined, pipelineStructure: {
                                                            relation_type: "pipeline_software",
                                                            parent_component_id: pipeline.component_id,
                                                            pipeline_id: pipeline.component_id

                                                        }
                                                    })
                                                    break;
                                                case "sort-tool":
                                                    openModal("sortSoftware", { software: pipeline.software })

                                            }

                                        },
                                        items: [
                                            {
                                                key: 'new-tool',
                                                label: "New Tool"
                                            },
                                            {
                                                label: 'Add Tool',
                                                key: 'add-tool',
                                            }, {
                                                label: 'Sort Tool',
                                                key: 'sort-tool',
                                            }
                                            // , {
                                            //     label: ,
                                            //     key: 'remove-tool',
                                            //     disabled: component?.component_type != "software"
                                            // },

                                        ]
                                    }}>
                                        <Button size="small" color="cyan" variant="solid">
                                            <Space>
                                                Tools
                                                <DownOutlined />
                                            </Space>
                                        </Button>
                                    </Dropdown>
                                </>}

                                <Button size="small" color="cyan" variant="solid" onClick={loadData}>Refresh</Button>

                                <Button size="small" color="primary" variant="solid" onClick={() => navigate(`/${component_type}-card`)}>Back</Button>
                            </Flex>

                        </Flex>}
                    >
                        {/* {JSON.stringify(component)} */}
                        {(view && component) ? <>
                            <ComponentsDetailsRender
                                component={component}
                                operatePipeline={operatePipeline}
                                project={project_id}
                                componentLayout={componentLayout}
                                view={view} />
                        </> : <Skeleton active></Skeleton>}


                        {/* <MemoizedComponentsRender
                            setMenus={setMenus}
                            componentLayout={componentLayout}
                            component_type={component_type || ""}
                            component={pipeline}
                            tableRef={tableRef}
                            operatePipeline={operatePipeline} /> */}
                    </Card>
                    {/* <Card style={{ marginTop: "1rem" }} size="small" >
                        {pipeline?.description && <>

                            <Markdown data={pipeline?.description}></Markdown>
                        </>}
                    </Card> */}

                </Col>
                <Col lg={size[1]} sm={size[1]} xs={24}
                    ref={containerRef} style={isSticky ? {
                        overflow: "hidden",
                        // marginTop: "1rem",
                        position: "sticky",
                        top: `${top}px`, // 吸顶距离
                        alignSelf: "flex-start", // 避免被stretch
                        height: `calc(100vh - ${top}px - 1rem )`, // 可选：固定高度，让内部滚动
                    } : {}}

                >
                    <Card
                        title={`More Info (${component?.component_name})`}
                        extra={<>
                            {!(component_type && ["script11"].includes(component_type)) && <>
                                <CloseOutlined onClick={() => {
                                    setSize([20, 0])
                                }}></CloseOutlined>
                            </>}
                        </>}
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            height: " 100%"
                        }}
                        styles={{
                            body: {
                                // height: "90%",
                                flex: 1,
                                overflowY: "auto"
                            }
                        }}

                        size="small" >

                        {component?.tags && Array.isArray(component.tags) && component.tags.map((tag: any, index: any) => (
                            <Tag style={{ marginTop: "0.5rem" }} key={index} color={colors[index]}>{tag}</Tag>
                        ))}
                        {/* {JSON.stringify(component)} */}
                        <Markdown data={component?.description}></Markdown>
                        <AI></AI>
                        <Collapse ghost items={[
                            {
                                key: "1",
                                label: "More",
                                children: <>
                                    <Typography>
                                        <pre>{JSON.stringify(component, null, 2)}   </pre>
                                    </Typography>
                                </>
                            }
                        ]} />
                        {/* {JSON.stringify(pipeline.description)} */}
                        {/* {pipeline?.description && <>

                                <Markdown data={pipeline?.description}></Markdown>
                            </>} */}

                    </Card>
                </Col>
                {/* {(component_type && ["script", "file"].includes(component_type)) && */}


                {/* } */}
            </Row>
        </Spin>


        {/* 111111 */}
        {/* <ComponentsRender component_type={component_type || ""} operatePipeline={{
            deletePipelineRelation: deletePipelineRelation,
            openModal: openModal
        }} component={pipeline} /> */}


        {/* <PipelineComponent /> */}
        {/* <Button onClick={() => {
            setTest(!test)
        }}>测试</Button> */}

        {contextHolder}

        {/* {
                pipeline_type: "wrap_pipeline",
                parent_pipeline_id: "0"

            } */}
        <ModuleEdit
            visible={modal.key == "modalB" && modal.visible}
            onClose={closeModal}
            callback={loadData}
            params={modal.params}
        >
        </ModuleEdit>
        <CreateORUpdatePipelineCompnentRelation
            callback={loadData}
            // pipelineStructure={pipelineStructure}
            // data={record}
            visible={modal.key == "modalA" && modal.visible}
            onClose={closeModal}
            params={{ ...modal.params, namespace: pipeline?.namespace }}></CreateORUpdatePipelineCompnentRelation>
        <CreateOrUpdatePipelineComponent
            callback={loadData}
            // pipelineStructure={pipelineStructure}
            // data={record}
            visible={modal.key == "modalC" && modal.visible}
            onClose={closeModal}
            params={modal.params}></CreateOrUpdatePipelineComponent>
        {/* 
        <ImportData
            visible={modals.modalD.visible}
            params={modals.modalD.params}
            onClose={() => closeModals("modalD")}></ImportData> */}
        <BioDatabases
            visible={modal.key == "modalE" && modal.visible}
            onClose={closeModal}
            params={modal.params}></BioDatabases>
        <ParamsView
            visible={modal.key == "modalF" && modal.visible}
            onClose={closeModal}
            params={modal.params}></ParamsView>
        <DependComponent
            visible={modal.key == "modalG" && modal.visible}
            onClose={closeModal}
            callback={loadData}
            params={modal.params}></DependComponent>
        <MonacoEditorModal
            visible={modal.key == "modalH" && modal.visible}
            onClose={closeModal}
            value={modal.params}></MonacoEditorModal>
        {/* <AnalysisResultEdit
            visible={modal.key == "analysisResultEdit" && modal.visible}
            onClose={closeModal}
            params={modal.params}></AnalysisResultEdit> */}
        <MetadataModal
            visible={modals.metadataModal.visible}
            onClose={() => closeModals("metadataModal")}
            params={modals.metadataModal.params}></MetadataModal>
        <MetadataForm
            visible={modal.key == "metadataForm" && modal.visible}
            onClose={closeModal}
            params={modal.params}></MetadataForm>
        <BindSample
            visible={modals.bindSample.visible}
            onClose={() => closeModals("bindSample")}
            operatePipeline={operatePipeline}
            params={modals.bindSample.params}></BindSample>

        <FormProject
            params={modal.params}
            visible={modal.key == "projectForm" && modal.visible}
            onClose={closeModal} />

        <OpenFile
            visible={modal.key == "openFile" && modal.visible}
            onClose={closeModal}
            params={modal.params}></OpenFile>

        <SortSoftwareModal
            visible={modal.key == "sortSoftware" && modal.visible}
            onClose={closeModal}
            params={modal.params} callback={loadData}></SortSoftwareModal>
        <DescriptionModal
            visible={modal.key == "descriptionModal" && modal.visible}
            onClose={closeModal}
            params={modal.params} callback={loadData}></DescriptionModal>
        <PublishModal
            visible={modal.key == "publishModal" && modal.visible}
            onClose={closeModal}
            params={modal.params}></PublishModal>

    </div>
}


export default Pipeline


const PublishModal: FC<any> = ({ visible, onClose, params }) => {
    const [storeList, setStoreList] = useState<any>([])
    const [loading, setLoading] = useState(false)
    const [force, setForce] = useState(false)
    const message = useGlobalMessage()
    const loadStoreList = async () => {
        try {
            setLoading(true)
            const resp = await axios.get(`/component-store/list-stores?address=local`)
            setStoreList(resp.data)

            setLoading(false)

        } catch (error: any) {
            // message.error(error.message)
        }

    }

    // component_id: str
    // store_path:Optional[str]=None
    // force: Optional[bool]=False
    const publishToStore = async (component_id: any, store_path: any = undefined) => {
        try {
            setLoading(true)
            const resp = await axios.post(`/publish-component`, {
                component_id: component_id,
                store_path: store_path,
                force: force
            })
            message.success("Published successfully")
            setLoading(false)
            onClose()
        } catch (error: any) {
            // message.error(error.response?.data?.detail || error.message)
            setLoading(false)
        }
    }
    useEffect(() => {
        if (visible) {
            loadStoreList()
        }
    }, [visible])

    // const { component_type, component_id} = params
    return <Modal
        loading={loading}
        title={<>
            {`Publish ${params?.component_name} (${params?.component_type})`}
            <Switch style={{ marginLeft: "1rem" }} checked={force} onChange={(checked) => { setForce(checked) }} /> Force
        </>}
        open={visible}
        onCancel={onClose}
        footer={null}

    >
        <Flex gap={"small"} style={{ marginBottom: "1rem" }}>
            {/* <Popconfirm title={"pubpish?"} onConfirm={() => publishToStore(params?.component_id, undefined)}>
                <Button size="small" color="cyan" variant="solid"

                >default</Button>
            </Popconfirm> */}


            {storeList.map((item: any, index: any) => (
                <Tooltip title={item.store_path} key={index}>
                    <Popconfirm title={"pubpish?"} onConfirm={() => publishToStore(params?.component_id, item.store_path)}>

                        <Button size="small" color="cyan" variant="solid"

                        >{item.name}</Button>

                    </Popconfirm>
                </Tooltip>
            ))}
        </Flex>
        {/* {JSON.stringify(storeList)} */}

    </Modal>
}
// interface PipelineComponentProps {
//     operatePipeline: any,
//     component: any,
//     tableRef: any,
//     componentLayout: string

// }
// interface PipelineComponentRenderProps extends PipelineComponentProps {
//     component_type: string,
//     setMenus?: any,
// }

// const PipelineComponent = lazy(() => import('./pipeline'))
// const ComponentsRender = ({ component_type, operatePipeline, component, ...rest }: PipelineComponentRenderProps) => {
//     if (!component_type || !component) return null

//     const componentMap = {
//         "pipeline": PipelineComponent,
//         // "software": SoftwareComponent,
//         // "file": FileComponent,
//         // "script": ScriptComponent,
//         "module": "module-card",
//     }
//     const Component = componentMap[component_type as keyof typeof componentMap]
//     if (!Component) return null
//     return <Suspense fallback={<Skeleton active></Skeleton>}>
//         <Component operatePipeline={operatePipeline} component={component} {...rest} />
//     </Suspense>
// }
// const MemoizedComponentsRender = React.memo(ComponentsRender, (prevProps, nextProps) => {
//     return JSON.stringify(prevProps) === JSON.stringify(nextProps)
// });


