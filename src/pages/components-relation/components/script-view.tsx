import AI from "@/components/chat/ai";
import { FC, useEffect, useRef, useState } from "react";
import AnalysisResultPage from "./analysis-result-page";
import { Button, Card, Col, Flex, Popconfirm, Row, Space, Tabs } from "antd";
import { ignore } from "antd/es/theme/useToken";
import ComponentStructure from "./component-structure";
import ComponentScript from "./component-script";
import { PlusOutlined, RedoOutlined } from "@ant-design/icons";

const ComponentMap: any = {
    "script": ComponentScript,
    "structure": ComponentStructure,
}
const ComponentRender: FC<any> = ({ view, ...rest }) => {
    if (!view) return null;
    const Component = ComponentMap[view];
    if (!Component) return null;
    // return<> {JSON.stringify(rest)}</>
    // return  <Component {...rest}></Component>
    return <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>

        <div style={{ flex: 1 }}>
            <Component {...rest}></Component>
        </div>
    </div>
}

const LLMScript: FC<any> = ({ component, callback, openModal, panel, component_type }) => {
    const [tabKey, setTabKey] = useState<string>("script");
    const renderRef = useRef<any>(null);

    return <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Tabs
            activeKey={tabKey}
            onChange={(key) => {
                setTabKey(key)
            }}
            tabBarExtraContent={<Space>
                {/* <Popconfirm title="Whether to generate scripts?" onConfirm={async () => {
                            await axios.post(`/component/convert-ipynb/${component_id}`)
                            messageApi.success("Generate Script Successful!")
                            getModuleContent()
                        }}>
                            <Button size="small" color="cyan" variant="solid">Generate scripts</Button>
                        </Popconfirm> */}
                {tabKey == "script" &&
                    <Popconfirm title="Whether to generate scripts?" onConfirm={async () => {
                        renderRef.current?.generateScript()
                    }}>
                        <Button size="small" type="text" icon={<PlusOutlined />}></Button>

                    </Popconfirm>

                }


                <Button size="small" type="text" icon={<RedoOutlined />}
                    onClick={() => { renderRef.current?.loadData() }}></Button>
                <Button size="small" color="cyan" variant="solid" onClick={() => {
                    renderRef.current?.save()
                }}>Save</Button>

            </Space>}
            items={[
                {
                    key: 'script',
                    label: `script`,
                }, {
                    key: 'structure',
                    label: `Structure`,
                }
            ]}></Tabs>
        <ComponentRender ref={renderRef} view={tabKey} component_id={component?.component_id}></ComponentRender>

    </div>



}




export default LLMScript