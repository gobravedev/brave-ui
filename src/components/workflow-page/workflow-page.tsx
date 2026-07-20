import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Input, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useWorkflowPageQuery } from "@/hooks/usePaginationV2";
import type { WorkflowItem } from "@/api/workflow";

const { Text } = Typography;

export interface WorkflowPageProps {
	category?: string;
	relation_type?: string;
	page_size?: number | string;
	title?: string;
	onOk?: (workflow: WorkflowItem) => void;
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

const WorkflowPage = ({
	category,
	relation_type,
	page_size,
	title,
	onOk,
}: WorkflowPageProps) => {
	const [selectedId, setSelectedID] = useState<number>();
	const [keywords, setKeywords] = useState<string>("");
	const [relationTypeValue, setRelationTypeValue] = useState<string | undefined>(normalizeText(relation_type));
	const selectable = Boolean(onOk);

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
	} = useWorkflowPageQuery(
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
		setRelationTypeValue(normalizeText(relation_type));
		setQuery({
			relation_type: normalizeText(relation_type),
			category: normalizeText(category),
			sort_by: "created_at",
			sort_order: "DESC",
		});
	}, [relation_type, category, setQuery]);

	const relationTypeOptions = useMemo(() => {
		const values = new Set<string>();
		for (const item of data) {
			const value = item.relation_type?.trim();
			if (value) {
				values.add(value);
			}
		}
		return Array.from(values).map((value) => ({ label: value, value }));
	}, [data]);

	const columns: ColumnsType<WorkflowItem> = [
		{
			title: "Workflow Name",
			dataIndex: "name",
			key: "name",
			ellipsis: true,
			width:300,
			render: (value: string) => value || "-",
		},
		{
			title: "Workflow ID",
			dataIndex: "relation_id",
			key: "relation_id",
			width: 220,
			ellipsis: true,
			render: (value: string) => value || "-",
		},
		{
			title: "Relation Type",
			dataIndex: "relation_type",
			key: "relation_type",
			width: 140,
			render: (value: string) => (value ? <Tag color="blue">{value}</Tag> : "-"),
		},
		{
			title: "Category",
			dataIndex: "category",
			key: "category",
			width: 140,
			render: (value: string) => value || "-",
		},
		{
			title: "Module ID",
			dataIndex: "component_id",
			key: "component_id",
			width: 200,
			ellipsis: true,
			render: (value: string) => value || "-",
		},
		{
			title: "Install Key",
			dataIndex: "install_key",
			key: "install_key",
			width: 180,
			ellipsis: true,
			render: (value: string) => value || "-",
		},
		{
			title: "Updated At",
			dataIndex: "updated_at",
			key: "updated_at",
			width: 210,
			render: (value: string) => (value ? new Date(value).toLocaleString() : "-"),
		},
		{
			title: "Created At",
			dataIndex: "created_at",
			key: "created_at",
			width: 210,
			render: (value: string) => (value ? new Date(value).toLocaleString() : "-"),
		},
	];

	const selectColumns = useMemo<ColumnsType<WorkflowItem>>(() => {
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
						onClick={() => {
							setSelectedID(record.id);
							onOk && onOk(record);
						}}
					>
						{record.id === selectedId ? "Selected" : "Select"}
					</Button>
				),
			},
		];
	}, [columns, selectable, selectedId, onOk]);

	const applyKeywordSearch = () => {
		setQuery({
			keywords: normalizeText(keywords),
			relation_type: normalizeText(relationTypeValue),
			category: normalizeText(category),
			sort_by: "updated_at",
			sort_order: "DESC",
		});
	};

	return (
		<Card
			size="small"
			title={title || "Workflow List"}
			extra={
				<Space>
					<Text type="secondary">Total: {total}</Text>
					<Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
						Refresh
					</Button>
				</Space>
			}
		>
			<Space wrap style={{ marginBottom: 12 }}>
				<Input
					allowClear
					placeholder="Search by name/description/tags/workflow id"
					value={keywords}
					onChange={(event) => setKeywords(event.target.value)}
					onPressEnter={applyKeywordSearch}
					style={{ width: 320 }}
				/>
				<Select
					allowClear
					placeholder="Relation type"
					value={relationTypeValue}
					onChange={(value) => {
						setRelationTypeValue(value);
						setQuery({
							relation_type: normalizeText(value),
							category: normalizeText(category),
							sort_by: "updated_at",
							sort_order: "DESC",
						});
					}}
					options={relationTypeOptions}
					style={{ width: 180 }}
				/>
				<Button type="primary" icon={<SearchOutlined />} onClick={applyKeywordSearch}>
					Search
				</Button>
			</Space>

			{error ? <Alert type="error" showIcon message="Failed to load workflows" style={{ marginBottom: 12 }} /> : null}

			<Table<WorkflowItem>
				rowKey="id"
				columns={selectColumns}
				dataSource={data}
				loading={isLoading || isFetching}
				size="small"
				scroll={{ x: 1500 }}
				locale={{ emptyText: error ? "Failed to load workflows" : "No workflows" }}
				rowSelection={
					selectable
						? {
							type: "radio",
							selectedRowKeys: selectedId ? [selectedId] : [],
							onChange: (selectedRowKeys) => {
								setSelectedID(Number(selectedRowKeys[0] || 0));
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
		</Card>
	);
};

export default WorkflowPage;
