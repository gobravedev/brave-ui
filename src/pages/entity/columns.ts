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