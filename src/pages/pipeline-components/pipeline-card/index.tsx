import PipelineComponentsCard from "@/components/pipeline-components-card";
import { Card, Col, Row, Tag } from "antd";
import Meta from "antd/es/card/Meta";
import { colors } from "@/utils/utils";
import { useNavigate, useOutletContext } from "react-router";
const PipelineCard = () => {

    const { project } = useOutletContext<any>()
    const navigate = useNavigate()

    const menu1: any[] = [  
        {
            name: "样本前处理",
            items: [
                {
                    key: `${project}/sample-qc`,
                    label: "样本质控",
                    img: "/mvp-api/img/pipeline.jpg"
                }
            ]
        },
        {
            name: "宏基因组流程",
            items: [
                {
                    key: `${project}/meta_genome/remove-host`,
                    label: "去宿主",
                    img: "/mvp-api/img/pipeline.jpg"
                }, {
                    key: `${project}/meta_genome/reads-based-abundance-analysis`,
                    label: "基于Reads的丰度分析",
                    img: "/mvp-api/img/pipeline.jpg"
                }, {
                    key: `${project}/meta_genome/recovering-mag`,
                    label: "重构MAG",
                    img: "/mvp-api/img/pipeline.jpg"
                }, {
                    key: `${project}/meta_genome/abundance-meta`,
                    label: "丰度分析",
                    img: "/mvp-api/img/pipeline.jpg"
                }, {
                    key: `${project}/meta_genome/function-analysis`,
                    label: "功能分析",
                    img: "/mvp-api/img/pipeline.jpg"
                }, {
                    key: `${project}/meta_genome/abundance`,
                    label: "old丰度分析",
                    img: "/mvp-api/img/pipeline.jpg"
                }
            ]
        }, {
            name: "单菌流程",
            items: [
                // {
                //     key: `${project}/single_genome`,
                //     label: "项目介绍"
                // }, {
                //     key: `${project}/single_genome/sample`,
                //     label: "检测样本"
                // }, 
                {
                    key: `${project}/single_genome/assembly`,
                    label: "单菌组装",
                    img: "/mvp-api/img/pipeline.jpg"
                }, {
                    key: `${project}/single_genome/gene-prediction`,
                    label: "基因预测",
                    img: "/mvp-api/img/pipeline.jpg"
                }, {
                    key: `${project}/single_genome/gene-annotation`,
                    label: "基因注释",
                    img: "/mvp-api/img/pipeline.jpg"
                }, , {
                    key: `${project}/single_genome/gene-expression`,
                    label: "基因表达",
                    img: "/mvp-api/img/pipeline.jpg"
                },
                {
                    key: `${project}/single_genome/mutation`,
                    label: "突变检测",
                    img: "/mvp-api/img/pipeline.jpg"
                }, {
                    key: `${project}/single_genome/mutation-compare`,
                    label: "突变比较",
                    img: "/mvp-api/img/pipeline.jpg"
                }
            ]
        },
    ]
    return (
        <>

            <PipelineComponentsCard />

            {import.meta.env.MODE == "development" &&
                <>
                    <br /><br /><br /><br /><br /><br />

                    {menu1.map((menuItem: any, menuIndex: any) => (
                        <div key={menuIndex}>
                            <h2>{menuItem.name}</h2>
                            <hr />
                            <Row gutter={16}>
                                {menuItem?.items.map((item: any, index: any) => (
                                    <Col key={index} lg={4} sm={6} xs={24} style={{ marginBottom: "1rem", cursor: "pointer" }}>
                                        <Card hoverable
                                            // title={item.label}
                                            // variant="borderless" 
                                            cover={<img alt={item.label} src={item.img} />}
                                            onClick={() => navigate(`/${item.key}`)}>


                                            <Meta title={item.label} description={item?.description} style={{ marginBottom: "1rem" }} />
                                            {item.tags && Array.isArray(item.tags) && item.tags.map((tag: any, index: any) => (
                                                <Tag key={index} color={colors[index]}>{tag}</Tag>
                                            ))}
                                        </Card>
                                    </Col>
                                ))}

                            </Row>
                        </div>
                    ))}


                </>

            }


        </>


    )
}

export default PipelineCard;