import { FC, forwardRef, use, useImperativeHandle } from "react"
import { pagePipelineComponents } from "@/api/pipeline";
import { Card, Flex, Input, Pagination, Space, Table } from "antd";
import { RedoOutlined } from '@ant-design/icons'
import { usePagination } from "@/hooks/usePagination";

const Search = Input.Search
const ComponentsPage = forwardRef<any,any>( ({ component_type, setComponent },ref) => {
    const { data, pageNumber, totalPage, loading, reload, pageSize, setPageNumber, search } = usePagination({
        pageApi: pagePipelineComponents,
        params: { component_type: component_type },
        initialPageSize: 10
    })

    useImperativeHandle(ref, () => ({
        reload
    }));

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
                        setComponent(record)
                    }}>Select</a>
                    {/* <a onClick={() => {
                        openModal("createOrUpdatePipelineComponent", {
                            data: record, structure: {
                                component_type: "file",
                            }
                        })
                    }}>Edit</a> */}
                    {/* 分割线 */}
                    {/* <Divider type="vertical" />

                    <a onClick={() => {
                        setComponent(record)
                        onClose()
                    }}>Select</a> */}
                </Space>
            }
        }
    ]

    return <>


        <Table
            title={() => <Flex gap={"small"} wrap>
                {/* <Button size="small" onClick={() => setComponent(undefined)}>Clear</Button> */}
                <Search
                    size="small"
                    placeholder="Search Components"
                    allowClear
                    enterButton
                    onSearch={(value) => { search(value) }}
                    style={{ width: 200 }}
                />
                <RedoOutlined style={{ cursor: "pointer" }} onClick={reload} />
            </Flex>}
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



    </>
})

export default ComponentsPage