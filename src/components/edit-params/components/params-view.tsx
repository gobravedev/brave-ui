import { Card, Divider, Table, Tabs, Typography } from "antd"
import { FC } from "react"

const ParamsView: FC<any> = ({ data }) => {
    const params = data?.params || {}
    const dagRuntime = data?.dag_runtime || {}
    const nodes = dagRuntime?.analysis_nodes || []
    const edges = dagRuntime?.analysis_edges || []

    // const summaryData = [
    //     { key: "analysis_name", value: params?.analysis_name || "-" },
    //     { key: "species", value: params?.species || "-" },
    //     { key: "gene_id_type", value: params?.gene_id_type || "-" },
    //     { key: "filter_by", value: params?.filter_by || "-" },
    //     { key: "cutoff", value: params?.cutoff ?? "-" },
    //     { key: "top_n", value: params?.top_n ?? "-" },
    //     { key: "groups", value: Array.isArray(params?.groups) ? params.groups.join(", ") : "-" }
    // ]

    const countRows = (params?.counts || []).map((item: any, index: number) => ({
        key: String(item?.id || index),
        node_name: item?.node_name || "-",
        file_name: item?.file_name || "-",
        feature_var: item?.feature_var || "-",
        control_group: item?.control_group || "-",
        treatment_group: item?.treatment_group || "-",
        control_size: Array.isArray(item?.control) ? item.control.length : 0,
        treatment_size: Array.isArray(item?.treatment) ? item.treatment.length : 0
    }))

    const nodeRows = nodes.map((item: any, index: number) => ({
        key: String(item?.analysis_node_id || item?.node_id || index),
        node_name: item?.node_name || "-",
        script_id: item?.script_id || "-",
        status: item?.status || "-",
        retry: item?.retry ?? 0,
        upstream: Array.isArray(item?.upstream_ids) ? item.upstream_ids.length : 0,
        downstream: Array.isArray(item?.downstream_ids) ? item.downstream_ids.length : 0,
        raw: item
    }))

    const edgeRows = edges.map((item: any, index: number) => ({
        key: String(item?.analysis_edge_id || index),
        source_node: item?.source_node || "-",
        target_node: item?.target_node || "-",
        source_handle: item?.source_handle || "-",
        target_handle: item?.target_handle || "-",
        analysis_edge_id: item?.analysis_edge_id || "-"
    }))

    return <Card size="small" title="Data Visualization">
        <Tabs defaultActiveKey="Params" items={[
            {
                key: "Params",
                label: "Params",
                children: <>
                    <Typography>
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                            {JSON.stringify(data?.params, null, 2)}
                        </pre>
                    </Typography>
                </>
            },
            {
                key: "nodes",
                label: `Nodes (${nodeRows.length})`,
                children: <Table
                    size="small"
                    rowKey="key"
                    dataSource={nodeRows}
                    pagination={{ pageSize: 8 }}
                    expandable={{
                        expandedRowRender: (record: any) => (
                            <Typography>
                                <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                                    {JSON.stringify({
                                        params: record.raw?.params,
                                        resolved_inputs: record.raw?.resolved_inputs,
                                        resolved_outputs: record.raw?.resolved_outputs,
                                        output_patterns: record.raw?.output_patterns
                                    }, null, 2)}
                                </pre>
                            </Typography>
                        )
                    }}
                    columns={[
                        { title: "Node Name", dataIndex: "node_name", key: "node_name" },
                        { title: "Status", dataIndex: "status", key: "status", width: 110 },
                        { title: "Retry", dataIndex: "retry", key: "retry", width: 80 },
                        { title: "Upstream", dataIndex: "upstream", key: "upstream", width: 100 },
                        { title: "Downstream", dataIndex: "downstream", key: "downstream", width: 110 },
                        { title: "Script Id", dataIndex: "script_id", key: "script_id", ellipsis: true }
                    ]}
                />
            },
            {
                key: "edges",
                label: `Edges (${edgeRows.length})`,
                children: <Table
                    size="small"
                    rowKey="key"
                    dataSource={edgeRows}
                    pagination={false}
                    columns={[
                        { title: "Source Node", dataIndex: "source_node", key: "source_node", ellipsis: true },
                        { title: "Source Handle", dataIndex: "source_handle", key: "source_handle", width: 130 },
                        { title: "Target Node", dataIndex: "target_node", key: "target_node", ellipsis: true },
                        { title: "Target Handle", dataIndex: "target_handle", key: "target_handle", width: 130 }
                    ]}
                />
            },
            {
                key: "raw",
                label: "Raw",
                children: <Typography>
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </Typography>
            }
        ]} />
    </Card>
}

export default ParamsView