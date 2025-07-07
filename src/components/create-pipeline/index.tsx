import { Button, Card, Collapse, Divider, Flex, Form, Input, Modal, Popconfirm, Select, Space, Typography } from "antd"
import TextArea from "antd/es/input/TextArea"
import axios from "axios"
import { FC, use, useEffect, useState } from "react"
import { listPipelineComponents as listPipelineComponentsApi } from '@/api/pipeline'
import { useModal } from "@/hooks/useModal"
import { data } from "react-router"
import { useForm } from "antd/es/form/Form"
export const CreateORUpdatePipelineCompnentRelation: FC<any> = ({ visible, onClose, params, callback }) => {
    if (!visible) return null;

    const { data, pipelineStructure, namespace } = params
    const [form] = Form.useForm()
    const [pipeline, setPipeline] = useState<any>()
    const [pipelineRelation, setPipelineRelation] = useState<any>()
    const [components, setComponents] = useState<any>([])
    const [loading, setLoaidng] = useState<any>(false)
    const componentMap: any = {
        // wrap_pipeline: WrapPipeline,
        // pipeline: WrapPipeline,
        pipeline_software: TextAreaContent,
        software_input_file: TextAreaContent,
        software_output_file: TextAreaContent,
        file_script: TextAreaContent
    }
    const ComponentsRender = ({ relation_type, data, form }: any) => {
        const Component = componentMap[relation_type] || (() => <div>未知类型 {JSON.stringify(data)}</div>);
        return <Component data={data} form={form}></Component>
    }
    const listPipelineComponents = async (componentType: any) => {
        const resp = await listPipelineComponentsApi({
            component_type: componentType,
            namespace: namespace
        })
        const data = resp.data.map((item: any) => {
            const content = JSON.parse(item.content)
            if (pipelineStructure.relation_type == "pipeline_software") {
                return {
                    label: `${content.name}`,
                    value: item.component_id
                }
            } else if (pipelineStructure.relation_type == "file_script") {
                return {
                    label: `${content.name}(${content.moduleName})`,
                    value: item.component_id
                }
            } else {
                return {
                    label: `${content.label}(${content.name})`,
                    value: item.component_id
                }
            }

        })
        setComponents(data)
        console.log(resp)
    }
    const getPipeleineRelation = async (relationId: any) => {
        const resp = await axios.post(`/find-pipeline-relation/${relationId}`)

        const data = resp.data
        setPipelineRelation(data)
        form.setFieldsValue(data)
    }
    // const getPipeleine = async (componentId: any) => {
    //     const resp = await axios.post("/find-pipeline", { component_id: componentId })

    //     const data = resp.data
    //     data['content'] = JSON.parse(data['content']) //JSON.stringify(JSON.parse(data['content']), null, 2)
    //     setPipeline(data)
    //     // form.setFieldsValue(data)
    // }

    useEffect(() => {

        if (visible) {
            if (pipelineStructure.relation_type == "pipeline_software") {
                listPipelineComponents("software")
            } else if (pipelineStructure.relation_type == "software_input_file" || pipelineStructure.relation_type == "software_output_file") {
                listPipelineComponents("file")
            } else if (pipelineStructure.relation_type == "file_script") {
                listPipelineComponents("script")
            }
            if (data) {
                getPipeleineRelation(data.relation_id)

                // 
            } else {
                form.resetFields()
            }
        }

    }, [visible])
    const getParams = (values: any) => {
        const params = {
            ...values,
            ...pipelineStructure,

        }
        if (data) {
            params['relation_id'] = pipelineRelation.relation_id
            params['parent_component_id'] = pipelineRelation.parent_component_id
        }
        // if (data) {
        //     params['parent_component_id'] =data.componemt_id
        //     params['pipeline_id'] =data.pipeline_id
        // }

        return params
    }
    const savePipeline = async () => {
        setLoaidng(true)
        const values = await form.validateFields()
        const params = getParams(values)
        if (typeof params['content'] != 'string') {
            params['content'] = JSON.stringify(params['content'])
        }

        console.log(params)
        const resp = await axios.post("/save-pipeline-relation", params)
        console.log(resp)
        setLoaidng(false)
        if (callback) {
            callback()
        }
        onClose()
    }
    return <>
        <Modal
            loading={loading}
            title={`${data ? "更新" : "新增"}流程(${pipelineStructure?.relation_type})`}
            okText={data ? "更新" : "新增"}
            onOk={savePipeline}
            open={visible}
            footer={(_, { OkBtn, CancelBtn }) => (
                <>
                    {/* <Button>编辑组件</Button> */}
                    <CancelBtn />
                    <OkBtn />
                </>
            )}
            onClose={() => onClose()}
            onCancel={() => onClose()}>
            <Form form={form}>


                <Form.Item name={"component_id"} label="组件">
                    <Select options={components}></Select>
                </Form.Item>

                {pipelineRelation && <>
                    {/* {JSON.stringify(pipelineRelation)}
                    <hr /> */}
                    {/*  */}
                </>}
                {/* <ComponentsRender {...pipelineStructure} data={pipeline} form={form}></ComponentsRender> */}
                <Collapse ghost items={[
                    {
                        key: "1",
                        label: "更多",
                        children: <>
                            <Form.Item noStyle shouldUpdate>
                                {() => (
                                    <Typography>
                                        <pre>{JSON.stringify(getParams(form.getFieldsValue()), null, 2)}</pre>
                                    </Typography>
                                )}
                            </Form.Item>
                        </>
                    }
                ]} />

            </Form>

        </Modal>
    </>
}

export const CreateOrUpdatePipelineComponent: FC<any> = ({ visible, onClose, params, callback }) => {
    if (!visible) return null;

    const { data, structure } = params
    const [form] = Form.useForm()
    const [component, setComponent] = useState<any>()

    const [loading, setLoaidng] = useState<any>(false)
    const componentMap: any = {
        pipeline: WrapPipeline,
        // pipeline: WrapPipeline,
        software: TextAreaContent,
        file: TextAreaContent,
        script: TextAreaContent,
    }
    const ComponentsRender = ({ component_type, data, form }: any) => {
        const Component = componentMap[component_type] || (() => <div>未知类型 {JSON.stringify(data)}</div>);
        return <Component data={data} form={form}></Component>
    }


    const getPipeleine = async (componentId: any) => {
        const resp = await axios.post("/find-pipeline", { component_id: componentId })

        const data = resp.data
        data['content'] = JSON.parse(data['content']) //JSON.stringify(JSON.parse(data['content']), null, 2)
        setComponent(data)
        form.setFieldsValue(data)
    }

    useEffect(() => {

        if (visible) {
            if (data) {
                getPipeleine(data.component_id)
            } else {
                form.resetFields()
            }
        }

    }, [visible])
    const getParams = (values: any) => {
        const params = {
            ...values,
            ...structure,

        }
        if (data) {
            // params['relation_id'] = pipelineRelation.relation_id
            // params['parent_component_id'] = pipelineRelation.parent_component_id
            params['component_id'] = component.component_id


        }


        return params
    }
    const savePipeline = async () => {
        setLoaidng(true)
        const values = await form.validateFields()
        const params = getParams(values)
        if (typeof params['content'] != 'string') {
            params['content'] = JSON.stringify(params['content'])
        }

        console.log(params)
        const resp = await axios.post("/save-pipeline", params)
        console.log(resp)
        setLoaidng(false)
        if (callback) {
            callback()
            // await axios.get("/get-pipeline-v2/d9830ebd-240e-4758-adab-dd3a9d17e414")
        }
        onClose()
    }
    return <>
        <Modal
            loading={loading}
            title={`${data ? "更新" : "新增"}流程(${structure?.component_type})`}
            okText={data ? "更新" : "新增"}
            onOk={savePipeline}
            open={visible}
            onClose={() => onClose()}
            onCancel={() => onClose()}>
            <Form form={form}>
                <ComponentsRender {...structure} data={component} form={form}></ComponentsRender>
                <Collapse ghost items={[
                    {
                        key: "1",
                        label: "更多",
                        children: <>
                            <Form.Item noStyle shouldUpdate>
                                {() => (
                                    <Typography>
                                        <pre>{JSON.stringify(getParams(form.getFieldsValue()), null, 2)}</pre>
                                    </Typography>
                                )}
                            </Form.Item>
                        </>
                    }
                ]} />

            </Form>

        </Modal>
    </>
}
export default CreateORUpdatePipelineCompnentRelation
const TextAreaContent: FC<any> = ({ data, form }) => {
    return <>
        <Form.Item name={"content"} label="content">
            <TextAreaComp></TextAreaComp>
        </Form.Item>
        {/* <Form.Item name={"component_id"} label="component_id">
            <Input></Input>
        </Form.Item> */}
    </>
}
const TextAreaComp: FC<any> = ({ value, onChange }) => {
    const [data, setData] = useState<any>(JSON.stringify(value))
    // useEffect(()=>{
    //     setData(JSON.stringify(value))
    // },[value])
    return <>
        <TextArea rows={10} value={data} onChange={(e: any) => {
            setData(e.target.value)
            onChange(e.target.value)
            // console.log(e.target.value)
        }}></TextArea>
        <Button onClick={() => {
            setData(JSON.stringify(value, null, 2))
        }}>格式化</Button>
    </>
}

const WrapPipeline: FC<any> = ({ data, form }) => {
    // "content": {
    //     "name": "test",
    //     "analysisPipline": "reads-alignment-based-abundance-analysis",
    //     "parseAnalysisModule": "reads-alignment-based-abundance-analysis",
    //     "parseAnalysisResultModule": [
    //       {
    //         "module": "bowtie2_align",
    //         "dir": "bowtie2_align_metaphlan",
    //         "analysisMethod": "bowtie2_align_metaphlan"
    //       }
    //     ],
    //     "description": "使用reads基于marker gene的丰度分析",
    //     "tags": [
    //       "metaphlan",
    //       "bowtie2",
    //       "Alignment-based strategies"
    //     ],
    //     "img": "pipeline.jpg",
    //     "category": "metagenomics",
    //     "order": 1
    //   }
    return <>
        {/* <Form.Item name={"pipeline_key"} label="pipeline_key">
            <Input disabled={data ? true : false}></Input>
        </Form.Item> */}
        <Form.Item name={"namespace"} label="namespace">
            <NamespaceSelect

            />
        </Form.Item>
        <Form.Item name={["content", "name"]} label="name">
            <Input></Input>
        </Form.Item>
        {/* <Form.Item name={["content", "analysisPipline"]} label="analysisPipline">
            <Input></Input>
        </Form.Item> */}
        {/* <Form.Item name={["content", "parseAnalysisModule"]} label="parseAnalysisModule">
            <Input></Input>
        </Form.Item> */}
        <Form.Item name={["content", "img"]} label="img">
            <Input></Input>
        </Form.Item>
        <Form.Item name={["content", "category"]} label="category">
            <Input></Input>
        </Form.Item>
        <Form.Item name={["content", "tags"]} label="tags">
            <Select
                mode="tags"
                style={{ width: '100%' }}
            />
        </Form.Item>
        <Form.Item name={["content", "description"]} label="description">
            <TextArea></TextArea>
        </Form.Item>
        {/* <Typography>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </Typography> */}
        {/* <Form.Item name={"content"} label="content">
            <TextArea rows={10}></TextArea>
        </Form.Item> */}
        {/* <Form.Item name={"content"} label="content">
            <TextArea rows={10}></TextArea>
        </Form.Item> */}
        {/* {JSON.stringify(data)} */}
    </>
}

const NamespaceSelect: FC<any> = ({ value, onChange }) => {
    const [namespace, setNamespace] = useState<any>([])
    // const { modal, openModal, closeModal } = useModal();
    const loadNamespace = async () => {
        const resp = await axios.get(`/list-context-by-type/namespace`)
        const data = resp.data
        setNamespace(data)
    }
    useEffect(() => {
        loadNamespace()
    }, [])
    return <>
        <Flex justify="space-between">
            <Select value={value} onChange={onChange} options={namespace.map((item: any) => ({ label: item.name, value: item.context_id }))}>
            </Select>
            {/* {modal.key == "namespaceOperation" && modal.visible ?
                <Button onClick={() => {
                    closeModal()
                }}>取消</Button>
                : <Button onClick={() => {
                    openModal("namespaceOperation", namespace)
                }}>新增</Button>} */}
        </Flex>
        {/* <NamespaceOperation style={{ marginTop: "0.5rem" }}
            visible={modal.key == "namespaceOperation" && modal.visible}
            callback={loadNamespace}
            onClose={closeModal}
            params={namespace} ></NamespaceOperation> */}
    </>
}

const NamespaceOperation: FC<any> = ({ visible, onClose, params, callback }) => {
    if (!visible) return null;
    const [namespace, setNamespace] = useState<any>()
    const [record, setRecord] = useState<any>()
    // const [form] = useForm()
    const saveNamespace = async () => {
        // const values = await form.validateFields()
        if (record) {
            await axios.post("/save-or-update-context", {
                name: namespace,
                type: "namespace",
                context_id: record.context_id
            })
        } else {
            await axios.post("/save-or-update-context", {
                name: namespace,
                type: "namespace"
            })
        }
        if (callback) {
            callback()
        }
        // onClose()
    }
    const deleteNamespace = async (context_id: any) => {
        await axios.delete(`/delete-namespace-by-context-id/${context_id}`)
        if (callback) {
            callback()
        }
    }


    return <Card title="新增namespace">
        {/* {JSON.stringify(params)} */}

      
    </Card>
}