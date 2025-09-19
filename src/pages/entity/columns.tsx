export const getColumns = (entityType: any) => {
    let entityColumns:any[] = []
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
                },  {
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
            break;
        case "disease":
            entityColumns = [
                ...entityColumns,
                {
                    title: "entity_id",
                    dataIndex: "entity_id",
                    key: "taxonomy_id"
                },{
                    title: "mesh_id",
                    dataIndex: "mesh_id",
                    key: "mesh_id",
                    render:(text: any, record: any) => {
                        return <a href={`https://meshb.nlm.nih.gov/record/ui?ui=${text}`}  target="_blank">{text}</a>
                    }
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
            break;
        case "association":
            entityColumns = [
                {
                    title: "entity_id",
                    dataIndex: "entity_id",
                    key: "entity_id"
                },{
                    title: "subject_id",
                    dataIndex: "subject_id",
                    key: "subject_id"
                },{
                    title: "object_id",
                    dataIndex: "object_id",
                    key: "object_id"
                },{
                    title: "observed_id",
                    dataIndex: "observed_id",
                    key: "observed_id"
                },{
                    title: "evidenced_id",
                    dataIndex: "evidenced_id",
                    key: "evidenced_id"
                },
            ]
            break;
        default:
            entityColumns= [
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
    }
    return entityColumns
}