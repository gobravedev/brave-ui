import { Button, Drawer, Form, Input, Select } from "antd";
import axios from "axios";
import { FC, useState } from "react";
const { Option } = Select;
import { EntityView } from '@/pages/entity/index'
import { useModals } from "@/hooks/useModal";
const Taxonomy: FC<any> = ({ }) => {

    const [fromLabel, setFromLabel] = useState<string>("study");
    const [toLabel, setToLabel] = useState<string>("disease");
    const form = Form.useFormInstance();

    const [fromOptions, setFromOptions] = useState<any[]>([]);
    const [toOptions, setToOptions] = useState<any[]>([]);
    const { modals, openModals, closeModals } = useModals(["entityDrawer"]);
    const [record, setRecord] = useState<any>()

    // 实时搜索实体
    const handleSearch = async (label: string, keywords: string, setOptions: any) => {
        if (!keywords) return;
        try {
            const res = await axios.get(`/entity/find-by-name/${label}/${keywords}`);
            setOptions(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    // const getRequest = (values: any) => {
    //     const fromEntity = fromOptions.find((e) => e.entity_id === values.from_entity);
    //     const toEntity = toOptions.find((e) => e.entity_id === values.to_entity);

    //     const payload = {
    //         from_entity: {
    //             label: fromLabel,// .charAt(0).toUpperCase() + fromLabel.slice(1), // Study/Disease/Taxonomy
    //             entity_id: fromEntity.entity_id,
    //             properties: fromEntity,
    //         },
    //         to_entity: {
    //             label: toLabel,//.charAt(0).toUpperCase() + toLabel.slice(1),
    //             entity_id: toEntity.entity_id,
    //             properties: toEntity,
    //         },
    //         relation_type: values.relation_type,
    //     };
    //     return payload
    // }

    return <>
        <Form.Item label="Subject" name={"subject"}>
            <Input onClick={() => openModals("entityDrawer", { name: "subject" })}></Input>
            {/* <Select value={fromLabel} onChange={setFromLabel}>
                <Option value="study">Study</Option>
                <Option value="disease">Disease</Option>
                <Option value="taxonomy">Taxonomy</Option>
            </Select> */}
        </Form.Item>
        {/* <Button onClick={() => openModals("entityDrawer")}>aa</Button>
        {JSON.stringify(record)} */}
        <Form.Item name="from_entity" label="选择 From 实体" rules={[{ required: true }]}>
            <Select
                showSearch
                placeholder="输入关键词搜索实体"
                filterOption={false}
                onSearch={(val) => handleSearch(fromLabel, val, setFromOptions)}
            >
                {fromOptions.map((e) => (
                    <Option key={e.entity_id} value={e.entity_id}>
                        {e.entity_name || e.title || e.rank || e.entity_id}
                    </Option>
                ))}
            </Select>
        </Form.Item>

        {/* To 实体 */}
        <Form.Item label="To 实体类型">
            <Select value={toLabel} onChange={setToLabel}>
                <Option value="study">Study</Option>
                <Option value="disease">Disease</Option>
                <Option value="taxonomy">Taxonomy</Option>
            </Select>
        </Form.Item>

        <Form.Item name="to_entity" label="选择 To 实体" rules={[{ required: true }]}>
            <Select
                showSearch
                placeholder="输入关键词搜索实体"
                filterOption={false}
                onSearch={(val) => handleSearch(toLabel, val, setToOptions)}
            >
                {toOptions.map((e) => (
                    <Option key={e.entity_id} value={e.entity_id}>
                        {e.entity_name || e.title || e.rank || e.entity_id}
                    </Option>
                ))}
            </Select>
        </Form.Item>

        {/* 关系类型 */}
        <Form.Item
            name="relation_type"
            label="关系类型"
            rules={[{ required: true, message: "请输入关系类型" }]}
        >
            {/* <Input placeholder="例如: ASSOCIATED_WITH" /> */}
            <Select options={[
                { value: "ASSOCIATED_WITH", label: "ASSOCIATED_WITH" }
            ]}></Select>
        </Form.Item>
        <EntityDrawer
            form={form}
            setRecord={setRecord}
            visible={modals.entityDrawer.visible}
            params={modals.entityDrawer.params}
            onClose={() => closeModals("entityDrawer")}
        ></EntityDrawer>
    </>
}

export default Taxonomy


const EntityDrawer: FC<any> = ({ visible, setRecord,form, params, onClose, callback }) => {

    return <>
        <Drawer open={visible} onClose={onClose} width={"50%"}>
            <EntityView hiddenAssociation={true} rowSelection={{
                onChange: (selectedRowKeys: any, selectedRows: any) => {
                    // console.log(form,selectedRows, params.name)
                    form.setFieldValue( params.name,selectedRows[0].entity_id)
                    // setRecord({...selectedRows[0],fieldName:})
                    onClose()
                }, type: "radio"

            }}></EntityView>

        </Drawer>
    </>

}