import { FC } from "react"
import Markdown from '@/components/markdown'

const Md: FC<any> = ({ introduction }) => {

    return <div style={{ border: "1px solid rgba(5,5,5,0.06)", maxHeight: "70vh", overflowY: "auto", padding: "0.5rem", marginBottom: "1rem" }}>
        <Markdown data={introduction}></Markdown>
    </div>
}

export default Md