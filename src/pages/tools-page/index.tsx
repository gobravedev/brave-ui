import { useStickyTop } from "@/hooks/useStickyTop";
import { Button, Card, Col, Row, Segmented } from "antd";
import { FC, useState } from "react";
import ComponentRender from "./component-render";
import { useParams } from "react-router";

type LLMArgs = {
    biz_type: string;
    biz_id: string | undefined;
}

const ToolsPage: FC<any> = ({ }) => {
    const { ref: containerRef, top, isSticky } = useStickyTop(576);
    const { component_type, relation_id } = useParams()
    const [relationId, setRelationId] = useState(relation_id)
    // const [panel, setPanel] = useState(component_type)
    // let mainView_ = "tools"
    // switch (component_type) {
    //     case "script":
    //     case "tools":
    //         mainView_ = relation_id ? "toolsDetail" : "tools"
    //         break
    //     default:
    //         return <div>Unknow component type {component_type}</div>
    // }
    const [mainView, setMainView] = useState(component_type);
    const [args, setArgs] = useState<any>({})
    let biz_type = relation_id ? "tools" : "tools-card"
    const [llmArgs, setLLmArgs] = useState<LLMArgs>({ biz_type: biz_type, biz_id: relationId })

    const navigateView = (view: string, args?: any) => {
        setMainView(view)
        setArgs(args)
        if (view )
        // debugger
        if (args?.relationId) {
            setRelationId(args.relationId)
            // 不刷新更新浏览器url为 #/tools/${args.relationId}
            window.history.pushState(null, '', `#/c/${component_type}/${args.relationId}`)
            setLLmArgs({ biz_type: "tools", biz_id: args.relationId })
        } else {
            window.history.pushState(null, '', `#/c/${component_type}`)
            setLLmArgs({ biz_type: "tools-card", biz_id: undefined })
        }

    }
    return <div style={{ maxWidth: "1800px", margin: "1rem auto", padding: `${isSticky ? '0 16px 0 16px' : '0'}` }}>
        {/* {relation_id} */}
        <Row
            ref={containerRef}
            gutter={[isSticky ? 16 : 0, 16]}>
            <Col lg={18} sm={18} xs={24}
                style={{

                    display: "flex",
                    flexDirection: "column", // 让 Card 撑满高度
                    height: "100%",          // 关键：继承 Row 的高度
                }}
            >
                <ComponentRender
                    {...args}
                    navigateView={navigateView}
                    relation_id={relationId}
                    relation_type="tools" view={mainView}></ComponentRender>

            </Col>
            <Col lg={6} sm={6} xs={24}
                style={isSticky ? {
                    overflow: "hidden",
                    // marginTop: "1rem",
                    position: "sticky",
                    top: `${top}px`, // 吸顶距离
                    alignSelf: "flex-start", // 避免被stretch
                    height: `calc(100vh - ${top}px - 1rem )`, // 可选：固定高度，让内部滚动
                } : {}}
            // style={{

            //     display: "flex",
            //     flexDirection: "column", // 让 Card 撑满高度
            //     height: "100%",          // 关键：继承 Row 的高度
            // }}
            >
                <Card
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
                    extra={
                        <>
                            <Segmented size="small" value={mainView}
                                onChange={(val: any) => {
                                    setMainView(val)
                                    if (val == "script") {
                                        navigateView("script")
                                    }else if (val == "tools") {
                                        navigateView("tools")
                                    }else if (val == "file") {
                                        navigateView("file")
                                    }

                                }}
                                options={[
                                    {
                                        label: "tools",
                                        value:"tools"
                                    },
                                    {
                                        label: "script",
                                        value: "script"
                                    },
                                    {
                                        label: "file",
                                        value: "file"
                                    }
                                ]} />

                        </>
                    }
                    // extra={<RedoOutlined style={{ cursor: "pointer" }} onClick={() => loadCateory()} />}
                    size="small"
                    title={<span style={{ fontWeight: 600 }}>LLM ({llmArgs.biz_type})</span>}

                >
                    <ComponentRender view={"llm"} {...llmArgs}></ComponentRender>
                </Card>
            </Col>


        </Row>
    </div>
}

export default ToolsPage