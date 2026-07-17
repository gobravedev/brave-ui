import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Flex, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined } from "@ant-design/icons";
import { useAnalysisNodePageQuery } from "@/hooks/usePaginationV2";
import type { AnalysisNodeItem } from "@/api/analysis";
import { useStoreRender } from "@/context/render/RenderProvider";
import AnalysisNodeDetails from "./analysis-nodes-report/analysis-node-details";
import { useComponentStore } from "@/store-zustand/components";

const { Text } = Typography;

export interface AnalysisNodePageProps {
	script_id?: string;
	page_size?: number | string;
	title?: string;
	onOk?: (node: AnalysisNodeItem) => void;
	onCancel?: () => void;
	close?: () => void;
}

const normalizeText = (value?: string) => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
};

const normalizePageSize = (value?: number | string) => {
	if (typeof value === "number" && Number.isFinite(value) && value > 0) {
		return Math.floor(value);
	}

	if (typeof value === "string") {
		const parsed = Number.parseInt(value, 10);
		if (Number.isFinite(parsed) && parsed > 0) {
			return parsed;
		}
	}

	return 10;
};

const statusColor = (status?: string) => {
	const v = String(status ?? "").toLowerCase();
	if (v === "done" || v === "finished") return "success";
	if (v === "running" || v === "submitted") return "processing";
	if (v === "failed") return "error";
	if (v === "skipped" || v === "stopped") return "default";
	return "default";
};


const AnalysisNodePage = ({
	script_id,
	page_size,
	title,
	onOk,
	onCancel,
	close,
}: AnalysisNodePageProps) => {
	const [selectedId, setSelectedID] = useState<string>();
	const selectable = Boolean(onOk || onCancel);
	const { setAnalysisNodeId, analysisNodeId } = useStoreRender()
	// const [nodeID,setNodeId] = useState<any>()
	const columns: ColumnsType<AnalysisNodeItem> = [
		{
			title: "Node Name",
			dataIndex: "node_name",
			key: "node_name",
			ellipsis: true,
			render: (value: string) => value || "-",
		},
		{
			title: "Analysis Node ID",
			dataIndex: "analysis_node_id",
			key: "analysis_node_id",
			width: 220,
			ellipsis: true,
			render: (value: string) => value || "-",
		},
		{
			title: "Analysis ID",
			dataIndex: "analysis_id",
			key: "analysis_id",
			width: 200,
			ellipsis: true,
			render: (value: string) => value || "-",
		},
		{
			title: "Script ID",
			dataIndex: "script_id",
			key: "script_id",
			width: 180,
			ellipsis: true,
			render: (value: string) => value || "-",
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			width: 120,
			render: (value: string) => <Tag color={statusColor(value)}>{value || "-"}</Tag>,
		},
		{
			title: "Executor",
			dataIndex: "executor",
			key: "executor",
			width: 120,
			render: (value: string) => value || "-",
		},
		{
			title: "Created At",
			dataIndex: "created_at",
			key: "created_at",
			width: 210,
			render: (value: string) => (value ? new Date(value).toLocaleString() : "-"),
		},
		{
			title: "Updated At",
			dataIndex: "updated_at",
			key: "updated_at",
			width: 210,
			render: (value: string) => (value ? new Date(value).toLocaleString() : "-"),
		}, {
			title: "action",
			key: "action",
			fixed: "right",
			width: 120,
			render: (_: unknown, record) => (
				<Button type="link" onClick={() => {
					setAnalysisNodeId(record.id)
					// setNodeId(record.id)
				}}>View</Button>
			)
		}
	];

	const {
		data,
		total,
		page,
		pageSize,
		setPage,
		setPageSize,
		setQuery,
		isLoading,
		isFetching,
		error,
		refetch,
	} = useAnalysisNodePageQuery(
		{},
		{
			enabled: true,
			initialPageSize: normalizePageSize(page_size),
			keepPreviousData: true,
			staleTime: 30_000,
			cacheTime: 5 * 60_000,
		}
	);

	useEffect(() => {
		setQuery({
			script_id: normalizeText(script_id),
		});
	}, [script_id, setQuery]);

	const selectedItem = useMemo(() => data.find((item) => item.id === selectedId), [data, selectedId]);

	const selectColumns = useMemo<ColumnsType<AnalysisNodeItem>>(() => {
		if (!selectable) {
			return columns;
		}

		return [
			...columns,
			{
				title: "Action",
				key: "action",
				width: 120,
				fixed: "right",
				render: (_: unknown, record) => (
					<Button
						type={record.id === selectedId ? "primary" : "default"}
						size="small"
						onClick={() => setSelectedID(record.id)}
					>
						{record.id === selectedId ? "Selected" : "Select"}
					</Button>
				),
			},
		];
	}, [selectable, selectedId]);

	const handleConfirm = () => {
		if (!selectedItem || !onOk) {
			return;
		}
		onOk(selectedItem);
	};

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
			return;
		}
		if (close) {
			close();
		}
	};
	const { register, unregister } = useComponentStore();


	const instanceNode = useMemo(() => {
		return {
			analysisStarted: (args: any) => {
				refetch()
			},
			analysisDone: (args: any) => {
				refetch()
			}

		}
	}, [])
	useEffect(() => {
		register("analysis", "*", instanceNode);
		return () => {
			unregister("analysis", "*", instanceNode);
		}
	}, []);



	return (
		<Card
			size="small"
			title={title || "Analysis Node List By Active Project"}
			extra={
				<Space>
					<Text type="secondary">Total: {total}</Text>
					<Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
						Refresh
					</Button>
				</Space>
			}
		>
			{error ? (
				<Alert type="error" showIcon message="Failed to load analysis nodes" style={{ marginBottom: 12 }} />
			) : null}

			<Table<AnalysisNodeItem>
				rowKey="id"
				columns={selectColumns}
				dataSource={data}
				loading={isLoading || isFetching}
				size="small"
				scroll={{ x: 1500 }}
				locale={{ emptyText: error ? "Failed to load analysis nodes" : "No analysis nodes" }}
				rowSelection={
					selectable
						? {
							type: "radio",
							selectedRowKeys: selectedId ? [selectedId] : [],
							onChange: (selectedRowKeys) => {
								setSelectedID(String(selectedRowKeys[0] || ""));
							},
						}
						: undefined
				}
				onRow={
					selectable
						? (record) => ({
							onClick: () => setSelectedID(record.id),
						})
						: undefined
				}
				pagination={{
					current: page,
					pageSize,
					total,
					showSizeChanger: true,
					pageSizeOptions: [20, 50, 100, 200, 500, 1000],
					onChange: (nextPage, nextPageSize) => {
						if (nextPageSize !== pageSize) {
							setPageSize(nextPageSize);
						}
						setPage(nextPage);
					},
					showTotal: (value) => `Total ${value} items`,
				}}
			/>

			{selectable && (
				<Flex justify="end" gap="small" style={{ marginTop: 12 }}>
					<Button onClick={handleCancel}>Cancel</Button>
					<Button type="primary" disabled={!selectedItem} onClick={handleConfirm}>
						Confirm
					</Button>
				</Flex>
			)}

			{analysisNodeId && <AnalysisNodeDetails analysis_node_id={analysisNodeId}></AnalysisNodeDetails>}

		</Card>
	);
};

export default AnalysisNodePage;
function setNodeId(id: string) {
	throw new Error("Function not implemented.");
}

