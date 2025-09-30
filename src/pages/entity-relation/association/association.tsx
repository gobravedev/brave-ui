import { Button, Drawer, Form, Input, Modal, Select } from "antd";
import axios from "axios";
import { FC, useEffect, useState } from "react";
const { Option } = Select;
// import { EntityView, } from '@/pages/entity/index'
import EntityViewPanel from '@/pages/entity/index'
import { useModals } from "@/hooks/useModal";
import StudyPage from '@/pages/mining/components/study/study-page'

const Association: FC<any> = ({ }) => {

    const [fromLabel, setFromLabel] = useState<string>("study");
    const [toLabel, setToLabel] = useState<string>("disease");
    const form = Form.useFormInstance();

    const [fromOptions, setFromOptions] = useState<any[]>([]);
    const [toOptions, setToOptions] = useState<any[]>([]);
    const { modals, openModals, closeModals } = useModals(["entityDrawer","studyDrawer"]);
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
    // subject、object、observed_in、evidenced_in、participates_in_pathway、produces_metabolite、regulates_gene
    return <>
        <Form.Item label="Study" name={"study_id"}>
            <Input
                placeholder="which study or reference provides evidence"
                style={{ cursor: "pointer" }}
                onClick={() => openModals("studyDrawer", { name: "study_id" })}
            />
        </Form.Item>
        <Form.Item label="Subject" name={"subject_id"} >
            <Input placeholder="who does something" style={{ cursor: "pointer" }}
                onClick={() => openModals("entityDrawer", { name: "subject_id" })}></Input>
        </Form.Item>
        <Form.Item label="Object" name={"object_id"}>
            <Input placeholder="who receives the effect" style={{ cursor: "pointer" }}
                onClick={() => openModals("entityDrawer", { name: "object_id" })}></Input>
        </Form.Item>
        <Form.Item label="Predicate" name={"predicate"} >
            <Select
                allowClear
                options={[
                    {
                        value: "CORRELATED_WITH",
                        label: "CORRELATED_WITH"
                    }, {
                        value: "PRODUCES",
                        label: "PRODUCES"
                    }, {
                        value: "MODULATES",
                        label: "MODULATES"
                    }, {
                        value: "ACTIVATES",
                        label: "ACTIVATES"
                    }, {
                        value: "INHIBITS",
                        label: "INHIBITS"
                    }
                ]}
            />
        </Form.Item>

        <Form.Item label="effect" name={"effect"} >
            <Select
                allowClear
                options={[
                    {
                        value: "Up",
                        label: "Up"
                    }, {
                        value: "Down",
                        label: "Down"
                    }
                ]}
            />
        </Form.Item>

        <Form.Item label="Observed" name={"observed_id"}>
            <Input
                placeholder="where the phenomenon is observed (e.g., patient group, tissue, condition)"
                style={{ cursor: "pointer" }}
                onClick={() => openModals("entityDrawer", { name: "observed_id" })}
            />
        </Form.Item>


        {/* 
        <Form.Item label="Participates in pathway" name={"participates_in_pathway"}>
            <Input
                placeholder="which biological pathway the entity is involved in (e.g., TLR signaling, lipid metabolism)"
                style={{ cursor: "pointer" }}
                onClick={() => openModals("entityDrawer", { name: "participates_in_pathway" })}
            />
        </Form.Item>

        <Form.Item label="Produces metabolite" name={"produces_metabolite"}>
            <Input
                placeholder="which metabolite is generated (e.g., SCFAs, ceramide, lactate)"
                style={{ cursor: "pointer" }}
                onClick={() => openModals("entityDrawer", { name: "produces_metabolite" })}
            />
        </Form.Item>

        <Form.Item label="Regulates gene" name={"regulates_gene"}>
            <Input
                placeholder="which gene expression is affected (e.g., upregulation of TNF-α, downregulation of PPARγ)"
                style={{ cursor: "pointer" }}
                onClick={() => openModals("entityDrawer", { name: "regulates_gene" })}
            />
        </Form.Item> */}
        {/* <Button onClick={() => openModals("entityDrawer")}>aa</Button>
        {JSON.stringify(record)} */}
        {/* <Form.Item name="from_entity" label="选择 From 实体" rules={[{ required: true }]}>
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
        </Form.Item> */}

        {/* 关系类型 */}
        {/* <Form.Item
            name="relation_type"
            label="关系类型"
            rules={[{ required: true, message: "请输入关系类型" }]}
        >
            <Select options={[
                { value: "ASSOCIATED_WITH", label: "ASSOCIATED_WITH" }
            ]}></Select>
        </Form.Item> */}
        <EntityDrawer
            form={form}
            setRecord={setRecord}
            visible={modals.entityDrawer.visible}
            params={modals.entityDrawer.params}
            onClose={() => closeModals("entityDrawer")}
        ></EntityDrawer>
        <StudyDrawer
            form={form}
            setRecord={setRecord}
            visible={modals.studyDrawer.visible}
            params={modals.studyDrawer.params}
            onClose={() => closeModals("studyDrawer")}
        ></StudyDrawer>
    </>
}

export default Association


const StudyDrawer: FC<any> = ({ visible, setRecord, form, params, onClose, callback }) => {

    return <>
        <Drawer open={visible} onClose={onClose} width={"80%"}>
            {visible &&
                <StudyPage rowSelection={{
                    onChange: (selectedRowKeys: any, selectedRows: any) => {
                        // console.log(form,selectedRows, params.name)
                        form.setFieldValue(params.name, selectedRows[0].entity_id)
                        // setRecord({...selectedRows[0],fieldName:})
                        onClose()
                    }, type: "radio"

                }}></StudyPage>
            }


        </Drawer>
    </>
}
const EntityDrawer: FC<any> = ({ visible, setRecord, form, params, onClose, callback }) => {

    return <>
        <Drawer open={visible} onClose={onClose} width={"80%"}>
            {visible &&
                <EntityViewPanel disableWidth={true} rowSelection={{
                    onChange: (selectedRowKeys: any, selectedRows: any) => {
                        // console.log(form,selectedRows, params.name)
                        form.setFieldValue(params.name, selectedRows[0].entity_id)
                        // setRecord({...selectedRows[0],fieldName:})
                        onClose()
                    }, type: "radio"

                }}></EntityViewPanel>
            }


        </Drawer>
    </>

}


