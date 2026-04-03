import { usePagination } from "@/hooks/usePagination";
import { Button, Card, Empty, Flex, Pagination, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FC, useMemo } from "react";
import { RedoOutlined } from '@ant-design/icons'
import axios from "axios";

type JsonValue = string | number | boolean | null | undefined | JsonValue[] | { [key: string]: JsonValue };

interface AnalysisNode {
    id: number;
    node_id: string;
    sample_id: string | null;
    script_id: string;
    status: string;
    upstream_ids?: string[];
    downstream_ids?: string[];
    params?: JsonValue;
    resolved_inputs?: JsonValue;
    resolved_outputs?: JsonValue;
    created_at?: string | null;
    updated_at?: string | null;
}

const statusColorMap: Record<string, string> = {
    pending: "default",
    running: "processing",
    success: "success",
    failed: "error",
    skipped: "warning",
};

const stringifyJson = (value: JsonValue): string => {
    if (value === null || value === undefined) {
        return "-";
    }
    if (typeof value === "string") {
        return value;
    }
    try {
        return JSON.stringify(value, null, 2);
    } catch (error) {
        return String(value);
    }
};

const summarizeJson = (value: JsonValue): string => {
    if (value === null || value === undefined) {
        return "-";
    }
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }
    if (Array.isArray(value)) {
        return value.length === 0 ? "[]" : `Array(${value.length})`;
    }
    const keys = Object.keys(value);
    return keys.length === 0 ? "{}" : keys.join(", ");
};

const calcNodeLevels = (nodes: AnalysisNode[]): AnalysisNode[][] => {
    if (!nodes.length) return [];

    const nodeMap = new Map<string, AnalysisNode>();
    nodes.forEach((node) => nodeMap.set(node.node_id, node));

    const indegree = new Map<string, number>();
    const levelMap = new Map<string, number>();

    nodes.forEach((node) => {
        const effectiveUps = (node.upstream_ids || []).filter((upId) => nodeMap.has(upId));
        indegree.set(node.node_id, effectiveUps.length);
        if (effectiveUps.length === 0) {
            levelMap.set(node.node_id, 0);
        }
    });

    const queue: string[] = nodes
        .filter((node) => (indegree.get(node.node_id) || 0) === 0)
        .map((node) => node.node_id);

    while (queue.length > 0) {
        const currentId = queue.shift();
        if (!currentId) continue;

        const currentNode = nodeMap.get(currentId);
        const currentLevel = levelMap.get(currentId) ?? 0;
        if (!currentNode) continue;

        (currentNode.downstream_ids || []).forEach((downId) => {
            if (!nodeMap.has(downId)) return;
            const nextDegree = (indegree.get(downId) || 0) - 1;
            indegree.set(downId, nextDegree);
            levelMap.set(downId, Math.max(levelMap.get(downId) ?? 0, currentLevel + 1));
            if (nextDegree === 0) {
                queue.push(downId);
            }
        });
    }

    // If there is a cycle or incomplete edge data, push unresolved nodes to the last column.
    let maxLevel = Math.max(...Array.from(levelMap.values()), 0);
    nodes.forEach((node) => {
        if (!levelMap.has(node.node_id)) {
            maxLevel += 1;
            levelMap.set(node.node_id, maxLevel);
        }
    });

    const levels: AnalysisNode[][] = [];
    nodes.forEach((node) => {
        const level = levelMap.get(node.node_id) ?? 0;
        if (!levels[level]) {
            levels[level] = [];
        }
        levels[level].push(node);
    });

    return levels.filter(Boolean);
};

const AnalysisNodes: FC<any> = ({ analysis_id }) => {

    const { data, pageNumber, totalPage, loading, reload, pageSize, setPageNumber } = usePagination({
        url: `/analysis-runtime/nodes/page`,
        params: {
            analysis_id: analysis_id
        },
        initialPageSize: 10
    })

    const nodeLevels = useMemo(() => calcNodeLevels(data as AnalysisNode[]), [data]);

    const columns: ColumnsType<AnalysisNode> = [
        {
            title: 'node_id',
            dataIndex: 'node_id',
            key: 'node_id',
            width: 260,
            ellipsis: true,
            render: (_, record) => (
                <Flex vertical gap={4}>
                    <Typography.Text strong>{record.node_id}</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {record.sample_id || "global"}
                    </Typography.Text>
                </Flex>
            )
        },
        {
            title: 'script_id',
            dataIndex: 'script_id',
            key: 'script_id',
            width: 160,
            ellipsis: true,
        },
        {
            title: 'status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (value: string) => <Tag color={statusColorMap[value] || "default"}>{value || "unknown"}</Tag>,
        },
        {
            title: 'upstream',
            dataIndex: 'upstream_ids',
            key: 'upstream_ids',
            width: 200,
            render: (list: string[] | undefined) => (
                <Flex gap={4} wrap>
                    {(list || []).length === 0 ? "-" : (list || []).map((id) => <Tag key={id}>{id}</Tag>)}
                </Flex>
            )
        },
        {
            title: 'downstream',
            dataIndex: 'downstream_ids',
            key: 'downstream_ids',
            width: 200,
            render: (list: string[] | undefined) => (
                <Flex gap={4} wrap>
                    {(list || []).length === 0 ? "-" : (list || []).map((id) => <Tag key={id}>{id}</Tag>)}
                </Flex>
            )
        },
        {
            title: 'params',
            dataIndex: 'params',
            key: 'params',
            width: 340,
            ellipsis: true,
            render: (params: JsonValue) => (
                <Tooltip
                    title={<pre style={{ margin: 0, whiteSpace: "pre-wrap", maxWidth: 520 }}>{stringifyJson(params)}</pre>}
                    placement="topLeft"
                >
                    <Typography.Text ellipsis style={{ maxWidth: 320 }}>
                        {summarizeJson(params)}
                    </Typography.Text>
                </Tooltip>
            )
        },
        {
            title: 'resolved_inputs',
            dataIndex: 'resolved_inputs',
            key: 'resolved_inputs',
            width: 220,
            ellipsis: true,
            render: (value: JsonValue) => (
                <Tooltip
                    title={<pre style={{ margin: 0, whiteSpace: "pre-wrap", maxWidth: 520 }}>{stringifyJson(value)}</pre>}
                    placement="topLeft"
                >
                    <Typography.Text ellipsis style={{ maxWidth: 200 }}>
                        {summarizeJson(value)}
                    </Typography.Text>
                </Tooltip>
            )
        },
        {
            title: 'resolved_outputs',
            dataIndex: 'resolved_outputs',
            key: 'resolved_outputs',
            width: 220,
            ellipsis: true,
            render: (value: JsonValue) => (
                <Tooltip
                    title={<pre style={{ margin: 0, whiteSpace: "pre-wrap", maxWidth: 520 }}>{stringifyJson(value)}</pre>}
                    placement="topLeft"
                >
                    <Typography.Text ellipsis style={{ maxWidth: 200 }}>
                        {summarizeJson(value)}
                    </Typography.Text>
                </Tooltip>
            )
        }, {
            title: 'input_validation_errors',
            dataIndex: 'input_validation_errors',
            key: 'input_validation_errors',
            width: 220,
            ellipsis: true,
            render: (value: JsonValue) => (
                <Tooltip
                    title={<pre style={{ margin: 0, whiteSpace: "pre-wrap", maxWidth: 520 }}>{stringifyJson(value)}</pre>}
                    placement="topLeft"
                >
                    <Typography.Text ellipsis style={{ maxWidth: 200 }}>
                      {JSON.stringify(value)}
                    </Typography.Text>
                </Tooltip>
            )
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
        <Button onClick={async ()=>{
            await axios.post(`/analysis-runtime/snapshot`, { analysis_id })
        }}>snapshot</Button>

        <Button onClick={async ()=>{
            await axios.post(`/analysis-runtime/schedule-next`, { analysis_id })
            // reload()
        }}>schedule-next</Button>
        
        {/* <Card size="small" title="Analysis DAG" style={{ marginBottom: 12 }}>
            {nodeLevels.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No nodes" />
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <Flex align="start" gap={12} style={{ minWidth: "max-content" }}>
                        {nodeLevels.map((levelNodes, levelIndex) => (
                            <Card
                                key={`level-${levelIndex}`}
                                size="small"
                                title={`Layer ${levelIndex + 1}`}
                                style={{ width: 280, background: "#fafafa" }}
                            >
                                <Flex vertical gap={8}>
                                    {levelNodes.map((node) => (
                                        <Card key={node.id || node.node_id} size="small" bodyStyle={{ padding: 10 }}>
                                            <Flex vertical gap={6}>
                                                <Flex justify="space-between" align="center" gap={8}>
                                                    <Typography.Text strong ellipsis style={{ maxWidth: 170 }}>
                                                        {node.node_id}
                                                    </Typography.Text>
                                                    <Tag color={statusColorMap[node.status] || "default"}>{node.status || "unknown"}</Tag>
                                                </Flex>
                                                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                                    sample: {node.sample_id || "global"}
                                                </Typography.Text>
                                                <Flex gap={4} wrap>
                                                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>up:</Typography.Text>
                                                    {(node.upstream_ids || []).length === 0 ? (
                                                        <Tag>none</Tag>
                                                    ) : (
                                                        (node.upstream_ids || []).map((upId) => <Tag key={upId}>{upId}</Tag>)
                                                    )}
                                                </Flex>
                                                <Flex gap={4} wrap>
                                                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>down:</Typography.Text>
                                                    {(node.downstream_ids || []).length === 0 ? (
                                                        <Tag>none</Tag>
                                                    ) : (
                                                        (node.downstream_ids || []).map((downId) => <Tag key={downId}>{downId}</Tag>)
                                                    )}
                                                </Flex>
                                            </Flex>
                                        </Card>
                                    ))}
                                </Flex>
                            </Card>
                        ))}
                    </Flex>
                </div>
            )}
        </Card> */}

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
            rowKey={(record: AnalysisNode) => `${record.id || ""}-${record.node_id}-${record.sample_id || 'global'}`}
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
export default AnalysisNodes;