import { Form, Input } from "antd";
import { FC } from "react";

const Taxonomy: FC<any> = () => {
    return <>
        <Form.Item name={"entity_name"} label="实体名称">
            <Input></Input>
        </Form.Item>
    </>
}

export default Taxonomy