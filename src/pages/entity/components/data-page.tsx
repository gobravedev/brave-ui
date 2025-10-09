import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { EntityRef } from './interface'
import { useI18n } from "@/hooks/useI18n";
import { useNavigate, useOutletContext } from "react-router";
import { getColumns, getAction } from './columns'
import { Button, Flex, Input, Pagination, Popconfirm, Select, Space, Switch, Table, Tooltip } from "antd";
import axios from "axios";
import { usePagination } from "@/hooks/usePagination";
import { CloseOutlined, PlusCircleOutlined, RedoOutlined } from "@ant-design/icons"

interface DataPageParams {
    openModal: any;
    // entityType: any, 
    rowSelection?: any,
    params?: any,
    // columnType?: any,
    hiddenSwitch?: boolean,
    close?: any,
    api: any,
    columns: any
}
const DataPage = forwardRef<EntityRef, DataPageParams>(({
    rowSelection, openModal, api, params, close, columns: columns_, hiddenSwitch = false }, ref) => {
    const [isResearch, setIsResearch] = useState<boolean>(hiddenSwitch?false:true)
    const { locale } = useI18n()
    const [initPageSize] = useState(30); // 每页显示条数
    // const [columns, setColumns] = useState<any>([])

    const { data, pageNumber, totalPage, loading, reload, pageSize, setPageSize, setPageNumber, search } = usePagination({
        // pag?eApi: pageContainerApi,
        url: api,
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

    // useEffect(() => {
    //     // console.log(columnType)
    //     // const columns = getColumns(columnType)
    //     // let columnsRes: any = []
    //     // console.log(columnType)
    //     // if (columnType == "association") {
    //     //     columnsRes = [
    //     //         ...columns,
    //     //         ...getAction("association", openModal, reload, messageApi)

    //     //     ]
    //     // } else {
    //     //     columnsRes = [
    //     //         ...columns,
    //     //         ...getAction("mesh", openModal, reload, messageApi)

    //     //     ]
    //     // }

    //     setColumns(columns)
    //     // console.log(columnType)

    // }, [columnType])
    // const columns = columns_({openModal, reload, messageApi})
    const columns = useMemo(() => {
        // console.log("3333333333333")
        return columns_({ openModal, reload, messageApi });
    }, [params?.category]);
    return <div >
        {/* {locale} */}
        {/* {entityType} */}
        <Table
            title={() => (
                <Flex justify={"space-between"}>

                    <Flex gap={"small"} align={"center"}>
                        {!hiddenSwitch &&
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

                                if (params?.category && params?.registry_join) {
                                    openModal("optModal", { entityType: "mesh", category: params?.category, registryJoin: params?.registry_join })
                                } else if (params?.category) {
                                    openModal("optModal", { entityType: "mesh", category: params?.category })
                                } else {
                                    openModal("optModal", { entityType: "mesh" })
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