import { Skeleton } from "antd"
import { lazy, Suspense } from "react"
import { FC } from "react"

const FormJsonComp = lazy(() => import('.'))


const RenderFormFromJson: FC<{ formJson: any,dataMap:any }> = ({ formJson,dataMap }) => {

    return <>
        <Suspense fallback={<Skeleton active></Skeleton>}>
            <FormJsonComp formJson={formJson} dataMap={dataMap}></FormJsonComp>
        </Suspense>
    </>

}

export default RenderFormFromJson