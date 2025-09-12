export const getColumns = (entityType: any) => {
    let entityColumns:any[] = [
        {
            title: "entity_id",
            dataIndex: "entity_id",
            key: "taxonomy_id"
        },{
            title: "entity_name",
            dataIndex: "entity_name",
            key: "entity_name"
        },{
            title: "has_children",
            dataIndex: "has_children",
            key: "has_children",
            render: (text: any, record: any) => {
                return text?"存在":"不存在"
            }
        },{
            title: "is_exist_graph",
            dataIndex: "is_exist_graph",
            key: "is_exist_graph",
            render: (text: any, record: any) => {
                return text?"存在":"不存在"
            }
        }
    ]
    switch (entityType) {
        case "taxonomy":
            entityColumns = [
                ...entityColumns,
                {
                    title: "rank",
                    dataIndex: "rank",
                    key: "rank"
                },{
                    title: "division_name",
                    dataIndex: "division_name",
                    key: "division_name"
                },
            ]
            break;

        default:
            break;
    }
    return entityColumns
}