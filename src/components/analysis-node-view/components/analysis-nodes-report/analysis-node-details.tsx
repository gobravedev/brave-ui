import { Button, Card, Flex, Popconfirm, Skeleton, Space, Tag, Tooltip, Typography } from "antd";
import axios from "axios";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { CloseOutlined, EditOutlined, ExportOutlined, RedoOutlined } from "@ant-design/icons";
import ViewResolver from "@/core/ui-renderer/ViewResolver";
import { invoke } from "@/core/ui-system/invokeV2";
import { runAnalysisNodeApi, stopAnalysisNodeApi } from "@/api/analysis";
import { useGlobalMessage } from "@/hooks/useGlobalMessage";
import { useSelector } from "react-redux";
import { useStoreRender } from "@/context/render/RenderProvider";
import { useSideViewContext } from "@/context/side/SideViewContext";
import { useComponentStore } from "@/store-zustand/components";

type NodeResultAsset = {
    images?: any[];
    tables?: any[];
    htmls?: any[];
};

type AnalysisNodeSample = {
    analysis_node_id: string;
    status: string;
    server_status: string;
    result?: NodeResultAsset;
    node?: any;
};

const statusColorMap: Record<string, string> = {
    done: "success",
    success: "success",
    failed: "error",
    running: "processing",
    pending: "default",
    skipped: "warning",
};

export interface AnalysisNodeDetailsProps {
    analysis_node_id?: string;
}

const AnalysisNodeDetails: FC<AnalysisNodeDetailsProps> = ({ analysis_node_id }) => {
    const [detailLoading, setDetailLoading] = useState(false);
    const [sampleDetailMap, setSampleDetailMap] = useState<Record<string, Partial<AnalysisNodeSample>>>({});
    const { analysisNodeId, setAnalysisNodeId } = useStoreRender();
    const { setSideView } = useSideViewContext();
    const { register, unregister } = useComponentStore();
    const message = useGlobalMessage();
    const [selectedSampleDetail, setSelectedSampleDetail] = useState<any>({});
    const { containerURL } = useSelector((state: any) => state.user);

    // const loadSampleDetail = useCallback(async (targetAnalysisNodeId?: string, force = false) => {
    //     if (!targetAnalysisNodeId || (sampleDetailMap[targetAnalysisNodeId] && !force)) {
    //         return;
    //     }

    // setDetailLoading(true);
    // try {
    //     const res = await axios.get(`/analysis/visualization-node-file/${targetAnalysisNodeId}`);
    //     setSampleDetailMap((prev) => ({
    //         ...prev,
    //         [targetAnalysisNodeId]: res.data,
    //     }));
    // } finally {
    //     setDetailLoading(false);
    // }
    // }, [sampleDetailMap]);

    // const selectedSampleDetail = analysis_node_id ? sampleDetailMap[analysis_node_id] : undefined;

    const loadSampleDetail = async (targetAnalysisNodeId?: string) => {
    
        setDetailLoading(true);
        try {
            const res = await axios.get(`/analysis/visualization-node-file/${targetAnalysisNodeId}`);
            setSelectedSampleDetail(res.data);
        } finally {
            setDetailLoading(false);
        }
    }

    const instance = useMemo(() => {
        return {
            analysisDone: () => {
                loadSampleDetail(analysis_node_id);
            },
            analysisStarted: () => {
                loadSampleDetail(analysis_node_id);
            },
        };
    }, [analysis_node_id]);

    useEffect(() => {
        loadSampleDetail(analysis_node_id);
    }, [analysis_node_id]);

    useEffect(() => {
        if (analysis_node_id) {
            register("analysis", analysis_node_id, instance);
            return () => {
                unregister("analysis", analysis_node_id, instance);
            };
        }
    }, [analysis_node_id, instance, register, unregister]);

    return (
        <Card
            size="small"
            title={selectedSampleDetail?.node?.script_name || "Result Report"}
            extra={
                <Space>
                    {selectedSampleDetail && (
                        <Space>
                            <Button
                                size="small"
                                color="cyan"
                                variant="solid"
                                onClick={() => {
                                    invoke.nodeParams.drawer(
                                        { analysis_node_id: selectedSampleDetail.node?.analysis_node_id },
                                        {
                                            width: 960,
                                            title: `Params - ${selectedSampleDetail.node?.node_id}`,
                                        }
                                    );
                                }}
                            >
                                Params
                            </Button>
                            <Tooltip title={`Edit Script ${selectedSampleDetail.node?.script_id}`}>
                                <Button
                                    size="small"
                                    color="cyan"
                                    variant="solid"
                                    onClick={() => {
                                        invoke.createOrUpdateComponent.drawer(
                                            {
                                                component_id: selectedSampleDetail.node?.script_id,
                                                structure: {
                                                    component_type: "script",
                                                },
                                            },
                                            {
                                                width: 960,
                                                title: `Edit - ${selectedSampleDetail.node?.node_id}`,
                                            }
                                        );
                                    }}
                                >
                                    Edit
                                </Button>
                            </Tooltip>

                            <Tooltip title={`Script Code ${selectedSampleDetail.node?.script_id}`}>
                                <Button
                                    size="small"
                                    color="cyan"
                                    variant="solid"
                                    onClick={() => {
                                        invoke.scriptCodeEdit.drawer(
                                            {
                                                component_id: selectedSampleDetail.node?.script_id,
                                            },
                                            {
                                                width: 960,
                                                title: `Code - ${selectedSampleDetail.node?.node_id}`,
                                            }
                                        );
                                    }}
                                >
                                    Code
                                </Button>
                            </Tooltip>

                            {selectedSampleDetail.node?.status != "pending" && (
                                <>
                                    {selectedSampleDetail.node?.image_status == "exist" ? (
                                        <>
                                            {selectedSampleDetail.node?.status == "running" ? (
                                                <Popconfirm
                                                    title={"Whether or not to stop?"}
                                                    onConfirm={async () => {
                                                        await stopAnalysisNodeApi(selectedSampleDetail.node?.analysis_node_id, "node");
                                                        message.success("Stop Success");
                                                    }}
                                                >
                                                    <Button size="small" color="red" variant="solid">
                                                        Stop
                                                    </Button>
                                                </Popconfirm>
                                            ) : (
                                                <Popconfirm
                                                    title={"Whether or not to run?"}
                                                    onConfirm={async () => {
                                                        await runAnalysisNodeApi(selectedSampleDetail.node?.analysis_node_id, "node");
                                                        message.success("run successfully");
                                                    }}
                                                >
                                                    <Button size="small" color="cyan" variant="solid">
                                                        {selectedSampleDetail.node?.status == "ready" ? "Run" : "Re-Run"}
                                                    </Button>
                                                </Popconfirm>
                                            )}

                                            {selectedSampleDetail.node?.server_status == "running" ? (
                                                <>
                                                    <Popconfirm
                                                        title={"Whether or not to stop?"}
                                                        onConfirm={async () => {
                                                            await stopAnalysisNodeApi(selectedSampleDetail.node?.analysis_node_id, "nserver");
                                                        }}
                                                    >
                                                        <Button size="small" color="red" variant="solid">
                                                            Stop Server
                                                        </Button>
                                                    </Popconfirm>
                                                    <Tooltip
                                                        title={
                                                            <>
                                                                {`${containerURL}/container/nserver-${selectedSampleDetail.node?.analysis_node_id}/`}
                                                            </>
                                                        }
                                                    >
                                                        <ExportOutlined
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => {
                                                                window.open(
                                                                    `${containerURL}/container/nserver-${selectedSampleDetail.node?.analysis_node_id}/`,
                                                                    "_blank"
                                                                );
                                                            }}
                                                        />
                                                    </Tooltip>
                                                </>
                                            ) : (
                                                <Popconfirm
                                                    title="Whether to start the nserver?"
                                                    onConfirm={async () => {
                                                        await runAnalysisNodeApi(selectedSampleDetail.node?.analysis_node_id, "nserver");
                                                    }}
                                                >
                                                    <Button size="small" color="cyan" variant="solid">
                                                        Run Server
                                                    </Button>
                                                </Popconfirm>
                                            )}
                                        </>
                                    ) : (
                                        <Popconfirm
                                            title="Pull?"
                                            onConfirm={async () => {
                                                await axios.post(`/container/pull-image/${selectedSampleDetail.node?.container_id}`);
                                            }}
                                        >
                                            <Button size="small" color="cyan" variant="solid">
                                                {selectedSampleDetail.node?.image_status == "pulling" ? "pulling" : "Pull"}
                                            </Button>
                                        </Popconfirm>
                                    )}
                                </>
                            )}
                        </Space>
                    )}

                    {analysisNodeId == analysis_node_id ? (
                        <Tooltip title={`Close ${analysis_node_id}`}>
                            <Button
                                size="small"
                                onClick={() => {
                                    setAnalysisNodeId(null);
                                }}
                                icon={<CloseOutlined />}
                            ></Button>
                        </Tooltip>
                    ) : (
                        <Tooltip title={`${analysis_node_id}`}>
                            <Button
                                size="small"
                                onClick={() => {
                                    setAnalysisNodeId(analysis_node_id || null);
                                    setSideView("editParamsPanel");
                                }}
                                icon={<EditOutlined />}
                            />
                        </Tooltip>
                    )}

                    <Button
                        loading={detailLoading}
                        onClick={() => loadSampleDetail(analysis_node_id)}
                        size="small"
                        icon={<RedoOutlined />}
                    />
                </Space>
            }
        >
            {!analysis_node_id || !selectedSampleDetail ? (
                <Skeleton active paragraph={{ rows: 2 }} />
            ) : (
                <Flex vertical gap={12}>
                    <Card size="small" styles={{ body: { padding: 12 } }}>
                        <Flex justify="space-between" align="flex-start" gap={12} wrap>
                            <Flex vertical gap={4}>
                                <Typography.Text type="secondary">node: {selectedSampleDetail.node?.node_id}</Typography.Text>
                                <Typography.Text type="secondary">
                                    analysis_node_id: {selectedSampleDetail.node?.analysis_node_id}
                                </Typography.Text>
                                <Typography.Text type="secondary">
                                    container_image: {selectedSampleDetail.node?.container_image}
                                </Typography.Text>

                                {selectedSampleDetail.node?.sample_id && (
                                    <Typography.Text type="secondary">sample: {selectedSampleDetail.node?.sample_id}</Typography.Text>
                                )}

                                {selectedSampleDetail.node?.output_dir && (
                                    <Typography.Paragraph type="secondary" style={{ marginBottom: 0, wordBreak: "break-all" }}>
                                        output: {selectedSampleDetail.node?.output_dir}
                                    </Typography.Paragraph>
                                )}
                            </Flex>
                            <Space wrap>
                                {selectedSampleDetail.status && (
                                    <Tag color={statusColorMap[selectedSampleDetail.status]}>{selectedSampleDetail.status}</Tag>
                                )}
                                {selectedSampleDetail.server_status && (
                                    <Tag color={statusColorMap[selectedSampleDetail.server_status]}>
                                        {selectedSampleDetail.server_status}
                                    </Tag>
                                )}
                            </Space>
                        </Flex>
                    </Card>

                    {selectedSampleDetail.status == "running" || detailLoading ? (
                        <Skeleton active paragraph={{ rows: 6 }} />
                    ) : (
                        <ViewResolver
                            analsyisResult={selectedSampleDetail.result || { images: [], tables: [], htmls: [] }}
                            view={"analysisResultDisplay"}
                        ></ViewResolver>
                    )}
                </Flex>
            )}
        </Card>
    );
};

export default AnalysisNodeDetails;