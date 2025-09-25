import { forwardRef, useImperativeHandle, useState } from "react";
import { EntityRef } from './interface'
import { useI18n } from "@/hooks/useI18n";
import { useNavigate, useOutletContext } from "react-router";
import { getColumns } from './columns'
import { Button, Flex, Input, Pagination, Popconfirm, Select, Space, Switch, Table, Tooltip } from "antd";
import axios from "axios";
import { usePagination } from "@/hooks/usePagination";
import { CloseOutlined, PlusCircleOutlined, RedoOutlined } from "@ant-design/icons"
const DataPage = forwardRef<EntityRef, { openModal: any; entityType: any, rowSelection?: any, params?: any, columnType?: any, close?: any }>(({ columnType, rowSelection, openModal, entityType, params, close }, ref) => {
    const [isResearch, setIsResearch] = useState<boolean>(true)
    const { locale } = useI18n()
    const [initPageSize] = useState(30); // 每页显示条数

    const { data, pageNumber, totalPage, loading, reload, pageSize, setPageSize, setPageNumber, search } = usePagination({
        // pag?eApi: pageContainerApi,
        url: `/entity/page/${entityType}`,
        initialPageSize: initPageSize,
        params: {
            ...params,
            is_research: isResearch,
            locale: locale

        }
    })
    useImperativeHandle(ref, () => ({
        reload: reload,
        setPageNumber: setPageNumber
    }));


    const navigate = useNavigate();
    const { messageApi } = useOutletContext<any>()

    const columns: any[] = [
        ...getColumns(columnType || entityType),
        {
            title: '操作',
            key: 'action',
            fixed: "right",
            width: 200,
            render: (_: any, record: any) => (
                <Space size="middle">
                    {openModal && <>
                        <Button size="small" color="cyan" variant="solid" onClick={() => {
                            openModal("entityDetailsModal", { entityType: entityType, entityId: record.entity_id })
                        }}>details</Button>

                        <Button size="small" color="cyan" variant="solid" onClick={() => {
                            console.log("update:", record)
                            openModal("optModal", { entityType: entityType, entityId: record.entity_id })
                        }}>update</Button>


                        {record.is_exist_graph ? <>
                            <Button size="small" color="cyan" variant="solid" onClick={() => {
                                openModal("graphView", { entityType: entityType, entityId: record.entity_id, entityName: record.entity_name })
                            }}>network</Button>
                            <Popconfirm title="确认删除节点?"
                                onConfirm={async () => {
                                    // deleteContainer(record)
                                    try {
                                        await axios.delete(`/entity/delete-node/${entityType}/${record.entity_id}`)
                                        messageApi.success("删除成功!")
                                        reload()
                                    } catch (error: any) {
                                        console.log(error?.response?.data?.detail)
                                        messageApi.error(error?.response?.data?.detail)
                                    }
                                }}>
                                <Button size="small" danger variant="solid">delete</Button>
                            </Popconfirm>

                        </> : <Popconfirm title="Confirm deletion?"

                            onConfirm={async () => {
                                // deleteContainer(record)
                                try {
                                    await axios.delete(`/entity/delete/${entityType}/${record.entity_id}`)
                                    messageApi.success("Delete successfully!")
                                    reload()
                                } catch (error: any) {
                                    console.log(error?.response?.data?.detail)
                                    messageApi.error(error?.response?.data?.detail)
                                }

                            }}>
                            <Button size="small" danger variant="solid">delete</Button>
                        </Popconfirm>
                        }



                    </>}





                </Space>
            ),
        },
    ]

    return <div >
        {/* {locale} */}
        <Table
            title={() => (
                <Flex justify={"space-between"}>

                    <Flex gap={"small"} align={"center"}>
                        {entityType != "association" &&
                            <Switch
                                value={isResearch}
                                onChange={setIsResearch}
                                checkedChildren="filter" unCheckedChildren="all" size="small" defaultChecked />
                        }


                        <Input.Search
                            size="small"
                            placeholder="search..."
                            allowClear
                            enterButton
                            onSearch={(value) => { search(value) }}

                            // value={searchText}
                            // onChange={(e: any) => setSearchText(e.target.value)}
                            style={{ width: 300 }}
                        />
                    </Flex>
                    <Flex gap={"small"}>


                        <Tooltip title="create">
                            <PlusCircleOutlined onClick={() => {

                                if (params?.category) {
                                    openModal("optModal", { entityType: entityType, category: params?.category })
                                } else {
                                    openModal("optModal", { entityType: entityType })
                                }


                            }} />
                        </Tooltip>
                        <Tooltip title="refresh">
                            <RedoOutlined onClick={() => reload()} />
                        </Tooltip>
                        {close && <CloseOutlined onClick={close} />
                        }
                    </Flex>
                </Flex>


            )}
            rowSelection={rowSelection}
            rowKey={(it: any) => it.entity_id}
            size="small"
            bordered
            // rowSelection={rowSelection}
            pagination={false}
            loading={loading}
            scroll={{ x: 'max-content' }}
            columns={columns}
            dataSource={data}
            footer={() => (<>
                {totalPage != 0 && <Flex style={{ marginTop: "1rem" }} align="center" gap={"small"}>
                    <p>A total of {totalPage} data </p>
                    <Pagination
                        size="small"
                        current={pageNumber}
                        pageSize={pageSize}
                        total={totalPage}
                        onChange={(p) => setPageNumber(p)}
                        showSizeChanger={false}
                    />
                    <Select size="small" value={pageSize} onChange={setPageSize} options={[
                        {
                            key: 10,
                            value: 10,
                        }, {
                            key: 30,
                            value: 30,
                        }, {
                            key: 50,
                            value: 50,
                        }
                    ]}></Select>
                </Flex>}
            </>
            )}
        />




    </div>
})

export default DataPage