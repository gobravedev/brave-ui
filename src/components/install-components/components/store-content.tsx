import { DownloadOutlined, RedoOutlined } from "@ant-design/icons";
import { Button, Card, Col, Empty, Flex, Popconfirm, Row, Space, Spin, Tag, Tooltip, Typography } from "antd";
import Meta from "antd/es/card/Meta";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { colors } from "@/utils/utils";
import axios from "axios";
import { useGlobalMessage } from "@/hooks/useGlobalMessage";
import { useSelector } from "react-redux";

interface StoreContentProps {
    storeId?: string;
    // refreshToken: number;
    onStoreDeleted?: () => void;
    onOk?: () => void;
}

const StoreContent: FC<StoreContentProps> = ({
    storeId,
    // refreshToken,
    onStoreDeleted,
    onOk,
}) => {
    const message = useGlobalMessage();
    const { baseURL } = useSelector((state: any) => state.user);
    const [componentLoading, setComponentLoading] = useState(false);
    const [store, setStore] = useState<any>();
    const [components, setComponents] = useState<any[]>([]);

    const loadData = useCallback(
        async (storeId?: string) => {
            if (!storeId) {
                setStore(undefined);
                setComponents([]);
                return;
            }
            setComponentLoading(true);
            try {
                const resp = await axios.post(`/component-store/details-by-store-id/${storeId}?type=tools`);
                setComponents(resp.data.data || []);
                setStore(resp.data);
            } finally {
                setComponentLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        loadData(storeId);
    }, [loadData, storeId]);

    const filteredComponents = useMemo(() => {
        return components;
    }, [components]);

    const getImgPath = (img: string) => {
        if (!img) {
            return "";
        }
        if (img.startsWith("http")) {
            return img;
        }
        return `${baseURL}${img}`;
    };

    return (

        <Card
            title={
                <>
                    {store?.store?.name && (
                        <Tooltip title={<>
                        {store?.store?.url}<br></br>
                        {store?.store?.path}
                        </>}>

                            <a href={store?.store?.url} target="_blank" rel="noopener noreferrer">
                                {store?.store?.name}
                            </a>
                        </Tooltip>
                    )}
                  

                </>
            }
            size="small"
            extra={
                <Space>
                    {storeId && store?.store?.status == "running" && (
                        <Button
                            color="red"
                            variant="solid"
                            size="small"
                            onClick={async () => {
                                await axios.post(`/git-stop/${store?.store?.store_id}`);
                                message.success("Stop success!");
                            }}
                        >
                            Stop
                        </Button>
                    )}
                    {storeId && store?.store?.status === "done" && (
                        <Popconfirm
                            title={`Git Pull ${store.git_url} ?`}
                            onConfirm={async () => {
                                await axios.post(`/git-pull/${store?.store?.store_id}`);
                                message.success("Git pull success!");
                                loadData(storeId);
                            }}
                        >
                            <Button color="cyan" variant="solid" size="small">
                                Git Pull
                            </Button>
                        </Popconfirm>
                    )}
                    {storeId && (
                        <Popconfirm
                            title={`Delete Store ${store?.name || storeId} ?`}
                            onConfirm={async () => {
                                await axios.post(`/delete-store/${storeId}`);
                                message.success("Delete success!");
                                setStore(undefined);
                                setComponents([]);
                                if (onStoreDeleted) {
                                    onStoreDeleted();
                                }
                            }}
                        >
                            <Button color="red" variant="solid" size="small">
                                Delete
                            </Button>
                        </Popconfirm>
                    )}

                    <Button
                        size="small"
                        icon={<RedoOutlined />}
                        loading={componentLoading}
                        onClick={() => loadData(storeId)}
                    />
                </Space>
            }
        >
            <Spin spinning={componentLoading}>
                {store?.lock_data?.url ? (
                    <Typography.Text type="danger">Downloading {store.lock_data.url} ...</Typography.Text>
                ) : (
                    <>
                        {Array.isArray(filteredComponents) && filteredComponents.length !== 0 ? (
                            <Row gutter={16} style={{ position: "relative" }}>
                                {filteredComponents.map((item: any, index: any) => (
                                    <Col key={index} lg={6} sm={4} xs={24} style={{ marginBottom: "1rem", cursor: "pointer" }}>
                                        <Popconfirm
                                            okButtonProps={{ color: `${item.installed ? "red" : "blue"}`, variant: "solid" }}
                                            okText={item.installed ? "Reinstall" : "Install"}
                                            title={item.installed ? `Reinstall ${item.name} ?` : `Install ${item.name} ?`}
                                            onConfirm={async () => {
                                                await axios.post(
                                                    `/install-relation`,
                                                    {
                                                        path: item.file_path,
                                                        force: true,
                                                    },
                                                    {
                                                        timeout: 60000,
                                                    }
                                                );
                                                message.success(item.installed ? `Reinstall success!` : `Install success!`);
                                                onOk && onOk();
                                            }}
                                        >
                                            <Card
                                                size="small"
                                                hoverable
                                                className="custom-card"
                                                title={<Tooltip title={item?.relation_id}>{item.name}</Tooltip>}
                                                style={{
                                                    height: "100%",
                                                    border: "1px solid #f0f0f0",
                                                    borderRadius: "12px",
                                                    overflow: "hidden",
                                                    transition: "all 0.3s ease",
                                                }}
                                                cover={
                                                    <div style={{ height: "15rem" }}>
                                                        <img
                                                            style={{ height: "100%", width: "100%", objectFit: "cover" }}
                                                            alt={item.label}
                                                            src={getImgPath(item.img)}
                                                        />
                                                    </div>
                                                }
                                            >
                                                <Meta
                                                    title={
                                                        <Flex justify="space-between" align="center">
                                                            <Tag color={item.installed ? "#108ee9" : "#f5222d"}>
                                                                {item.installed ? "Installed" : "Not I nstalled"}
                                                            </Tag>

                                                            <DownloadOutlined style={{ cursor: "pointer" }} />
                                                        </Flex>
                                                    }
                                                    description={item?.description}
                                                    style={{ marginBottom: "1rem" }}
                                                />

                                                {item.tags &&
                                                    Array.isArray(item.tags) &&
                                                    item.tags.map((tag: any, tagIndex: any) => (
                                                        <Tooltip key={tagIndex} title={tag}>
                                                            <Tag
                                                                style={{
                                                                    wordBreak: "break-word",
                                                                    whiteSpace: "nowrap",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    maxWidth: 100,
                                                                    display: "inline-block",
                                                                    cursor: "default",
                                                                }}
                                                                color={colors[tagIndex]}
                                                            >
                                                                {tag}
                                                            </Tag>
                                                        </Tooltip>
                                                    ))}
                                            </Card>
                                        </Popconfirm>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Empty />
                        )}
                    </>
                )}
            </Spin>
        </Card>

    );
};

export default StoreContent;