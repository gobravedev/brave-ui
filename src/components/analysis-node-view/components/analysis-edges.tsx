import { usePagination } from "@/hooks/usePagination";
import { Button, Flex, Pagination, Table, Tag } from "antd";
import { FC } from "react";
import { RedoOutlined } from '@ant-design/icons'
const AnalysisEdges: FC<any> = ({ analysis_id }) => {

    const { data, pageNumber, totalPage, loading, reload, pageSize, setPageNumber } = usePagination({
        url: `/analysis-runtime/edges/page`,
        params: {
            analysis_id: analysis_id
        },
        initialPageSize: 10
    })

    const columns:any =[
        {
            title: 'source_node',
            dataIndex: 'source_node',
            key: 'source_node',
            width: 260,
            ellipsis: true,
        },
        {
            title: 'source_handle',
            dataIndex: 'source_handle',
            key: 'source_handle',
            width: 160,
            ellipsis: true,
        },
           {
            title: 'target_node',
            dataIndex: 'target_node',
            key: 'target_node',
            width: 260,
            ellipsis: true,
        },
        {
            title: 'target_handle',
            dataIndex: 'target_handle',
            key: 'target_handle',
            width: 160,
            ellipsis: true,
        },
        
        
        {
            title: 'created_at',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 190,
            ellipsis: true,
        },
        {
            title: 'updated_at',
            dataIndex: 'updated_at',
            key: 'updated_at',
            width: 190,
            ellipsis: true,
            render: (value: string | null) => value || '-',
        }
    ]
    return <>
        <Table
            title={() => 
            // 右对齐刷新按钮和搜索框
            <Flex gap={"small"} wrap justify="end" align="center">
                {/* <Button size="small" onClick={() => setComponent(undefined)}>Clear</Button> */}
                {/* <Search
                    size="small"
                    placeholder="Search Components"
                    allowClear
                    enterButton
                    onSearch={(value) => { search(value) }}
                    style={{ width: 200 }}
                /> */}
                {/* 修改为button */}
                <Button size="small" icon={<RedoOutlined />} onClick={reload}></Button>
            </Flex>}
            rowKey={(record: any) => record.task_id || `${record.node_id}-${record.sample_id || 'global'}`}
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
}
export default AnalysisEdges;