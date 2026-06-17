import { useEffect, useMemo, useState } from "react";
import { Button, Card, Flex, Popconfirm, Space, Table, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined } from "@ant-design/icons";
import { useAppSessionPageQuery } from "@/hooks/usePaginationV2";
import { deleteAppSessionApi, startAppSessionApi, stopAppSessionApi, type AppSessionItem } from "@/api/container";
import { useSelector } from "react-redux";

const { Text } = Typography;

export interface AppSessionPageProps {
  id?: string;
  project_id?: string;
  container_template_id?: string;
  name?: string;
  status?: string;
  workspace_path?: string;
  page_size?: number | string;
  title?: string;
  onOk?: (item: AppSessionItem) => void;
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

const formatTime = (value?: string) => (value ? new Date(value).toLocaleString() : "-");

const buildAppUrl = (containerURL: string, appSessionId?: string) => {
  if (!appSessionId) {
    return "";
  }
  return `${containerURL}/apps/${encodeURIComponent(appSessionId)}/`;
};

const isRunningStatus = (status?: string) => /running|started|active/i.test(status || "");

const isStoppedStatus = (status?: string) => /stopped|exited|failed|terminated|created/i.test(status || "");

const columns: ColumnsType<AppSessionItem> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    width: 220,
    ellipsis: true,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 140,
    render: (value: string) => value || "-",
  },
  {
    title: "Project ID",
    dataIndex: "project_id",
    key: "project_id",
    width: 160,
    render: (value: string) => value || "-",
  },
  {
    title: "Template ID",
    dataIndex: "container_template_id",
    key: "container_template_id",
    width: 180,
    render: (value: string) => value || "-",
  },
  {
    title: "Workspace",
    dataIndex: "workspace_path",
    key: "workspace_path",
    ellipsis: true,
    render: (value: string) => value || "-",
  },
  {
    title: "Started At",
    dataIndex: "started_at",
    key: "started_at",
    width: 200,
    render: (value: string) => formatTime(value),
  },
  {
    title: "Stopped At",
    dataIndex: "stopped_at",
    key: "stopped_at",
    width: 200,
    render: (value: string) => formatTime(value),
  },
  {
    title: "Created At",
    dataIndex: "created_at",
    key: "created_at",
    width: 210,
    render: (value: string) => formatTime(value),
  },
];

const AppSessionPage = ({
  id,
  project_id,
  container_template_id,
  name,
  status,
  workspace_path,
  page_size,
  title,
  onOk,
  onCancel,
  close,
}: AppSessionPageProps) => {
  const [selectedId, setSelectedID] = useState<string>();
  const [pendingAction, setPendingAction] = useState<string>("");
  const [messageApi, contextHolder] = message.useMessage();
  const selectable = Boolean(onOk || onCancel);
    const { containerURL } = useSelector((state: any) => state.user);

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
  } = useAppSessionPageQuery(
    {},
    {
      initialPageSize: normalizePageSize(page_size),
      keepPreviousData: true,
      staleTime: 30_000,
      cacheTime: 5 * 60_000,
    }
  );

  useEffect(() => {
    setQuery({
      id: normalizeText(id),
      project_id: normalizeText(project_id),
      container_template_id: normalizeText(container_template_id),
      name: normalizeText(name),
      status: normalizeText(status),
      workspace_path: normalizeText(workspace_path),
    });
  }, [id, project_id, container_template_id, name, status, workspace_path, setQuery]);

  const selectedItem = useMemo(() => data.find((item) => item.id === selectedId), [data, selectedId]);

  const runAction = async (action: "start" | "stop" | "delete", item: AppSessionItem) => {
    const actionKey = `${action}-${item.id}`;
    setPendingAction(actionKey);
    try {
      if (action === "start") {
        await startAppSessionApi({ id: String(item.id) });
        messageApi.success("App session started");
      } else if (action === "stop") {
        await stopAppSessionApi({ id: String(item.id) });
        messageApi.success("App session stopped");
      } else {
        await deleteAppSessionApi({ id: String(item.id) });
        messageApi.success("App session deleted");
      }
      await refetch();
    } catch (_error) {
      // Error message is handled by the global HTTP interceptor.
    } finally {
      setPendingAction("");
    }
  };

  const selectColumns = useMemo<ColumnsType<AppSessionItem>>(() => {
    const actionColumns: ColumnsType<AppSessionItem> = [
      {
        title: "Operation",
        key: "operation",
        width: 260,
        fixed: "right",
        render: (_: unknown, record) => {
          const status = record.status || "";
          const startKey = `start-${record.id}`;
          const stopKey = `stop-${record.id}`;
          const deleteKey = `delete-${record.id}`;
          const appUrl = buildAppUrl(containerURL, record.id);

          return (
            <Space size={4}>
              <Button
                size="small"
                type="link"
                disabled={!isRunningStatus(status) || !appUrl}
                onClick={() => window.open(appUrl, "_blank", "noopener,noreferrer")}
              >
                Open
              </Button>
              <Button
                size="small"
                type="link"
                disabled={isRunningStatus(status)}
                loading={pendingAction === startKey}
                onClick={() => runAction("start", record)}
              >
                Start
              </Button>
              <Button
                size="small"
                type="link"
                disabled={isStoppedStatus(status)}
                loading={pendingAction === stopKey}
                onClick={() => runAction("stop", record)}
              >
                Stop
              </Button>
              <Popconfirm
                title="Delete this app session?"
                onConfirm={() => runAction("delete", record)}
                okButtonProps={{ loading: pendingAction === deleteKey }}
              >
                <Button size="small" type="link" danger loading={pendingAction === deleteKey}>
                  Delete
                </Button>
              </Popconfirm>
            </Space>
          );
        },
      },
    ];

    if (!selectable) {
      return [...columns, ...actionColumns];
    }

    return [
      ...columns,
      ...actionColumns,
      {
        title: "Select",
        key: "select_action",
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
  }, [selectable, selectedId, pendingAction]);

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

  return (
    <Card
      size="small"
      title={title || "App Session List"}
      extra={
        <Space>
          <Text type="secondary">Total: {total}</Text>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
            Refresh
          </Button>
        </Space>
      }
    >
      {contextHolder}
      <Table<AppSessionItem>
        rowKey="id"
        columns={selectColumns}
        dataSource={data}
        loading={isLoading || isFetching}
        size="small"
        scroll={{ x: 1500 }}
        locale={{ emptyText: error ? "Failed to load app sessions" : "No app sessions" }}
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
    </Card>
  );
};

export default AppSessionPage;
