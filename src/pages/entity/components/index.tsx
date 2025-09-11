import { FC } from "react"
import Taxonomy from './taxonomy'
const componentMap:any = {
    "taxonomy":Taxonomy
}
const ComponentsRender:FC<any> =({type})=>{
    const Component = componentMap[type] || (() => <div></div>);
    return <Component ></Component>
}
export default ComponentsRender