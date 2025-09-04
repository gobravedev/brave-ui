import { Button, Card, Col, Empty, Flex, Row, Tag, Tree, TreeDataNode, TreeProps } from "antd"
import axios from "axios"
import { FC, useEffect, useRef, useState } from "react"
import { useNavigate, useOutletContext } from "react-router"
import { DownOutlined } from '@ant-design/icons'
import { AnalysisResultViewComp } from '@/components/analysis-result-view'
const AnalysisReport: FC<any> = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const { project, projectObj } = useOutletContext<any>()
    const [data, setData] = useState<any>()
    const [analysis, setAnalysis] = useState<any>()
    const resultRef = useRef<any>(null)
    const navigate = useNavigate()

    const loadData = async () => {
        setLoading(true)
        // ?analysis_method=${analysisMethod}&project=${project}
        let resp: any = await axios.post(`/list-analysis-tree`, {
            // analysisMethod: analysisMethod,
            is_report: true,
            project: project
        });


        setData(resp.data)
        if (resp.data.length > 0) {
            if (resp.data[0]?.children && resp.data[0]?.children.length > 0) {
                setAnalysis(resp.data[0]?.children[0])
            }
        }

        setLoading(false)
    }
    const reloadResult = () => {
        resultRef.current.reload()
    }
    useEffect(() => {
        loadData()
    }, [project])
    return <div style={{ maxWidth: "1500px", margin: "0 auto" }}>

        <div style={{ marginBottom: "1rem" }}></div>

        <Row>
            <Col span={4}>
                <Card
                    loading={loading}
                    title={projectObj?.project_name}
                    size="small"
                    extra={
                        <Flex gap={"small"}>
                            <Button size="small" color="cyan" variant="solid" onClick={loadData}>刷新</Button>

                        </Flex>
                    }>

                    {/* <Button onClick={() => { setAnalysis(data[0]) }}></Button> */}
                    <LeftPanel onSelect={(val: any) => {
                        if (val.node?.type == "analysis") {
                            setAnalysis(val.node)
                        }
                        // console.log(val)
                    }} treeData={data}></LeftPanel>
                </Card>


            </Col>
            <Col span={20} style={{ paddingLeft: "1rem" }}>

                {analysis ? <>
                    <AnalysisResultViewComp  analysis_id={analysis?.key}></AnalysisResultViewComp>



                </> : <>
                    <Card size="small">
                        <Empty></Empty>

                    </Card>

                </>}
            </Col>
        </Row>
    </div>
}

export default AnalysisReport


const LeftPanel: FC<any> = ({ treeData, onSelect: onSelect_ }) => {

    const treeData2: TreeDataNode[] = [
        {
            title: 'parent 1',
            key: '0-0',
            children: [
                {
                    title: 'parent 1-0',
                    key: '0-0-0',

                },
                {
                    title: 'parent 1-1',
                    key: '0-0-1',

                },
                {
                    title: 'parent 1-2',
                    key: '0-0-2',

                },
            ],
        }, {
            title: 'parent 1',
            key: '0-1',
            children: [
                {
                    title: 'parent 1-0',
                    key: '0-0-0',

                },
                {
                    title: 'parent 1-1',
                    key: '0-0-1',

                },
                {
                    title: 'parent 1-2',
                    key: '0-0-2',

                },
            ],
        },
    ];


    const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
        // console.log('selected', selectedKeys, info);
        onSelect_(info)
    };

    return (
        <Tree
            showLine
            switcherIcon={<DownOutlined />}
            defaultExpandAll
            // defaultExpandedKeys={['0-0-0']}
            onSelect={onSelect}
            treeData={treeData}
        />
    );
}
