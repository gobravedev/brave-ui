import { Button } from "antd"

export const getColumns = () => {
    return [
        {
            title: "entity_id",
            dataIndex: "entity_id",
            key: "taxonomy_id"
        }, {
            title: "entity_name",
            dataIndex: "entity_name",
            key: "entity_name"
        }, {
            title: "title",
            dataIndex: "title",
            key: "title"
        }
    ]
}

export const getAction = (openModal: any, reload: any, messageApi: any,navigate:any) => {
    return [
        {
            title: '操作',
            key: 'action',
            fixed: "right",
            width: 200,
            render: (_: any, record: any) => (
                <>
                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                        navigate(`/mining-data/${record.entity_id}`)
                    }}>mining</Button>

                </>
            )
        }
    ]
}
