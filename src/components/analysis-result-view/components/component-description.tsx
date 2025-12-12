import { FC } from "react"
import Markdown from '@/components/markdown'

const ComponentDescription: FC<any> = ({ component_description }) => {

    return <div style={{ border: "1px solid rgba(5,5,5,0.06)", maxHeight: "70vh", overflowY: "auto", padding: "0.5rem", marginBottom: "1rem" }}>
        <Markdown data={component_description}></Markdown>
    </div>
}

export default ComponentDescription