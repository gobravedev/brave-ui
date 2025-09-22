import { Button, Card, Checkbox, Col, Flex, Form, Input, Row, Space, Tag, Tooltip } from "antd"
import { FC, useEffect, useState } from "react"
import AIChat from '@/components/chat'
// const  AIChat  = lazy(() => import('@/components/chat'));
import { ClearOutlined, CloseOutlined, RedoOutlined, SearchOutlined, UndoOutlined } from '@ant-design/icons'
import axios from "axios"
import { fa } from "@faker-js/faker"

const DataFiletr: FC<any> = ({ close, height, graphOpt, queryParams, ...rest }) => {
    const [form] = Form.useForm()
    const [nodes, setNodes] = useState<any>([])
    useEffect(() => {
        if (queryParams?.nodes && Array.isArray(queryParams?.nodes)) {
            setNodes(queryParams?.nodes.map((item: any) => ({
                value: item,
                name: item
            })))
        }
    }, [queryParams?.nodes])

    useEffect(() => {
        form.setFieldsValue(queryParams?.nodes_dict)
    },[])
    const onFormChange = () => {
        const values = form.getFieldsValue();
        console.log(values)
        graphOpt.updateQueryParam("nodes_dict", values)

        // // values.map(it=>{})
        // setSearchParams(values)
        // const filters = Object.entries({ ...values }).reduce((acc: any[], [key, value]) => {
        //   if (value !== null && value !== undefined && value !== '') {
        //     if (!Array.isArray(value)) {
        //       acc.push({ 'name': key, 'values': value });
        //     } else if (Array.isArray(value) && value.length > 0) {
        //       // let searchVal = Array.isArray(value) ? value.join(',') : value;
        //       acc.push({ 'name': key, 'values': value });
        //     }

        //   }
        //   return acc;
        // }, []);
        // setDisplayFilter(filters)
    }
    return <Card
        title={<>
            {`${rest?.label}`}
        </>}
        styles={{
            body: {
                padding: 0,
                height: "100%",
                overflowY: "auto"
            }
        }}
        size="small"
        extra={<Flex gap="small">
            <Tag style={{cursor:"pointer"}} onClick={()=>{
                if(queryParams?.nodes_dict_condition=="OR"){
                    graphOpt.updateQueryParam("nodes_dict_condition", "AND")
                }else{
                    graphOpt.updateQueryParam("nodes_dict_condition", "OR")
                }
            }}>{queryParams?.nodes_dict_condition}</Tag>
            <CloseOutlined onClick={close} />
        </Flex>}
        style={{
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            padding: "0.5rem",
            overflow: "hidden",
            height: height,
        }}
    >
        {/* {JSON.stringify(nodes)} */}
        <div style={{ marginTop: "1rem" }}></div>

        <Form.Provider onFormChange={onFormChange}>
            <Form form={form} >
                {nodes.map((item: any, index: any) => (<Form.Item key={index} name={item.value} label={item.name} noStyle>
                    <ChekboxComponents title={item.name} label={item.value} />
                </Form.Item>))}
                {/* <Form.Item name='diseaseNumber' label='疾病列表' noStyle>
                    <ChekboxComponents title={"疾病列表"} data={diseaseList} loading={false} reload={()=>{}} />
                </Form.Item>
                <Form.Item name='projectNumber' label='项目列表' noStyle>
                    <ChekboxComponents title={"项目列表"} data={projectList} loading={false} reload={()=>{}} />
                </Form.Item> */}

                {/* <Form.Item name='disease' label='disease' noStyle>
                    <ChekboxComponents title={"disease"} label={"disease"} />
                </Form.Item>
                <Form.Item name='diet_and_food' label='diet_and_food' noStyle>
                    <ChekboxComponents title={"diet_and_food"} label={"diet_and_food"} />
                </Form.Item>
                <Form.Item name='study' label='study' noStyle>
                    <ChekboxComponents title={"study"} label={"study"} />
                </Form.Item> */}
                {/* <Form.Item shouldUpdate>
                {() => (
                  <Typography>
                    <pre>{JSON.stringify(form.getFieldsValue(), null, 2)}</pre>
                  </Typography>
                )}
              </Form.Item> */}
            </Form>
        </Form.Provider>

    </Card>
}

export default DataFiletr



const ChekboxComponents: FC<any> = ({ title, label, value, onChange }) => {
    const [visible, setVisible] = useState<boolean>(false)
    const [search, setSearch] = useState<any>("")
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<any>([])
    // const [keyword,setKeyword] = useState<any>()
    const loadData = async () => {
        setLoading(true)
        const resp = await axios.post(`/entity/query-nodes`, {
            label: label,
            keyword:search
        })
        // console.log(resp)
        setData(resp.data)
        setLoading(false)
    }
    useEffect(() => {
        loadData()
    }, [search])
    return <>

        <Card size="small" loading={loading} title={title} style={{ marginBottom: "1rem" }} extra={<Space>
            <Tooltip title={"Search"}>
                <SearchOutlined style={{ cursor: "pointer" }} onClick={() => { setVisible(!visible); if (visible) setSearch("") }} />
            </Tooltip>
            <Tooltip title={"Clear Selection"}>
                <ClearOutlined style={{ cursor: "pointer" }} onClick={() => { onChange(undefined) }} />
            </Tooltip>
            <Tooltip title={"Refresh"}>
                <UndoOutlined style={{ cursor: "pointer" }} onClick={loadData} />
            </Tooltip>
        </Space>} >
            {visible && <Input.Search allowClear onSearch={(val)=>setSearch(val)} style={{ marginBottom: "0.5rem" }}>
            </Input.Search>}
            {/* {search} */}

            <div style={{ overflowY: 'auto', maxHeight: "240px" }}>
                <Checkbox.Group style={{ width: '100%' }} value={value} onChange={onChange}>
                    <Row>
                        {data && data.length > 0 && data.filter((it: any) => search ? it.entity_name.includes(search) : true).map((item: any, index: any) => {
                            return <Col span={24} key={index} style={{ marginTop: '0.3em' }}>
                                <Checkbox value={item.entity_id}>{item.entity_name}</Checkbox>
                            </Col>
                        })}
                    </Row>
                </Checkbox.Group>
            </div>
        </Card>

    </>
}
