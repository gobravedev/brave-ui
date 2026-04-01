import { createContext, FC, useContext, useEffect, useMemo, useRef, useState } from "react"

export const RenderContext = createContext<any>(null)

export const useStoreRender = () => {
    return useContext(RenderContext)
}

export const RenderProvider: FC<any> = ({ children }) => {

    // const [componentParentIdsMap, setComponentParentIdsMap] = useState<any>({})
    const [resultTableList, setResultTableList] = useState<any>()
    const [toolsPanelView, setToolsPanelView] = useState<any>("inputFileComponent")
    const [analysisId, setAnalysisId] = useState<any>(null)
    const [relation, setRelation] = useState<any>(null)
    const [requestParam, setRequestParam] = useState<any>(null)

    const clear = () => {
        // setComponentParentIdsMap({})
        setResultTableList(null)
        setToolsPanelView("inputFileComponent")
        setAnalysisId(null)
        setRelation(null)
        setRequestParam(null)
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
    useEffect(() => {
        if (relation) {
            const params = buildRequestParams()
            setRequestParam(params)
        }
    }, [resultTableList, relation])

  
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
                clear
            }}
        >
            {children}
        </RenderContext.Provider>
    )
}