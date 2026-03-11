import { Tabs } from "antd"
import FormJsonComp from "../../form-components"
import BioDatabaseForm from "../../bio-database-form"
import { FC, useEffect, useState } from "react"
import { useModals } from "@/hooks/useModal"
import BioDatabases from "../../bio-databases"
import {  FormProvider } from "@/context/form/FormProvider"

const RenderFromJson: FC<any> = ({ formJson: formJson_, dataMap, databases, analysisResultId }) => {
    const { modals, openModals, closeModals } = useModals(["paramsView", "bioDatabases"]);
    const [dbFormJson, setDbFormJson] = useState<any>([])
    const [formJson, setFormJson] = useState<any>([])
    useEffect(() => {
        initForm()
    }, [JSON.stringify(formJson_)])

    const initForm = () => {
        if (Array.isArray(formJson_)) {
            const formJson = formJson_.filter((item: any) => !item?.required && !item?.db && !item.component_id)
            const dbFormJson = formJson_.filter((item: any) => item?.required || item?.db || item.component_id)
            setDbFormJson(dbFormJson)
            setFormJson(formJson)
        }
    }
    return <>
        <FormProvider>

            <Tabs
                // ={true}

                items={[
                    {
                        key: "1",
                        label: "Required Parameters",
                        forceRender: true,
                        children: <>

                            <FormJsonComp analysisResultId={analysisResultId} formJson={[...dbFormJson]} dataMap={dataMap} ></FormJsonComp>
                            {(databases && Array.isArray(databases) && databases.length > 0) && <BioDatabaseForm openModal={() => {
                                openModals("bioDatabases", databases)
                            }} formJson={databases}></BioDatabaseForm>}
                        </>
                    }, {
                        key: "2",
                        label: "Optional parameters",
                        forceRender: true,
                        children: <>
                            {/* {data.request_param.data_component_ids} */}
                            <FormJsonComp formJson={[
                                // {
                                //     "name": "addedProject",
                                //     "label": "项目",
                                //     "required": true,
                                //     "mode": "multiple",
                                //     "type": "BaseSelect",
                                //     "data": projectList
                                // },
                                ...formJson
                            ]} dataMap={{}} ></FormJsonComp>

                            {/* {JSON.stringify(formJson)} */}
                        </>
                    }
                ]}></Tabs>
        </FormProvider>

        <BioDatabases
            visible={modals.bioDatabases.visible}
            onClose={() => closeModals("bioDatabases")}
            params={modals.bioDatabases.params}></BioDatabases>
    </>
}

export default RenderFromJson