import { Button, Card, Collapse, Divider, Drawer, Flex, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Tabs, Typography, Upload, UploadFile, UploadProps } from "antd"
import TextArea from "antd/es/input/TextArea"
import axios from "axios"
import { FC, use, useEffect, useRef, useState } from "react"
import { listPipelineComponents as listPipelineComponentsApi } from '@/api/pipeline'
import { useModal } from "@/hooks/useModal"
import { data } from "react-router"
import { useForm } from "antd/es/form/Form"
import { MonacoEditor } from "../react-monaco-editor"
import { es, tr } from "@faker-js/faker"
import { PlusOutlined } from '@ant-design/icons'


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
        pipeline_software: DefaultComponentRelation,
        software_input_file: DefaultComponentRelation,
        software_output_file: DefaultComponentRelation,
        file_script: DefaultComponentRelation,
        parent_file_script: AddFileComponentRelation
    }
    const ComponentsRender = ({ relation_type, data, form }: any) => {
        const Component = componentMap[relation_type] || (() => <div>未知类型 {JSON.stringify(data)}</div>);
        return <Component data={data} form={form} components={components}></Component>
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
                    label: `${item.component_name}(${item.component_id})`,
                    value: item.component_id
                }
            } else if (pipelineStructure.relation_type == "file_script") {
                return {
                    label: `${item.component_name}(${item.component_id})`,
                    value: item.component_id
                }
            } else {
                return {
                    label: `${item.component_name}(${item.component_id})`,
                    value: item.component_id
                }
            }

        })
        console.log(data)
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
            } else if (pipelineStructure.relation_type == "software_input_file"
                || pipelineStructure.relation_type == "parent_file_script"
                || pipelineStructure.relation_type == "software_output_file") {
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
        if (params.relation_type == "parent_file_script") {
            params.relation_type = "file_script"
        }
        if (data) {
            params['relation_id'] = pipelineRelation.relation_id
            // params['parent_component_id'] = pipelineRelation.parent_component_id
        }
        // if (pipelineStructure.relation_type == "pipeline_software") {
        //     params['component_id'] = values.to_component_id
        // }else{

        // }
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
        try {
            const resp = await axios.post("/save-pipeline-relation", params)
            console.log(resp)
            setLoaidng(false)
            onClose()
            if (callback) {
                callback()
            }
        } catch (error) {
            setLoaidng(false)
        }


    }
    return <>
        <Modal
            loading={loading}
            title={`${data ? "Update" : "Add"} (${pipelineStructure?.relation_type})`}
            okText={data ? "Update" : "Add"}
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

                {/* 
                <Form.Item name={"component_id"} label="组件">
                    <Select showSearch options={components}></Select>
                </Form.Item> */}

                {pipelineRelation && <>
                    {/* {JSON.stringify(pipelineRelation)}
                    <hr /> */}
                    {/*  */}
                </>}
                <ComponentsRender {...pipelineStructure} data={pipeline} form={form}></ComponentsRender>
                <Collapse ghost items={[
                    {
                        key: "1",
                        label: "More",
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


const PipelineSoftwareComponent: FC<any> = ({ components }) => {
    return <>
        <Form.Item name={"parent_component_id"} label="form_component">
            <Select showSearch options={components}></Select>
        </Form.Item>
        <Form.Item name={"component_id"} label="to_component_id">
            <Select showSearch options={components}></Select>
        </Form.Item>
    </>
}

export const CreateOrUpdatePipelineComponent: FC<any> = ({ visible, onClose, params, callback }) => {
    if (!visible) return null;

    const { data, structure } = params
    const [form] = Form.useForm()
    const [component, setComponent] = useState<any>()
    const { namespace } = useSelector((state: any) => state.user);

    const [loading, setLoaidng] = useState<any>(false)
    const componentMap: any = {
        pipeline: WrapPipeline,
        // pipeline: WrapPipeline,
        software: SoftwareContent,
        file: FileContent,
        script: ScriptContent,
    }
    const ComponentsRender = ({ component_type, data, form }: any) => {
        const Component = componentMap[component_type] || (() => <div>未知类型 {JSON.stringify(data)}</div>);
        return <Component data={data} form={form} structure={structure}></Component>
    }


    const getPipeleine = async (componentId: any) => {
        const resp = await axios.post("/find-pipeline", { component_id: componentId })

        const data = resp.data
        // data['content'] = JSON.parse(data['content']) //JSON.stringify(JSON.parse(data['content']), null, 2)
        if (data['tags']) {
            data['tags'] = JSON.parse(data['tags'])
        }
        if(data["component_ids"]){
            data["component_ids"] = JSON.parse(data["component_ids"])
        }
        setComponent(data)
        console.log(data)
        if (structure.component_type == "pipeline") {
            data['content'] = JSON.parse(data['content'])
            form.setFieldsValue(data)
        } else {
            form.setFieldsValue(data)
        }

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
    const getParamsFormat = (values: any) => {
        const params = getParams(values)
        if (typeof params['content'] == 'string') {
            params['content'] = JSON.parse(params['content'])
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
        if (typeof params['tags'] != 'string') {
            params['tags'] = JSON.stringify(params['tags'])
        }
        if (!params['content']) {
            params['content'] = "{}"
        }
        if(params["component_ids"]){
            params["component_ids"] = JSON.stringify(params["component_ids"])
        }

        console.log(params)
        try {
            const resp = await axios.post("/save-pipeline", params)
            console.log(resp)
            setLoaidng(false)
            if (callback) {
                callback()
                // await axios.get("/get-pipeline-v2/d9830ebd-240e-4758-adab-dd3a9d17e414")
            }
            onClose()
        } catch (error) {
            setLoaidng(false)
        }

    }

    useEffect(() => {
        form.setFieldValue("namespace", namespace)
    }, [namespace])
    const normFile = (e: any) => {
        console.log(e)
        if (Array.isArray(e)) {
            return e;
        }
        return [{
            uid: '-4',
            name: 'image.png',
            status: 'done',
            url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        }];
    };
    return <>
        <Drawer
            loading={loading}
            title={`${data ? "Update" : "Create"} Component(${structure?.component_type})`}
            // okText={data ? "Update" : "Create"}
            // onCancel={() => onClose()}
            // onOk={savePipeline}
            forceRender={true}

            open={visible}
            width={"80%"}
            extra={<>
                <Button size="small" color="cyan" variant="solid" onClick={savePipeline}>
                    {data ? "Update" : "Create"}
                </Button>
            </>}
            onClose={() => onClose()}
        // onCancel={() => onClose()}
        >
            {/* {namespace} */}
            <Form form={form}>
                <Tabs items={[
                    {
                        label: "Component Info",
                        key: "1",
                        children: <>
                            {/* <Form.Item name={"namespace"} label="Namespace"   >
                                <Input disabled></Input>
                            </Form.Item> */}

                            <Form.Item name={"component_name"} label="Component Name" rules={[{ required: true, message: 'Please input component name!' }]}>
                                <Input ></Input>
                            </Form.Item>



                            <ComponentsRender {...structure} data={component} form={form}></ComponentsRender>
                        </>
                    }, {
                        label: "Component Description",
                        key: "2",
                        children: <>
                            <Form.Item name={"tags"} label="Tags">
                                <Select
                                    mode="tags"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                            <Form.Item name={"category"} label="Category">
                                <Input ></Input>
                            </Form.Item>
                            {/* valuePropName="fileList"  getValueFromEvent={normFile}*/}
                            {data?.component_id && <Form.Item label="Upload" name={"img"}  >
                                <UploadComp component_id={data?.component_id}></UploadComp>
                            </Form.Item>}
                            <Form.Item label="Order" name={"order_index"} initialValue={0}>
                                <InputNumber ></InputNumber >
                            </Form.Item>

                            <Form.Item name={"description"} label="Description">
                                <TextAreaComp templete={""}></TextAreaComp>

                            </Form.Item>
                        </>
                    }
                ]}>
                </Tabs>

                <Collapse ghost items={[
                    {
                        key: "1",
                        label: "More",
                        children: <>
                            <Form.Item noStyle shouldUpdate>
                                {() => (
                                    <Typography>
                                        <pre>{JSON.stringify(getParamsFormat(form.getFieldsValue()), null, 2)}</pre>
                                    </Typography>
                                )}
                            </Form.Item>
                        </>
                    }
                ]} />

            </Form>

        </Drawer>
    </>
}
export default CreateORUpdatePipelineCompnentRelation


const UploadComp: FC<any> = ({ value, onChange, component_id }) => {
    const [fileList, setFileList] = useState<any>([])
    const { baseURL } = useSelector((state: any) => state.user)

    const handleChange: UploadProps['onChange'] = ({ file, fileList }) => {
        // console.log()
        setFileList([file]);
        if (file.status === 'done') {
            console.log(file)
            onChange(`${file.response.url}`)

        }

        // console.log(fileList)
    }

    useEffect(() => {
        if (value) {
            setFileList([{
                uid: '-1',
                name: 'image.png',
                status: 'done',
                url: `${baseURL}${value}`
            }])
        }

    }, [value])
    return <>
        {/* {value} */}
        <Upload
            onChange={handleChange}
            fileList={fileList}
            action={`${baseURL}/brave-api/component/upload/${component_id}`} listType="picture-card"  >
            <button
                style={{ color: 'inherit', cursor: 'inherit', border: 0, background: 'none' }}
                type="button"
            >
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
            </button>
        </Upload>
    </>
}

const AddFileComponentRelation: FC<any> = ({ data, form, components }) => {
    return <>

        <Form.Item name={"parent_component_id"} label="File Component">
            <Select showSearch options={components}></Select>
        </Form.Item>

    </>
}
const DefaultComponentRelation: FC<any> = ({ data, form, components }) => {
    return <>

        <Form.Item name={"component_id"} label="Component">
            <Select showSearch options={components}></Select>
        </Form.Item>

    </>
}
import { softwareTemplete, scriptTemplete, fileTemplete } from './templete'
import ContainerPage from "@/pages/container"
import { useSelector } from "react-redux"
const SoftwareContent: FC<any> = ({ data, form }) => {
    const [templete, setTemplete] = useState<any>()

    useEffect(() => {
        if (!data?.componemt_id) {
            setTemplete(JSON.stringify(softwareTemplete, null, 2))
        }
    }, [])
    return <>
        <Form.Item name={"container_id"} label="Container" rules={[{ required: true, message: 'Please select container!' }]}>
            <SelectContainer container={data?.container}></SelectContainer>
        </Form.Item>
        {/* <Form.Item name={"sub_container_id"} label="Sub Container">
            <SelectContainer container={data?.sub_container}></SelectContainer>
        </Form.Item> */}
        <Form.Item name={"script_type"} label="Script Type" rules={[{ required: true, message: 'Please select script type!' }]}>
            <Select options={
                [{ label: "python", value: "python" },
                { label: "nextflow", value: "nextflow" },
                { label: "shell", value: "shell" },
                { label: "R", value: "r" }]}></Select>
        </Form.Item>
        <Form.Item name={"content"} label="content" rules={[{ required: true, message: 'Please input content!' }]}>
            <TextAreaComp templete={templete}></TextAreaComp>
        </Form.Item>
        {/* <Form.Item name={"component_id"} label="component_id">
            <Input></Input>
        </Form.Item> */}
    </>
}
const ScriptContent: FC<any> = ({ data, form }) => {
    const [templete, setTemplete] = useState<any>()

    useEffect(() => {

        if (!data?.componemt_id) {
            // console.log(scriptTemplete)
            setTemplete(JSON.stringify(scriptTemplete, null, 2))
        }
    }, [])
    return <>
        <Form.Item name={"container_id"} label="Container" rules={[{ required: true, message: 'Please select container!' }]}>
            <SelectContainer container={data?.container}></SelectContainer>
        </Form.Item>
        <Form.Item name={"script_type"} label="Script Type" rules={[{ required: true, message: 'Please select script type!' }]}>
            <Select options={
                [{ label: "python", value: "python" },
                { label: "nextflow", value: "nextflow" },
                { label: "shell", value: "shell" },
                { label: "R", value: "r" }]}></Select>
        </Form.Item>
        <Form.Item name={"content"} label="content" rules={[{ required: true, message: 'Please input content!' }]}>
            <TextAreaComp templete={templete}></TextAreaComp>
        </Form.Item>

        {/* <Form.Item name={"component_id"} label="component_id">
            <Input></Input>
        </Form.Item> */}
    </>
}
const FileContent: FC<any> = ({ data, form, structure }) => {
    const [templete, setTemplete] = useState<any>()
    const [options, setOptions] = useState<any>([])
    const loadData =async  () => {
        const resp = await listPipelineComponentsApi({
            component_type: "file",
        })
        const data = resp.data.map((item: any) => {
            return {
                label: `${item.component_name}(${item.component_id})`,
                value: item.component_id
            }

        })
        setOptions(data)
    }
    useEffect(() => {
        loadData()
        if (!data?.componemt_id) {
            setTemplete(JSON.stringify(fileTemplete, null, 2))
        }
    }, [])
    return <>
        {structure?.files && <Card style={{ maxHeight: "20rem", overflow: "auto", marginBottom: "1rem" }}>
            <Typography>
                <pre>{JSON.stringify(structure?.files, null, 2)}</pre>
            </Typography>
        </Card>}
        {/* <Form.Item name={"container_id"} label="Container">
            <SelectContainer container={data?.container}></SelectContainer>
        </Form.Item> */}
        <Form.Item name={"file_type"} label="File Type" rules={[{ required: true, message: 'Please select file type!' }]}>
            <Select options={
                [{ label: "collected", value: "collected" },
                { label: "individual", value: "individual" }]}></Select>
        </Form.Item>

        <Form.Item name={"component_ids"} label="Component Ids">
            <Select options={options} mode="multiple"></Select>
        </Form.Item>

        <Form.Item name={"content"} label="content" rules={[{ required: true, message: 'Please input content!' }]}>
            <TextAreaComp templete={templete}></TextAreaComp>
        </Form.Item>
        {/* <Form.Item name={"component_id"} label="component_id">
            <Input></Input>
        </Form.Item> */}
    </>
}

const SelectContainer: FC<any> = ({ value, onChange, container: container_ }) => {
    const { modal, openModal, closeModal } = useModal()
    const [container, setContainer] = useState<any>(container_)
    return <>
        <Input value={container?.name} style={{ cursor: "pointer" }} onClick={() => openModal("modalA")}></Input>
        {/* {JSON.stringify(container)}
        {data?.container_image}{data?.container_name} */}
        <Modal footer={false} width={"50%"} title="Select container" open={modal.visible && modal.key == "modalA"} onClose={closeModal} onCancel={closeModal}>
            <ContainerPage rowSelection={{
                type: "radio",
                onChange: (selectedRowKeys: any, selectedRows: any) => {
                    // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                    // setSelectedRowKey(selectedRowKeys)

                    if (selectedRows.length > 0) {
                        setContainer(selectedRows[0])
                        onChange(selectedRows[0].container_id)
                        closeModal()
                    }

                },
            }}></ContainerPage>
        </Modal>
    </>
}
const TextAreaContent: FC<any> = ({ data, form }) => {
    return <>
        <Form.Item name={"content"} label="content">
            <TextAreaComp ></TextAreaComp>
        </Form.Item>
        {/* <Form.Item name={"component_id"} label="component_id">
            <Input></Input>
        </Form.Item> */}
    </>
}
const TextAreaComp: FC<any> = ({ value, onChange, templete }) => {
    // const [data, setData] = useState<any>(JSON.stringify(value))
    const editorRef = useRef<any>(null)
    useEffect(() => {
        if (templete) {
            onChange(templete)
        }
    }, [])
    // useEffect(()=>{
    //     // setData(JSON.stringify(value))
    //     // editorRef.current.getValue()
    //     // onChange(editorRef.current.getValue())
    // },[editorRef.current])
    return <>
        {/* <TextArea rows={10} value={data} onChange={(e: any) => {
            setData(e.target.value)
            onChange(e.target.value)
            // console.log(e.target.value)
        }}></TextArea> */}
        {/* {templete} */}

        <MonacoEditor value={value} onChange={onChange} editorRef={editorRef} defaultLanguage="json" ></MonacoEditor>
        {/* <Button onClick={() => {
            setData(JSON.stringify(value, null, 2))
        }}>格式化</Button> */}
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
        {/* <Form.Item name={"namespace"} label="namespace">
            <NamespaceSelect />
        </Form.Item> */}
        {/* <Form.Item name={["content", "name"]} label="name">
            <Input></Input>
        </Form.Item> */}
        <Form.Item name={"script_type"} label="Script Type">
            <Select options={
                [{ label: "python", value: "python" },
                { label: "nextflow", value: "nextflow" },
                { label: "shell", value: "shell" },
                { label: "R", value: "R" }]}></Select>
        </Form.Item>
        {/* <Form.Item name={["content", "image"]} label="Image">
            <Input></Input>
        </Form.Item> */}
        <Form.Item name={"container_id"} label="Container">
            <SelectContainer container={data?.container}></SelectContainer>
        </Form.Item>
        {/* <Form.Item name={["content", "analysisPipline"]} label="analysisPipline">
            <Input></Input>
        </Form.Item> */}
        {/* <Form.Item name={["content", "parseAnalysisModule"]} label="parseAnalysisModule">
            <Input></Input>
        </Form.Item> */}
        {/* <Form.Item name={["content", "img"]} label="img">
            <Input></Input>
        </Form.Item> */}
        {/* <Form.Item name={["content", "category"]} label="category">
            <Input></Input>
        </Form.Item> */}
        {/* <Form.Item name={["content", "tags"]} label="tags">
            <Select
                mode="tags"
                style={{ width: '100%' }}
            />
        </Form.Item> */}
        {/* <Form.Item name={["content", "description"]} label="description">
            <TextArea></TextArea>
        </Form.Item> */}
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

export const NamespaceSelect: FC<any> = ({ value, onChange, disabled }) => {
    const [namespace, setNamespace] = useState<any>([])
    // const { modal, openModal, closeModal } = useModal();
    const loadNamespace = async () => {
        const resp = await axios.get(`/list-namespace`)
        const data = resp.data
        setNamespace(data)
    }
    useEffect(() => {
        loadNamespace()
    }, [])
    return <>
        <Flex justify="space-between">
            {/* {JSON.stringify(namespace)} */}
            <Select
                placeholder="Please select namespace!"
                style={{ width: "100%" }} disabled={disabled} value={value} onChange={onChange} options={namespace.map((item: any) => ({ label: item.name, value: item.namespace_id }))}>
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