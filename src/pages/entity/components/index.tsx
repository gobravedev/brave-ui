import { FC, useEffect, useState } from "react"
import Taxonomy from './taxonomy'
import Association from '../../entity-relation/association/association'
import MentalDisorders from './mentalDisorders'
import { Collapse, Form, Input, Modal, Select, Switch, Typography } from "antd"
import { useOutletContext } from "react-router"
import FormModal from './form-modal'
import axios from "axios"
import { itemsEqual } from "@dnd-kit/sortable/dist/utilities"
const componentMap: any = {
    // "taxonomy": Taxonomy,
    // "association": Association,
    "mesh": MentalDisorders
}
const ComponentsRender: FC<any> = ({ type, record }) => {
    const Component = componentMap[type] || (() => <div>no {type} component!</div>);
    return <Component record={record}></Component>
}


export const EntityModal: FC<any> = ({ ...rest }) => {
    const { params, record } = rest
    const [category, setCategory] = useState<any>([])
    useEffect(() => {
        setCategory([])
        if (params?.category && Array.isArray(params?.category)) {
            const category = params?.category.map((item: any) => ({
                label: item,
                value: item
            }))
            setCategory(category)
        }
    }, [params])
    return <>

        <FormModal {...rest}>
            {/* {JSON.stringify(params)} */}
            {!params?.entityId && <Form.Item label="category" name={"category"} rules={[{ required: true, message: '该字段不能为空!' }]}>

                <Select options={category}></Select>
            </Form.Item>}

            <Form.Item label="is_research" name={"is_research"}>
                <Switch></Switch>
            </Form.Item>
            <Form.Item label="entity_name" name={"entity_name"} rules={[{ required: true, message: '该字段不能为空!' }]}>
                <Input></Input>
            </Form.Item>
            {/* {params?.entityType} */}
            <ComponentsRender type={params?.entityType} record={record}></ComponentsRender>
        </FormModal>
    </>
}

export const AssociationModal: FC<any> = ({ ...rest }) => {
    return <>
        <FormModal {...rest} entityType="association">
            <Association></Association>
        </FormModal>
    </>
}
// export default EntityModal