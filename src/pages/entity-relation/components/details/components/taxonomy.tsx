import { Card, Flex, Input, Table } from "antd"
import { FC, useEffect, useMemo, useState } from "react"
import LineageList from "./lineage-list"

const Taxonomy: FC<any> = ({ data }) => {

    return <>
        <Card title="Lineage" style={{ marginTop: "1rem" }} styles={{
            body: {
                padding: "0.5rem"
            }
        }}
            size="small">

            {/* {JSON.stringify(data.lineage)} */}
            <LineageList data={data.lineage}></LineageList>
            {/* {JSON.stringify(data?.graph_table?.studies)} */}
            <TableView data={data?.graph_table?.studies}></TableView>
        </Card>

    </>
}
export default Taxonomy


const TableView: FC<any> = ({ data }) => {
    const { Search } = Input;
    const [tableData, setTableData] = useState<any>([])
    const getColumns = (data: any) => {
        if (!data) return []
        return Object.keys(data).map(it => {
            return {
                title: it,
                dataIndex: it,
                key: it,
                ellipsis: true,
                width: 150,
            }
        })
    }
    useEffect(() => {
        // console.log()
        if (data) {
            // console.log(data)
            const dataWithKey = data.map((item: any, index: any) => ({ ...item, key: index }));
            setTableData(dataWithKey)
        }

    }, [data])

    const [searchText, setSearchText] = useState("");
    const filteredData = useMemo(() => {
        if (!searchText) return data;
        return data.filter((item: any) =>
            Object.values(item).some((val) =>
                String(val).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [data, searchText]);
    return <>
        {Array.isArray(tableData) && <>
            <Table
                size="small"
                title={() => <Flex gap={"small"}>
                    <Input.Search
                        size="small"
                        placeholder="Search..."
                        allowClear
                        enterButton
                        value={searchText}
                        onChange={(e: any) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                </Flex>}
                // showHeader={()=>{}}
                scroll={{ x: 'max-content' }}
                dataSource={filteredData}
                pagination={false}
                // virtual
                columns={getColumns(data[0])}
                footer={() => `A total of ${filteredData?.length} records`}
            ></Table>


        </>}

    </>
}