import { FC } from "react"
import Taxonomy from './taxonomy'
import Association from './association'
const componentMap:any = {
    "taxonomy":Taxonomy,
    "association":Association
}
const ComponentsRender:FC<any> =({type,openModals,record})=>{
    const Component = componentMap[type] || (() => <div></div>);
    return <Component openModals={openModals} record={record}></Component>
}
export default ComponentsRender