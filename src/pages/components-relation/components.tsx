import { Button, Card, Col, Empty, Row } from "antd"
import { FC, useRef, useState } from "react"
import ComponentsPage from "./components/page"
import { useParams } from "react-router"
import ComponentsDetailsRender from "./components-details-render"
import { CreateOrUpdatePipelineComponent } from "@/components/create-pipeline"
import { useModal } from "@/hooks/useModal"

const Components: FC<any> = () => {
    const { modal, openModal, closeModal } = useModal();

    const { component_type } = useParams()
    const tabeRef = useRef<any>(null)
    const [component, setComponent] = useState<any>()
    const loadTable = () => {
        tabeRef.current?.reload()
    }
    return <div style={{ maxWidth: "1800px", margin: "1rem auto", padding: '0 16px 0 16px' }}>
        <Row gutter={[16, 16]}>
            <Col lg={6} sm={6} xs={24}>
                <Card
                    styles={{
                        body: {
                            padding: "0"
                        }
                    }}
                    extra={<>
                        <Button size="small" color="cyan" variant="solid" onClick={() => {
                            // openModal("createOrUpdatePipelineComponent", {
                            //     data: undefined,
                            //     structure: {
                            //         component_type: component_type,
                            //     }
                            // })
                            setComponent({})
                        }}>
                            Create
                        </Button>
                    </>}
                    size="small"
                >
                    <ComponentsPage
                        ref={tabeRef}
                        component_type={component_type}
                        setComponent={setComponent} ></ComponentsPage>
                </Card>

            </Col>
            <Col lg={18} sm={18} xs={24}>
                {/* {JSON.stringify(component)} */}
                {component ? <>
                    <ComponentsDetailsRender
                        callback={loadTable}
                        view={`${component_type}V2`}
                        component={component}
                        component_type={component_type}
                    ></ComponentsDetailsRender>

                </> : <>
                    <Card>
                        <Empty description="Please select a component on the left"></Empty>
                    </Card>
                </>}
                {/* {component_type} */}
                {/* <ComponentDetails componentType={component_type} /> */}
            </Col>
        </Row>

        {/* <CreateOrUpdatePipelineComponent
            callback={loadTable}
            // pipelineStructure={pipelineStructure}
            // data={record}
            visible={modal.key == "createOrUpdatePipelineComponent" && modal.visible}
            onClose={closeModal}
            params={modal.params}></CreateOrUpdatePipelineComponent> */}
    </div>

}
export default Components

