import { createContext, FC, useContext, useMemo, useRef, useState } from "react"

export const FormContext = createContext<any>(null)

export const useStoreForm = () => {
    return useContext(FormContext)
}

export const FormProvider: FC<any> = ({ children }) => {

    const [columnsMap, setColumnsMap] = useState<any>({})
    // const [data, setData] = useState<any>()

    const addColumns = (key: string, value: any) => {
        setColumnsMap((prev: any) => ({
            ...prev,
            [key]: value, // 动态键名
        }));
    };
    // const columnsCache = useRef<Record<string, any[]>>({})

    // const columnsData = useMemo(() => {

    //     if (!file) return []

    //     // ---------- cache ----------
    //     if (!columnsCache.current[file]) {

    //         const fileObj = data?.find((it: any) => it.id == file)

    //         if (!fileObj) return []

    //         columnsCache.current[file] = fileObj.columns.map((it: any) => ({
    //             label: it.columns_name,
    //             value: it.columns_name,
    //             ...it
    //         }))
    //     }

    //     return columnsCache.current[file]

    // }, [file, data])

    return (
        <FormContext.Provider
            value={{
                columnsMap,
                addColumns,
                // data,
                // setData
            }}
        >
            {children}
        </FormContext.Provider>
    )
}