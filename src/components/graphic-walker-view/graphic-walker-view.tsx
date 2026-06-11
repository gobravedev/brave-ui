
import { GraphicWalker } from '@kanaries/graphic-walker';
import { Button, Card, Empty, Space, Spin, Tabs } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RedoOutlined } from "@ant-design/icons";

const GraphicWalkerView = () => {


    const { projectObj,theme } = useSelector((state: any) => state.user); // 'light' | 'dark'

    // const data = [
    //     {
    //         name: "Alice",
    //         age: 23,
    //         gender: "Female",
    //         city: "Beijing",
    //         salary: 12000,
    //     },
    //     {
    //         name: "Bob",
    //         age: 30,
    //         gender: "Male",
    //         city: "Shanghai",
    //         salary: 18000,
    //     },
    //     {
    //         name: "Charlie",
    //         age: 28,
    //         gender: "Male",
    //         city: "Guangzhou",
    //         salary: 15000,
    //     },
    //     {
    //         name: "David",
    //         age: 35,
    //         gender: "Male",
    //         city: "Shenzhen",
    //         salary: 22000,
    //     },
    //     {
    //         name: "Emma",
    //         age: 26,
    //         gender: "Female",
    //         city: "Beijing",
    //         salary: 14000,
    //     },
    // ];
    // const fields: any = [
    //     { fid: "name", name: "name", semanticType: "nominal", analyticType: "dimension" },
    //     { fid: "age", name: "age", semanticType: "quantitative", analyticType: "measure" },
    //     { fid: "gender", name: "gender", semanticType: "nominal", analyticType: "dimension" },
    //     { fid: "city", name: "city", semanticType: "nominal", analyticType: "dimension" },
    //     { fid: "salary", name: "salary", semanticType: "quantitative", analyticType: "measure" },
    // ];

    const [data, setData] = useState<any>()
    const [loading, setLoading] = useState(false)
    const loadData = async (analysis_result_id: any) => {
        setLoading(true)
        try {
            const resp = await axios.get(`/analysis-result/graphic-walker/${analysis_result_id}`)
            setData(resp.data)
        } catch (error) {
            console.error(error)
            setData(undefined)
        } finally {
            setLoading(false)
        }
    }

    const [parameter, setParameter] = useState<any>()
    const [activeFileId, setActiveFileId] = useState<string>()
    const gwItems = parameter?.gw?.items || []

    const reload = () => {
        if (activeFileId) {
            loadData(activeFileId)
        }
    }

    useEffect(() => {
        try {
            if (projectObj?.parameter) {
                const parameter = JSON.parse(projectObj?.parameter)
                setParameter(parameter)
                const firstFileId = parameter?.gw?.items?.[0]?.fileId
                setActiveFileId(firstFileId)
            } else {
                setParameter(undefined)
                setActiveFileId(undefined)
            }

        } catch (error) {
            console.error(error)
            setParameter(undefined)
            setActiveFileId(undefined)
        }
    }, [projectObj])

    useEffect(() => {
        if (activeFileId) {
            loadData(activeFileId)
        } else {
            setData(undefined)
        }
    }, [activeFileId])

    return <Card size='small'

        extra={<Space>

            <Button icon={<RedoOutlined />} size='small' loading={loading} onClick={reload}></Button>
        </Space>}>
        {/* {JSON.stringify(parameter)} */}

        <Tabs
            size='small'
            activeKey={activeFileId}
            onChange={(key) => setActiveFileId(key)}
            items={gwItems.map((item: any) => ({
                key: item.fileId,
                label: item.name,
            }))}
        />

        <Spin spinning={loading}>
            {data?.data && data?.fields ? <GraphicWalker
                data={data?.data}
                fields={data?.fields}
                appearance={theme === "dark" ? "dark" : "light"}
            // fields={fields}
            // chart={graphicWalkerSpec}
            // i18nLang={langStore.lang}
            /> : <Empty></Empty>}
        </Spin>




    </Card>;
}
export default GraphicWalkerView;