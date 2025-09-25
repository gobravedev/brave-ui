import { Form, Input, Select, Switch } from "antd";
import { FC } from "react";

const MentalDisorders: FC<any> = () => {
    return <>

        <Form.Item label="entity_name_zh" name={"entity_name_zh"}>
            <Input></Input>
        </Form.Item>
        <Form.Item label="entity_type" name={"entity_type"} rules={[{ required: true, message: '该字段不能为空!' }]}>
            <Select
                allowClear
                options={[
                    {
                        value: "Microbe",
                        label: "Microbe"
                    }, {
                        value: "Disease",
                        label: "Disease"
                    }, {
                        value: "Pathway",
                        label: "Pathway"
                    }, {
                        value: "Pathway",
                        label: "Pathway"
                    }, {
                        value: "Compound",
                        label: "compound"
                    }, {
                        value: "evidence",
                        label: "Evidence"
                    }
                ]}
            />
        </Form.Item>
        <Form.Item name={"tags"} label="tags">
            <Select
                mode="tags"
                style={{ width: '100%' }}
            />
        </Form.Item>
        <Form.Item name={"short_name"} label="short_name">
            <Select
                mode="tags"
                style={{ width: '100%' }}
            />
        </Form.Item>
    </>
}

export default MentalDisorders