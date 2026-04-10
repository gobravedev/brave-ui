import { Button, Card, Col, Empty, Flex, Menu, Row, Segmented, Skeleton, Space, Statistic, Tag, Tooltip, Typography } from "antd";
import axios from "axios"
import { FC, useEffect, useMemo, useState } from "react";
import { RedoOutlined } from '@ant-design/icons'
import ViewResolver from "@/core/ui-renderer/ViewResolver";
import { useStoreRender } from "@/context/render/RenderProvider";

type NodeResultAsset = {
    images?: any[];
    tables?: any[];
    htmls?: any[];
};

type AnalysisNodeSample = {
    analysis_node_id: string;
    analysis_id: string;
    node_id: string;
    script_id: string;
    status: string;
    sample_id?: string;
    output_dir?: string;
    script_name?: string;
    result?: NodeResultAsset;
};

type AnalysisNodeGroup = {
    script_id: string;
    script_name: string;
    children?: AnalysisNodeSample[];
};

type ReportTreeNode = {
    key: string;
    title: string;
    nodeType: "node" | "sample";
    scriptId?: string;
    sampleId?: string;
    status?: string;
    sampleCount?: number;
    images?: number;
    tables?: number;
    htmls?: number;
    children?: ReportTreeNode[];
};

type ReportMenuItem = {
    key: string;
    label: React.ReactNode;
    children?: ReportMenuItem[];
};

const statusColorMap: Record<string, string> = {
    done: "success",
    success: "success",
    failed: "error",
    running: "processing",
    pending: "default",
    skipped: "warning",
};

const getSampleLabel = (sample: AnalysisNodeSample, index: number) => {
    const sampleId = sample.sample_id?.trim();
    if (sampleId) {
        return sampleId;
    }
    return `global-${index + 1}`;
};

const makeNodeKey = (scriptId: string) => `node:${scriptId}`;
const makeSampleKey = (sampleId: string) => `sample:${sampleId}`;

const countAssets = (samples: AnalysisNodeSample[]) => {
    return samples.reduce(
        (acc, sample) => {
            acc.images += sample.result?.images?.length || 0;
            acc.tables += sample.result?.tables?.length || 0;
            acc.htmls += sample.result?.htmls?.length || 0;
            return acc;
        },
        { images: 0, tables: 0, htmls: 0 }
    );
};

const AnalysisNodesReport: FC<any> = ({ analysis_id }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<AnalysisNodeGroup[]>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string>();
    const [selectedSampleId, setSelectedSampleId] = useState<string>();
    const [openMenuKeys, setOpenMenuKeys] = useState<string[]>([]);

    const loadData = async () => {
        setLoading(true)
        const res = await axios.get(`/analysis/visualization-node-tree/${analysis_id}`)
        const nextData = Array.isArray(res.data?.result) ? res.data.result : [];
        setData(nextData)
        // setTitle(res.data.analysis_name + " - Report")
        setLoading(false)
    }

  

    useEffect(() => {
        loadData()
    }, [analysis_id])

    const selectedNode = useMemo(() => {
        if (!data.length) {
            return null;
        }
        return data.find((item) => item.script_id === selectedNodeId) || data[0];
    }, [data, selectedNodeId]);

    const selectedNodeSamples = selectedNode?.children || [];

    const selectedSample = useMemo(() => {
        if (!selectedNodeSamples.length) {
            return null;
        }
        return selectedNodeSamples.find((item) => item.analysis_node_id === selectedSampleId) || selectedNodeSamples[0];
    }, [selectedNodeSamples, selectedSampleId]);

    useEffect(() => {
        if (!selectedNode && data.length) {
            setSelectedNodeId(data[0].script_id);
            return;
        }
        if (selectedNode && selectedNode.script_id !== selectedNodeId) {
            setSelectedNodeId(selectedNode.script_id);
        }
    }, [data, selectedNode, selectedNodeId]);

    useEffect(() => {
        if (!selectedSample && selectedNodeSamples.length) {
            setSelectedSampleId(selectedNodeSamples[0].analysis_node_id);
            return;
        }
        if (selectedSample && selectedSample.analysis_node_id !== selectedSampleId) {
            setSelectedSampleId(selectedSample.analysis_node_id);
        }
    }, [selectedNodeSamples, selectedSample, selectedSampleId]);

    const summary = useMemo(() => {
        const samples = data.flatMap((item) => item.children || []);
        const assets = countAssets(samples);
        const failedCount = samples.filter((item) => item.status === "failed").length;
        const doneCount = samples.filter((item) => item.status === "done" || item.status === "success").length;
        return {
            nodeCount: data.length,
            sampleCount: samples.length,
            failedCount,
            doneCount,
            ...assets,
        };
    }, [data]);

    const reportTreeData = useMemo<ReportTreeNode[]>(() => {
        return data.map((item) => {
            const samples = item.children || [];
            const assets = countAssets(samples);
            return {
                key: makeNodeKey(item.script_id),
                title: item.script_name || item.script_id,
                nodeType: "node",
                scriptId: item.script_id,
                sampleCount: samples.length,
                images: assets.images,
                tables: assets.tables,
                htmls: assets.htmls,
                children: samples.map((sample, index) => ({
                    key: makeSampleKey(sample.analysis_node_id),
                    title: sample.node_id || sample.analysis_node_id,
                    nodeType: "sample",
                    scriptId: item.script_id,
                    sampleId: sample.analysis_node_id,
                    status: sample.status,
                    images: sample.result?.images?.length || 0,
                    tables: sample.result?.tables?.length || 0,
                    htmls: sample.result?.htmls?.length || 0,
                })),
            };
        });
    }, [data]);

    const reportMenuItems = useMemo<ReportMenuItem[]>(() => {
        return reportTreeData.map((node) => ({
            key: node.key,
            label: (
                <Flex justify="space-between" align="center" gap={8} style={{ width: "100%", minWidth: 0 }}>
                    <Tooltip title={node.title}>
                        <Typography.Text
                            style={{
                                flex: 1,
                                minWidth: 0,
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {node.title}
                        </Typography.Text>
                    </Tooltip>
                    {/* <Space size={4}>
                        <Tag>{node.sampleCount || 0}</Tag>
                        <Tag color="blue">{node.images || 0}i</Tag>
                    </Space> */}
                </Flex>
            ),
            children: (node.children || []).map((child) => ({
                key: child.key,
                label: (
                    <Flex justify="space-between" align="center" gap={8} style={{ width: "100%", minWidth: 0 }}>
                        <Tooltip title={child.title}>
                            <Typography.Text
                                style={{
                                    flex: 1,
                                    minWidth: 0,
                                    display: "block",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {child.title}
                            </Typography.Text>
                        </Tooltip>
                        <Tag color={statusColorMap[child.status || ""] || "default"}>
                            {child.status || "unknown"}
                        </Tag>
                    </Flex>
                ),
            })),
        }));
    }, [reportTreeData]);

    useEffect(() => {
        if (!selectedNodeId) {
            setOpenMenuKeys(reportTreeData.map((item) => item.key));
            return;
        }
        setOpenMenuKeys([makeNodeKey(selectedNodeId)]);
    }, [selectedNodeId, reportTreeData]);

    const selectedTreeKey = selectedSample?.analysis_node_id
        ? makeSampleKey(selectedSample.analysis_node_id)
        : selectedNode?.script_id
            ? makeNodeKey(selectedNode.script_id)
            : undefined;

    if (loading && !data.length) {
        return <Skeleton active></Skeleton>
    }

    return <>
        <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
            <Typography.Title level={5} style={{ margin: 0 }}>
                DAG Analysis Report
            </Typography.Title>
            <Button loading={loading} onClick={loadData} icon={<RedoOutlined />} size="small"></Button>
        </Flex>

        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
            <Col xs={12} sm={8} lg={4}>
                <Card size="small"><Statistic title="Nodes" value={summary.nodeCount} /></Card>
            </Col>
            <Col xs={12} sm={8} lg={4}>
                <Card size="small"><Statistic title="Samples" value={summary.sampleCount} /></Card>
            </Col>
            <Col xs={12} sm={8} lg={4}>
                <Card size="small"><Statistic title="Done" value={summary.doneCount} /></Card>
            </Col>
            <Col xs={12} sm={8} lg={4}>
                <Card size="small"><Statistic title="Failed" value={summary.failedCount} /></Card>
            </Col>
            <Col xs={12} sm={8} lg={4}>
                <Card size="small"><Statistic title="Images" value={summary.images} /></Card>
            </Col>
            <Col xs={12} sm={8} lg={4}>
                <Card size="small"><Statistic title="Tables / HTML" value={`${summary.tables} / ${summary.htmls}`} /></Card>
            </Col>
        </Row>

        {!data.length ? <Empty description="No node report data" /> :
            <Row gutter={[12, 12]} align="top">
                <Col xs={24} lg={8} xl={7}>
                    <Card
                        size="small"
                        title="Analysis Menu"
                        styles={{ body: { padding: "8px" } }}
                    >
                        <Menu
                            mode="inline"
                            items={reportMenuItems}
                            selectedKeys={selectedTreeKey ? [selectedTreeKey] : []}
                            openKeys={openMenuKeys}
                            onOpenChange={(keys) => setOpenMenuKeys(keys.map((key) => String(key)))}
                            onClick={({ key }) => {
                                const keyString = String(key);
                                if (keyString.startsWith("node:")) {
                                    setSelectedNodeId(keyString.replace("node:", ""));
                                    setSelectedSampleId(undefined);
                                    return;
                                }
                                if (keyString.startsWith("sample:")) {
                                    const sampleId = keyString.replace("sample:", "");
                                    const ownerNode = reportTreeData.find((node) =>
                                        (node.children || []).some((child) => child.sampleId === sampleId)
                                    );
                                    if (ownerNode?.scriptId) {
                                        setSelectedNodeId(ownerNode.scriptId);
                                    }
                                    setSelectedSampleId(sampleId);
                                }
                            }}
                            style={{
                                maxHeight: "65vh",
                                overflowY: "auto",
                                paddingRight: 4,
                            }}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={16} xl={17}>
                    <Card
                        size="small"
                        title={selectedNode?.script_name || "Result Report"}
                        extra={selectedNodeSamples.length > 1 ?
                            <Segmented
                                size="small"
                                value={selectedSample?.analysis_node_id}
                                onChange={(value) => setSelectedSampleId(String(value))}
                                options={selectedNodeSamples.map((sample, index) => ({
                                    label: getSampleLabel(sample, index),
                                    value: sample.analysis_node_id,
                                }))}
                            /> : undefined}
                    >
                        {!selectedSample ? <Empty description="No sample result" /> :
                            <Flex vertical gap={12}>
                                <Card size="small" styles={{ body: { padding: 12 } }}>
                                    <Flex justify="space-between" align="flex-start" gap={12} wrap>
                                        <Flex vertical gap={4}>
                                            <Typography.Text strong>
                                                {selectedSample.script_name || selectedSample.node_id}
                                            </Typography.Text>
                                            <Typography.Text type="secondary">
                                                node: {selectedSample.node_id}
                                            </Typography.Text>
                                            <Typography.Text type="secondary">
                                                sample: {selectedSample.sample_id || "global"}
                                            </Typography.Text>
                                            {selectedSample.output_dir &&
                                                <Typography.Paragraph type="secondary" style={{ marginBottom: 0, wordBreak: "break-all" }}>
                                                    output: {selectedSample.output_dir}
                                                </Typography.Paragraph>}
                                        </Flex>
                                        <Space wrap>
                                            <Tag color={statusColorMap[selectedSample.status] || "default"}>{selectedSample.status}</Tag>
                                            <Tag color="blue">{selectedSample.result?.images?.length || 0} images</Tag>
                                            <Tag color="purple">{selectedSample.result?.tables?.length || 0} tables</Tag>
                                            <Tag color="gold">{selectedSample.result?.htmls?.length || 0} htmls</Tag>
                                        </Space>
                                    </Flex>
                                </Card>

                                <ViewResolver
                                    analsyisResult={selectedSample.result || { images: [], tables: [], htmls: [] }}
                                    view={"analysisResultDisplay"}>
                                </ViewResolver>
                            </Flex>}
                    </Card>
                </Col>
            </Row>}

    </>
}

export default AnalysisNodesReport