import { useGlobalMessage } from "@/hooks/useGlobalMessage";
import { Button, Form, Input, Space } from "antd";
import axios from "axios";
import { FC, useEffect, useMemo, useState } from "react";

interface CreateUpdateStoreProps {
    onOk?: (data?: any) => void;
    onCancel?: () => void;
    store_id?: string;
}

const CreateUpdateStore: FC<CreateUpdateStoreProps> = ({ onOk, onCancel, store_id }) => {
    const message = useGlobalMessage();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const isUpdate = useMemo(() => !!store_id, [store_id]);

    const loadStoreDetail = async () => {
        if (!store_id) {
            form.resetFields();
            return;
        }

        setLoading(true);
        try {
            // Reuse the existing list endpoint and locate the selected store.
            const resp = await axios.get(`/find-store-by-id/${store_id}`);
            form.setFieldsValue(resp.data);
        } catch (error: any) {
            message.error(error.response?.data?.detail || error.message || "Load store failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStoreDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store_id]);

    const saveStore = async () => {
        const values = await form.validateFields();
        setLoading(true);
        try {
            // if (isUpdate && store_id) {
            //     await axios.post(`/update-store/${store_id}`, values);
            //     message.success("Updated successfully");
            // } else {
            //     await axios.post(`/create-store`, values);
            //     message.success("Created successfully");
            // }
            await axios.post(`/save-store`, {
                ...values,
                store_id: store_id || undefined,
            })

            if (isUpdate) {
                message.success("Updated successfully");
            } else {
                message.success("Created successfully");
            }

            onOk?.(true);
        } catch (error: any) {
            message.error(error.response?.data?.detail || error.message || "Save store failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Form form={form} layout="vertical">
                {/* 

              */}
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: "Please input store name" }]}
                >
                    <Input placeholder="Store name" />
                </Form.Item>
                <Form.Item label="Path Name" name="path_name" rules={[{ required: true, message: "Please input path name" }]}
                >
                    <Input placeholder="owner/repo" />
                </Form.Item>
                <Form.Item
                    label="URL"
                    name="url"
                    rules={[{ required: true, message: "Please input URL" }]}
                >
                    <Input placeholder="http://github.com/owner/repo" />
                </Form.Item>
            </Form>

            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                <Button onClick={() => onCancel?.()}>Cancel</Button>
                <Button color="cyan" variant="solid" loading={loading} onClick={saveStore}>
                    {isUpdate ? "Update" : "Create"}
                </Button>
            </Space>
        </>
    );
};

export default CreateUpdateStore;