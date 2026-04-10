import axios from "axios"
import { createContext, FC, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useSideViewContext } from "../side/SideViewContext"
import { useComponentStore } from "@/store-zustand/components"

export const RenderContext = createContext<any>(null)

export const useStoreRender = () => {
    return useContext(RenderContext)
}

type FromParamType = {
    type: string,
    bizKey: string
}

export const RenderProvider: FC<any> = ({ children }) => {

    // const [componentParentIdsMap, setComponentParentIdsMap] = useState<any>({})
    const [resultTableList, setResultTableList] = useState<any>()
    const [toolsPanelView, setToolsPanelView] = useState<any>("inputFileComponent")
    const [analysisId, setAnalysisId] = useState<any>(null)
    const [analysisNodeId, setAnalysisNodeId] = useState<any>(null)

    // const [formParam, setFormParam] = useState<FromParamType | null>(null)
    const [openAnalysis, setOpenAnalysis] = useState<any>([])
    const [relation, setRelation] = useState<any>(null)
    const [requestParam, setRequestParam] = useState<any>(null)
    const [formData, setFormData] = useState<any>(null)
    const [formStatus, setFormStatus] = useState<any>(null)
    const { setSideView, sideView, sideOptions, setSideOptions } = useSideViewContext();

    const updateFormStatus = (args: any) => {
        // debugger
        if(args?.status){
            setFormStatus(args.status)
        }
        // setFormStatus("running");
    }
    const { register, unregister } = useComponentStore();
    useEffect(() => {
        if (analysisId) {
            register("analysis", analysisId, { updateFormStatus });
            return () => {
                // debugger
                unregister("analysis", analysisId);
            }
        }

    }, [analysisId]);
    useEffect(() => {
        if (analysisNodeId) {
            register("analysis", analysisNodeId, { updateFormStatus });
            return () => {
                unregister("analysis", analysisNodeId);
            }
        }

    }, [analysisNodeId]);

    const clear = () => {
        // setComponentParentIdsMap({})
        setResultTableList(null)
        setToolsPanelView("inputFileComponent")
        setAnalysisId(null)
        setRelation(null)
        // setFormParam(null)
        setRequestParam(null)
        setOpenAnalysis([])
        setFormData(null)
    }
    const buildRequestParams = () => {
        let dataComponentIds: any = []
        if (relation.inputFile) {
            dataComponentIds = relation.inputFile.map((item: any) => item.component_id)

        }
        const requestParams = {
            component_id: relation.component_id,
            data_component_ids: JSON.stringify(dataComponentIds),
            // component_parent_ids_map: componentParentIdsMap,
            relation_id: relation.relation_id,
        }
        return {
            requestParam: requestParams,
            dataMap: resultTableList ? resultTableList : {},
            formJson: relation.formJson,
            databases: relation.databases
        }
    }
    const loadToolsForm = async (tools_id: any) => {
        const resp = await axios.get(`/tools/get-from-json/${tools_id}`)
        return resp.data
    }
    const loadAnalysis = async (analysisId: any) => {
        // setLoading(true)
        const resp = await axios.post(`/analysis/edit-params-v2/${analysisId}`)
        return {
            requestParam: resp.data.request_param,
            dataMap: { ...resp.data.analysis_result },
            formJson: resp.data.formJson,
            databases: resp.data.databases,
            upstreamFormJson: resp.data.upstreamFormJson,
            status: resp.data.status,
        }
    }
    const loadNodeAnalysis = async (nodeAnalysisId: any) => {
        // /analysis/edit-node-params/{analysis_node_id}
        const resp = await axios.post(`/analysis/edit-node-params/${nodeAnalysisId}`)
        return {
            requestParam: resp.data.request_param,
            formJson: resp.data.formJson,
            databases: resp.data.databases,
            status: resp.data.status,
        }
    }
    const loadParams = async (force = false) => {
        console.log("sideView", sideView)
        if (sideView == "editParamsPanel") {
            if (analysisNodeId) {
                const data = await loadNodeAnalysis(analysisNodeId)
                setFormStatus(data.status)
                setRequestParam({
                    ...data,
                    type: "nodeAnalysis",
                })
            } else if (analysisId) {

                const data = await loadAnalysis(analysisId)
                // debugger
                setFormStatus(data.status)
                setRequestParam({
                    ...data,
                    type: "analysis",
                })
            } else if (relation) {
                setFormStatus(null)
                let data = formData;
                if (!data || force) {
                    data = await loadToolsForm(relation.relation_id)
                    setFormData(data)

                }
                const params = buildRequestParams()
                setRequestParam({
                    ...params,
                    ...data,

                })


            }
        }

    }

    useEffect(() => {
        loadParams()
    }, [relation, sideView, analysisId, analysisNodeId])

    const addOpenAnalysis = (analysis: any) => {
        if (openAnalysis.find((item: any) => item.analysis_id === analysis.analysis_id)) {
            return
        }
        setOpenAnalysis((prev: any) => [...prev, analysis])
    }

    const checkIsOpen = (analysis_id: string) => {
        return openAnalysis.find((item: any) => item.analysis_id === analysis_id)
    }

    const closeAnalysis = (analysis_id: string) => {

        setOpenAnalysis((prev: any) => prev.filter((item: any) => item.analysis_id !== analysis_id))
    }
    return (
        <RenderContext.Provider
            value={{
                // componentParentIdsMap,
                // setComponentParentIdsMap,
                resultTableList,
                setResultTableList,
                toolsPanelView,
                setToolsPanelView,
                analysisId,
                setAnalysisId,
                relation,
                setRelation,
                requestParam,
                clear,
                openAnalysis,
                addOpenAnalysis,
                checkIsOpen,
                closeAnalysis,
                loadParams,
                setAnalysisNodeId,
                analysisNodeId,
                formStatus,
                setFormStatus

            }}
        >
            {children}
        </RenderContext.Provider>
    )
}