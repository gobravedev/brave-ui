import { Card } from "antd"
import { FC } from "react"
import LineageList from "./lineage-list"

const Taxonomy: FC<any> = ({data}) => {

    return <>
        <Card title="Lineage" style={{ marginTop: "1rem" }} styles={{
            body: {
                padding: "0.5rem"
            }
        }}
            size="small">

            {/* {JSON.stringify(data.lineage)} */}
            <LineageList data={data.lineage}></LineageList>
        </Card>

    </>
}
export default Taxonomy