import { Tag, Tooltip } from "antd"

export const getColumns = (entityType: any) => {
    let entityColumns: any[] = []
    switch (entityType) {
        case "organisms":
            entityColumns = [
                ...entityColumns,
                {
                    title: "entity_id",
                    dataIndex: "entity_id",
                    key: "taxonomy_id",
                    render: (text: any, record: any) => {
                        return <a href={`https://meshb.nlm.nih.gov/record/ui?ui=${text}`} target="_blank">{text}</a>
                    }
                }, {
                    title: "entity_name",
                    dataIndex: "entity_name",
                    key: "entity_name",
                    render: (text: any, record: any) => (<>
                        {record?.entity_name_en ? <Tooltip title={record?.entity_name_en}>
                            {text}
                        </Tooltip> : <>
                            {text}
                        </>}
                    </>)
                }, {
                    title: "taxonomy_name",
                    dataIndex: "taxonomy_name",
                    key: "taxonomy_name"
                }, {
                    title: "rank",
                    dataIndex: "rank",
                    key: "rank"
                }, {
                    title: "tax_id",
                    dataIndex: "tax_id",
                    key: "tax_id"
                },  {
                    title: "entity_type",
                    dataIndex: "entity_type",
                    key: "entity_type",
              
                },{
                    title: "has_children",
                    dataIndex: "has_children",
                    key: "has_children",
                    render: (text: any, record: any) => {
                        return text ? "exist" : "non-existent"
                    }
                }, {
                    title: "is_exist_graph",
                    dataIndex: "is_exist_graph",
                    key: "is_exist_graph",
                    render: (text: any, record: any) => {
                        return text ? "exist" : "non-existent"
                    }
                }
            ]
            break;
        case "mesh":
            entityColumns = [
                ...entityColumns,
                {
                    title: "entity_id",
                    dataIndex: "entity_id",
                    key: "taxonomy_id",
                    render: (text: any, record: any) => {
                        return <a href={`https://meshb.nlm.nih.gov/record/ui?ui=${text}`} target="_blank">{text}</a>
                    }
                },
                // {
                //     title: "mesh_id",
                //     dataIndex: "mesh_id",
                //     key: "mesh_id",
                //     render:(text: any, record: any) => {
                //         return <a href={`https://meshb.nlm.nih.gov/record/ui?ui=${text}`}  target="_blank">{text}</a>
                //     }
                // },
                {
                    title: "entity_name",
                    dataIndex: "entity_name",
                    key: "entity_name",
                    render: (text: any, record: any) => (<>
                        {record?.entity_name_en ? <Tooltip title={record?.entity_name_en}>
                            {text}
                        </Tooltip> : <>
                            {text}
                        </>}
                    </>)
                }, {
                    title: "short_name",
                    dataIndex: "short_name",
                    key: "short_name",
                    render: (text: any, record: any) => (
                        <>
                            {text && Array.isArray(text) && text.map((item: any, index: any) => <Tag key={index}>
                                {item}
                            </Tag>)}
                        </>
                    )
                },  {
                    title: "entity_type",
                    dataIndex: "entity_type",
                    key: "entity_type",
              
                },{
                    title: "has_children",
                    dataIndex: "has_children",
                    key: "has_children",
                    render: (text: any, record: any) => {
                        return text ? "exist" : "non-existent"
                    }
                }, {
                    title: "is_exist_graph",
                    dataIndex: "is_exist_graph",
                    key: "is_exist_graph",
                    render: (text: any, record: any) => {
                        return text ? "exist" : "non-existent"
                    }
                }, {
                    title: "is_research",
                    dataIndex: "is_research",
                    key: "is_research",
                    render: (text: any, record: any) => {
                        return text ? "research" : "non-research"
                    }
                }, {
                    title: "tags",
                    dataIndex: "tags",
                    key: "tags",
                    render: (text: any, record: any) => (
                        <>
                            {text && Array.isArray(text) && text.map((item: any, index: any) => <Tag key={index}>
                                {item}
                            </Tag>)}
                        </>
                    )
                }

                // ,{
                //     title: "parent_trees",
                //     dataIndex: "parent_trees",
                //     key: "parent_trees",

                // }
            ]
            break;
        case "association":

            entityColumns = [
                {
                    title: "entity_id",
                    dataIndex: "entity_id",
                    key: "entity_id"
                }, {
                    title: "subject_name",
                    dataIndex: "subject_name",
                    key: "subject_name",
                    render: (text: any, record: any) => (<>
                       <Tooltip title={record?.subject_id}>
                            {text}
                        </Tooltip>
                    </>)
                }, {
                    title: "predicate",
                    dataIndex: "predicate",
                    key: "predicate"
                }, {
                    title: "object_name",
                    dataIndex: "object_name",
                    key: "object_name",
                    render: (text: any, record: any) => (<>
                       <Tooltip title={record?.object_id}>
                            {text}
                        </Tooltip>
                    </>)
                }, {
                    title: "effect",
                    dataIndex: "effect",
                    key: "effect"
                },  {
                    title: "study_name",
                    dataIndex: "study_name",
                    key: "study_name",
                    render: (text: any, record: any) => (<>
                       <Tooltip title={record?.study_id}>
                            {text}
                        </Tooltip>
                    </>)
                },{
                    title: "observed_name",
                    dataIndex: "observed_name",
                    key: "observed_name",
                    render: (text: any, record: any) => (<>
                       <Tooltip title={record?.observed_id}>
                            {text}
                        </Tooltip>
                    </>)
                },
                //  {
                //     title: "participates_in_pathway",
                //     dataIndex: "participates_in_pathway",
                //     key: "participates_in_pathway"
                // }, {
                //     title: "produces_metabolite",
                //     dataIndex: "produces_metabolite",
                //     key: "produces_metabolite"
                // }, {
                //     title: "regulates_gene",
                //     dataIndex: "regulates_gene",
                //     key: "regulates_gene"
                // },
            ]
            break;
        default:
            entityColumns = [
                {
                    title: "entity_id",
                    dataIndex: "entity_id",
                    key: "taxonomy_id"
                }, {
                    title: "entity_name",
                    dataIndex: "entity_name",
                    key: "entity_name"
                }, {
                    title: "has_children",
                    dataIndex: "has_children",
                    key: "has_children",
                    render: (text: any, record: any) => {
                        return text ? "exist" : "non-existent"
                    }
                }, {
                    title: "is_exist_graph",
                    dataIndex: "is_exist_graph",
                    key: "is_exist_graph",
                    render: (text: any, record: any) => {
                        return text ? "exist" : "non-existent"
                    }
                }, {
                    title: "is_research",
                    dataIndex: "is_research",
                    key: "is_research",
                    render: (text: any, record: any) => {
                        return text ? "research" : "non-research"
                    }
                }

            ]
    }
    return entityColumns
}