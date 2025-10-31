import { Button, Card, Col, Collapse, Drawer, Empty, Flex, Form, Input, message, Modal, notification, Pagination, Popconfirm, Row, Segmented, Select, Skeleton, Space, Spin, Switch, Table, Tabs, Tag, Tooltip, Tree, Typography } from "antd"
import Item from "antd/es/list/Item"
import { FC, forwardRef, lazy, Suspense, useEffect, useImperativeHandle, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useOutletContext, useParams } from "react-router"
import { ApartmentOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import DataPage from './components/data-page'

import Meta from "antd/es/card/Meta"
import { colors } from '@/utils/utils'
import { pageContainerApi } from '@/api/container'
import axios from "axios"
import { useModal, useModals } from "@/hooks/useModal"

import { EntityModal } from './components'
import TableTree from '@/pages/entity/components/table-tree'
import { EntityRef } from './components/interface'
// const GraphView = lazy()
const GraphView = lazy(() => import('@/pages/entity-relation/components/graph-view'));
import { getColumns, getAction } from './components/columns'

// const [pipelineComponents, setPipelineComponents] = useState<any>([])

export const EntityView: FC<any> = forwardRef<any, any>(({ openModals, rowSelection, disableWidth = false, tabKey: tabKey_, params: params_ ,hiddenSwitch=true}, ref) => {

    // const [entityType, setEntityType] = useState<any>("mesh")
    const [columnType, setColumnType] = useState<any>("mesh")

    const [params, setParams] = useState<any>(params_ ? params_ : {
        category: ["F03", "C10", "F01"]
    })
    const [tabKey, setTabKey] = useState<any>(tabKey_ ? tabKey_ : "mental_disorders")

    // const { modal, openModal, closeModal } = useModal();

    const entityRef = useRef<EntityRef>(null)
    const [showStyle, setShowStyle] = useState<any>("table")

    const reload = () => {
        entityRef.current?.reload()
    }
    const setPageNumber = (value: any) => {
        if (entityRef.current) {
            entityRef.current?.setPageNumber(value)

        }
    }
    const items: any[] = [
        {
            key: "mental_disorders",
            label: "Mental Disorders"
        }, {
            key: "organisms",
            label: "Microbe"
        },

        {
            key: "mesh-KEGG",
            label: "KEGG"
        },

        {
            key: "chemicals_and_drugs",
            label: "Chemicals and Drugs"
        },
        // {
        //     key: "evidence",
        //     label: "Research Evidence"
        // },
        // {
        //     key: "taxonomy",
        //     label: "Microbe"
        // },
        // {
        //     key: "diet_and_food",
        //     label: "diet_and_food"
        // },
        //  {
        //     key: "inteventions",
        //     label: "Inteventions"
        // }
    ]
    // if (!hiddenAssociation) {
    //     items.unshift({
    //         key: "association",
    //         label: "Association"
    //     })
    // }
    const onKeyChange = (key: any) => {
        if (key.startsWith("mesh")) {
            // debugger
            // setEntityType("mesh")
            const category = key.split("-")[1]
            // setCategory(category)
            setParams({
                category: [category]
            })
            setColumnType("mesh")
        } else if (key == "organisms") {
            // setEntityType("mesh")
            setColumnType("organisms")
            setParams({
                category: ["B02", "B03", "B04"],
                registry_join: "taxonomy"
            })
        } else if (key == "mental_disorders") {
            // setEntityType("mesh")
            setParams({
                category: ["F03", "C10", "F01"]
            })
            setColumnType("mesh")
        } else if (key == "chemicals_and_drugs") {
            // 化学品和药物 [D] 
            // 无机化学品 [D01] 
            // 有机化学品 [D02] 
            // 杂环化合物 [D03] 
            // 多环化合物 [D04] 
            // 大分子物质 [D05] 
            // 激素、激素替代物和激素拮抗剂 [D06] 
            // 酶和辅酶 [D08] 
            // 碳水化合物 [D09] 
            // 脂质 [D10] 
            // 氨基酸、肽和蛋白质 [D12] 
            // 核酸、核苷酸和核苷 [D13] 
            // 复杂混合物 [D20] 
            // 生物因素 [D23] 
            // 生物医学和牙科材料 [D25] 
            // 药物制剂 [D26] 
            // 化学作用及用途 [D27] 
            // setEntityType("mesh")
            setParams({
                category: ["D01", "D02", "D03", "D04", "D05", "D06", "D08", "D09", "D10", "D12", "D13", "D20", "D23", "D25", "D26", "D27"]
            })
            setColumnType("mesh")
        } else if (key == "evidence") {
            // setEntityType("mesh")
            setParams({
                category: ["evidence"],
                registry_join: "study"
            })
            setColumnType("mesh")
        } else {
            // setEntityType(key)
        }

        // reload()
    }

    // useEffect(() => {
    //     onKeyChange(items[0].key)
    // }, [])

    useImperativeHandle(ref, () => ({
        reload
    }))

    // const association = {
    //     key: "association",
    //     label: "association"
    // }


    return <div style={disableWidth ? {} : { maxWidth: "1500px", margin: "1rem auto" }}>
        {/* <Flex justify="flex-end" gap="small">
            {openModals && <>
                <Button size="small" color="cyan" variant="solid" onClick={() => {
                    openModals("entityModal", { entityType: entityType,category:params?.category, })
                }}>create</Button>
            </>}

            <Button size="small" color="cyan" variant="solid" onClick={reload}>refresh</Button>
        </Flex> */}
        <div style={{ marginBottom: "1rem" }}> </div>

        {/* {JSON.stringify(data)} */}

        {!params_ && <Tabs size="small"
            activeKey={tabKey}
            onChange={(key: any) => {
                onKeyChange(key)
                setTabKey(key)
                setPageNumber(1)
            }}
            tabBarExtraContent={<>
                <Segmented size="small" value={showStyle}
                    onChange={(val: any) => setShowStyle(val)}
                    options={[
                        {
                            label: "table",
                            value: "table"
                        }, {
                            label: "tree",
                            value: "tree"
                        }
                    ]} />

            </>}
            items={items}></Tabs>}

        {/* {showStyle} */}
        {/* <TableTree></TableTree> */}
        {/* {entityType} */}
        {showStyle == "table" && <>

            <DataPage
                columns={({ openModal, reload, messageApi }: any) => {
                    const columns = getColumns(columnType)
                    const action = getAction("mesh", openModal, reload, messageApi)
                    return [...columns, ...action]
                }}
                hiddenSwitch={false}
                rowSelection={rowSelection} ref={entityRef} openModal={openModals} params={params}
                api={`/entity/page/mesh`}></DataPage>
        </>}
        {showStyle == "tree" && <>
            <TableTree ref={entityRef} entityType={"mesh"} params={params}></TableTree>
        </>}




    </div>
})


const EntityViewPanel: FC<any> = ({ ...rest }) => {
    const { modals, openModals, closeModals } = useModals(["entityPage", "optModal", "graphView", "entityDrawer", "entityDetailsModal"]);
    const entityRef = useRef<EntityRef>(null)
    const reload = () => {
        entityRef.current?.reload()
    }
    return <>
        <EntityView {...rest} ref={entityRef} openModals={openModals} ></EntityView>
        <EntityModal
            openModals={openModals}
            callback={reload}
            visible={modals.optModal.visible}
            params={modals.optModal.params}
            onClose={() => closeModals("optModal")}
        ></EntityModal>
        <GraphViewModal
            callback={reload}
            visible={modals.graphView.visible}
            params={modals.graphView.params}
            onClose={() => closeModals("graphView")}
        ></GraphViewModal>

        <EntityDetailsModal
            openModals={openModals}
            callback={reload}
            visible={modals.entityDetailsModal.visible}
            params={modals.entityDetailsModal.params}
            onClose={() => closeModals("entityDetailsModal")}
        ></EntityDetailsModal>
    </>
}




export default EntityViewPanel










const GraphViewModal: FC<any> = ({ visible, params, onClose, callback }) => {

    return <Modal title={params?.entityName} width={"60%"} footer={null} open={visible} onClose={onClose} onCancel={onClose}>
        {/* {JSON.stringify(params)} */}
        <Suspense fallback={<Skeleton active></Skeleton>}>
            <GraphView entity_id={params?.entityId}></GraphView>

        </Suspense>
    </Modal>
}




const EntityDetailsModal: FC<any> = ({ visible, params, onClose }) => {
    const [loading, setLoading] = useState<any>(false)
    const [data, setData] = useState<any>()
    const [treeData, setTreeData] = useState<any>()

    const convertToTreeData = (nodes: any) => {
        return nodes.map((node: any) => ({
            title: node.entity_name,
            key: node.entity_id,
            children: node.children ? convertToTreeData(node.children) : [],
        }));
    };


    // const treeData = convertToTreeData(data);



    const loadData = async () => {
        setLoading(true)
        // entityType:entityType,entityId:record.entity_id
        const resp: any = await axios.get(`/entity/get/${params.entityType}/${params.entityId}`)
        const data = convertToTreeData(resp.data.parents);
        setTreeData(data)
        setLoading(false)
    }
    useEffect(() => {
        if (params?.entityId) {
            loadData()
        }

    }, [params?.entityId])
    return <Drawer open={visible} onClose={onClose} width="40%" loading={loading}>
        {treeData && <>

            {/* {JSON.stringify(data.parents)} */}
            {/* {data.parents.map((item: any, index: any) => (<span key={index}>

                <Tag>{item.entity_name}({item.entity_id})</Tag>-

            </span>))} */}


            <Tree

                treeData={treeData}
                defaultExpandAll
                showLine
                selectable
            />
        </>}

    </Drawer>
}