import { useEffect, useMemo, useState } from "react";
import { Button, Card, Flex, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined } from "@ant-design/icons";
import { useOutboxEventPageQuery } from "@/hooks/usePaginationV2";
import type { OutboxEventItem } from "@/api/container";

const { Text } = Typography;

export interface OutboxEventPageProps {
  id?: string;
  type?: string;
  status?: string;
  page_size?: number | string;
  title?: string;
  onOk?: (item: OutboxEventItem) => void;
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

const formatPayload = (value: OutboxEventItem["payload"]) => {
  if (!value) {
    return "-";
  }
  try {
    return JSON.stringify(value);
  } catch (_err) {
    return "-";
  }
};

const columns: ColumnsType<OutboxEventItem> = [
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
    width: 220,
    ellipsis: true,
    render: (value: string) => value || "-",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 140,
    render: (value: string) => value || "-",
  },
  {
    title: "Payload",
    dataIndex: "payload",
    key: "payload",
    ellipsis: true,
    render: (value: OutboxEventItem["payload"]) => formatPayload(value),
  },
  {
    title: "Sent At",
    dataIndex: "sent_at",
    key: "sent_at",
    width: 220,
    render: (value: string) => formatTime(value),
  },
  {
    title: "Created At",
    dataIndex: "created_at",
    key: "created_at",
    width: 220,
    render: (value: string) => formatTime(value),
  },
];

const OutboxEventPage = ({
  id,
  type,
  status,
  page_size,
  title,
  onOk,
  onCancel,
  close,
}: OutboxEventPageProps) => {
  const [selectedId, setSelectedID] = useState<string>();
  const selectable = Boolean(onOk || onCancel);

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
  } = useOutboxEventPageQuery(
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
      type: normalizeText(type),
      status: normalizeText(status),
    });
  }, [id, type, status, setQuery]);

  const selectedItem = useMemo(() => data.find((item) => item.id === selectedId), [data, selectedId]);

  const selectColumns = useMemo<ColumnsType<OutboxEventItem>>(() => {
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

  return (
    <Card
      size="small"
      title={title || "Outbox Event List"}
      extra={
        <Space>
          <Text type="secondary">Total: {total}</Text>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
            Refresh
          </Button>
        </Space>
      }
    >
      <Table<OutboxEventItem>
        rowKey="id"
        columns={selectColumns}
        dataSource={data}
        loading={isLoading || isFetching}
        size="small"
        scroll={{ x: 1400 }}
        locale={{ emptyText: error ? "Failed to load outbox events" : "No outbox events" }}
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

export default OutboxEventPage;
