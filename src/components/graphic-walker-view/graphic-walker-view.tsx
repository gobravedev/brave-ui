
import { Card, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import GraphicWalkerContent from './graphic-walker-content';

const GraphicWalkerView = () => {


    const { projectObj } = useSelector((state: any) => state.user);

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

    const [parameter, setParameter] = useState<any>()
    const [activeFileId, setActiveFileId] = useState<string>()
    const gwItems = parameter?.gw?.items || []

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

    return <Card size='small'>
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

        <GraphicWalkerContent analysis_result_id={activeFileId} />




    </Card>;
}
export default GraphicWalkerView;