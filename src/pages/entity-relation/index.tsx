import React, { FC, lazy, useEffect, useMemo, useRef, useState } from "react";
import { Form, Select, Button, Card, Input, message, Collapse, Typography, Flex, Modal, Splitter, ConfigProvider, Drawer } from "antd";
import axios from "axios";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
const { Option } = Select;
const { Search } = Input;
import debounce from "lodash.debounce";
import { useModal } from "@/hooks/useModal";
import { useOutletContext } from "react-router";
import ForceGraph3D from "react-force-graph-3d";
import { useResizeDetector } from 'react-resize-detector';
// import * as THREE from "three";
import SpriteText from "three-spritetext";
import { ComponentsRender } from './components'
import GraphView from './components/graph-view'
// const  AIChat  = lazy(() => import('@/components/chat'));
const Panel: FC<any> = () => {
    // const [chatOpen, setChatOpen] = useState(false);
    const [sizes, setSizes] = React.useState<(number | string)[]>(['100%', '0%']);
    const [activeView, setActiveView] = useState<string | null>(null);
    const [data, setData] = useState<any>();
    const graphViewRef = useRef<any>(null)
    const [queryParams, updateQueryParams] = useState({
        
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const [innerHeight, setInnerHeight] = useState<any>(null);
    const updateHeight = () => {
        if (containerRef.current) {
            const height = containerRef.current.getBoundingClientRect().top // 包含 padding
            setInnerHeight(window.innerHeight - height);
        }
    }
    const loadGraph = () => {
        if (graphViewRef.current) {
            graphViewRef.current.reload()
        }
    }
    const cancelSelectLink = () => {
        if (graphViewRef.current) {
            graphViewRef.current.cancelSelectLink()
        }
    }
    const cancelSelectNode = () => {
        if (graphViewRef.current) {
            graphViewRef.current.cancelSelectNode()
        }
    }
    const updateQueryParam = (key:any,value:any) => {
        if (graphViewRef.current) {
            graphViewRef.current.updateQueryParam(key,value)
        }
    }
    // useEffect(() => {

    // }, []);
    useEffect(() => {
        updateHeight(); // 初始化
        window.addEventListener("resize", updateHeight);
        // window.addEventListener("scroll", updateHeight);
        return () => {
            window.removeEventListener("resize", updateHeight);
            //   window.removeEventListener("scroll", updateHeight);
        };
    }, []);



    return <div style={{ backgroundColor: "#f0f2f5", padding: "1rem 1rem 0 1rem  " }}>
        <div ref={containerRef}>
            {/* {innerHeight} */}
            <ConfigProvider
                theme={{
                    components: {
                        Splitter: {
                            splitBarSize: 5,
                            splitTriggerSize: 30
                        },
                    },
                }}
            >
                <Splitter
                    onResize={setSizes}
                // splitterStyle={{

                // }}
                >
                    <Splitter.Panel size={sizes[0]} min={"20%"} style={{ paddingRight: `${activeView ? "0.5rem" : "0"}` }}>
                        <GraphView
                            ref={graphViewRef}
                            height={innerHeight}
                            updateQueryParams={updateQueryParams}
                            openView={(view: string, data?: any) => {
                                setActiveView(view)
                                // if (view == "details") {
                                //     setSizes(['70%', '30%'])

                                // } else {
                                //     setSizes(['80%', '20%'])

                                // }
                                setSizes(['70%', '30%'])
                                if (data) {
                                    setData(data)
                                }
                            }} activeView={activeView} />
                    </Splitter.Panel>

                    {activeView && (
                        <Splitter.Panel size={sizes[1]} min={"20%"} style={{ paddingLeft: `${activeView ? "0.5rem" : "0"}` }}>
                            {/* <ChatView closeChat={() => {
                            setChatOpen(false)
                            setSizes(['100%', '0%'])
                        }} /> */}
                            <ComponentsRender
                                graphOpt={{
                                    loadGraph: loadGraph,
                                    
                                    updateQueryParam:updateQueryParam,
                                    cancelSelectLink: cancelSelectLink,
                                    cancelSelectNode: cancelSelectNode
                                }}
                                queryParams={queryParams}
                                // loadGraph={loadGraph}
                                height={innerHeight} data={data} view={activeView}
                                close={() => {
                                    setActiveView(null)
                                    setData(null)
                                    setSizes(['100%', '0%'])
                                    cancelSelectLink()
                                    cancelSelectNode()
                                }}></ComponentsRender>
                        </Splitter.Panel>
                    )}
                </Splitter>
            </ConfigProvider>
        </div>

        {/* {chatOpen?"aaa":"bbb"} */}
        {/* {JSON.stringify(sizes)} */}
        {/* {height} */}


    </div>

}
export default Panel;




