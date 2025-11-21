import { pagePipelineComponents } from "@/api/pipeline";
import { usePagination } from "@/hooks/usePagination";
import { useStickyTop } from "@/hooks/useStickyTop";
import { Card, Col, Divider, Empty, Flex, Input, Pagination, Row, Space, Table, Tabs } from "antd";
import { FC, useMemo, useState } from "react"
import { LineChartOutlined, RedoOutlined } from '@ant-design/icons'
import Search from "antd/es/transfer/search";
import { title } from "process";
import ResultList from "@/components/result-list";
import { useModal, useModals } from "@/hooks/useModal";
import OpenFile from "@/components/open-file";
import { CreateOrUpdatePipelineComponent } from "@/components/create-pipeline";
import Sample, { BindSample } from "../sample";
import MetadataForm from "@/components/metadata-form";

const Files: FC<any> = () => {
    const { Search } = Input;

    const { ref: containerRef, top, isSticky } = useStickyTop(576);
    const [component, setComponent] = useState<any>();
    const { data, pageNumber, totalPage, loading, reload, pageSize, setPageNumber, search } = usePagination({
        pageApi: pagePipelineComponents,
        params: { component_type: "file" },
        initialPageSize: 10
    })
    const { modal, openModal, closeModal } = useModal();
    const { modals, openModals, closeModals } = useModals(["modalD", "metadataModal", "bindSample"])

    // const [searchText, setSearchText] = useState("");
    // const filteredData = useMemo(() => {
    //     if (!searchText) return data;
    //     return data.filter((item: any) =>
    //         Object.values(item).some((val) =>
    //             String(val).toLowerCase().includes(searchText.toLowerCase())
    //         )
    //     );
    // }, [data, searchText]);

    const columns: any = [
        {
            title: 'Component Name',
            dataIndex: 'component_name',
            key: 'component_name',
            width: 200,
        }, {
            title: "action",
            dataIndex: "action",
            fixed: "right",
            width: 100,

            key: "action",
            render: (_: any, record: any) => {
                return <Space>
                    <a onClick={() => {
                        openModal("createOrUpdatePipelineComponent", {
                            data: record, structure: {
                                component_type: "file",
                            }
                        })
                    }}>Edit</a>
                    {/* 分割线 */}
                    <Divider type="vertical" />

                    <a onClick={() => {
                        setComponent(record)
                    }}>View</a>
                </Space>
            }
        }
    ]
    const operatePipeline = {
                                    openModal: openModal,
                                    openModals: openModals
                                }
    return <div style={{ maxWidth: "1800px", margin: "1rem auto", padding: `${isSticky ? '0 16px 0 16px' : '0'}` }}>
        <Row gutter={[isSticky ? 16 : 0, 16]} style={{}} ref={containerRef} >
            <Col lg={8} sm={8} xs={24}


            >
                {/* {top} */}
                <Card
                    title={<><LineChartOutlined />  Files</>} extra={
                        <Flex gap={"small"} wrap>
                            <Search
                                size="small"
                                placeholder="Search Components"
                                allowClear
                                enterButton
                                onSearch={(value) => { search(value) }}
                                style={{ width: 200 }}
                            />
                            <RedoOutlined style={{ cursor: "pointer" }} onClick={reload} />
                        </Flex>
                    }
                    size="small" >
                    <Table
                        rowKey="component_id"
                        size="small"
                        // bordered
                        pagination={false}
                        loading={loading}
                        scroll={{ x: 'max-content' }}
                        columns={columns}
                        footer={() => <>
                            {totalPage != 0 && <Flex style={{ marginTop: "1rem" }} justify="space-between" align="center">
                                A total of {totalPage} records  &nbsp;
                                <Pagination
                                    size="small"
                                    current={pageNumber}
                                    pageSize={pageSize}
                                    total={totalPage}
                                    onChange={(p) => setPageNumber(p)}
                                    showSizeChanger={false}
                                />
                            </Flex>}
                        </>}
                        dataSource={data} />

                </Card>
            </Col>
            <Col lg={16} sm={16} xs={24}>
                <Card size="small">
                    <Tabs
                        size="small"
                        items={[
                            {
                                key: "result",
                                label: "Files",
                                children: component?.component_id ? <>
                                    <ResultList
                                        title="Analysis Results"
                                        // ref={tableRef}
                                        currentAnalysisMethod={component}
                                        params={{ component_id: component?.component_id }}
                                        operatePipeline={{
                                            openModal: openModal,
                                            openModals: openModals
                                        }}

                                    ></ResultList>
                                </> : <Card> <Empty description="Please select a file component to view files." /></Card>
                            }, {
                                key: "sample",
                                label: "Metadata",
                                children: <Sample operatePipeline={operatePipeline}></Sample>
                            }
                        ]}></Tabs>
                </Card>

                {/* {component?.component_id ? <>
                    <ResultList
                        title="分析结果"
                        // ref={tableRef}
                        currentAnalysisMethod={component}
                        params={{ component_id: component?.component_id }}
                        operatePipeline={{
                            openModal: openModal
                        }}

                    ></ResultList>
                </> : <Card> <Empty description="Please select a file component to view files." /></Card>}

                <Sample operatePipeline={{
                    openModal: openModal
                }}></Sample> */}

            </Col>
        </Row>


        <OpenFile
            visible={modal.key == "openFile" && modal.visible}
            onClose={closeModal}
            params={modal.params}></OpenFile>
        <CreateOrUpdatePipelineComponent
            callback={reload}
            // pipelineStructure={pipelineStructure}
            // data={record}
            visible={modal.key == "createOrUpdatePipelineComponent" && modal.visible}
            onClose={closeModal}
            params={modal.params}></CreateOrUpdatePipelineComponent>
        <MetadataForm
            visible={modal.key == "metadataForm" && modal.visible}
            onClose={closeModal}
            params={modal.params}></MetadataForm>

        <BindSample
            visible={modals.bindSample.visible}
            onClose={() => closeModals("bindSample")}
            operatePipeline={operatePipeline}
            params={modals.bindSample.params}></BindSample>

    </div>
}

export default Files