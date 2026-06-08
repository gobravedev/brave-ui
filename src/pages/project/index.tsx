import { FC, useEffect, useState } from "react"
import { Button, Card, Empty, Flex, Popconfirm, Tabs } from "antd"
import ComponentsDetailsRender from '../../core/ui-renderer/ViewResolver';
import { renderViewButton } from "@/utils/render-view-btn"
import { useSelector } from "react-redux"
import { ReloadOutlined } from "@ant-design/icons"
import { useSideViewContext } from "@/context/side/SideViewContext"
import { invoke } from "@/core/ui-system/invokeV2";
import { deleteProjectReportApi, getProjectReportDetailApi, listProjectReportApi, type ProjectReportDetailItem, type ProjectReportItem } from "@/api/project";
import { useGlobalMessage } from "@/hooks/useGlobalMessage";
const Project: FC<any> = () => {
    const [view, setView] = useState<any>("analysisDocView")
    const { project } = useSelector((state: any) => state.user);
    const { setSideView, setSideOptions } = useSideViewContext();
    const message = useGlobalMessage()
    const [reportList, setReportList] = useState<ProjectReportItem[]>([])
    const [activeReport, setActiveReport] = useState<ProjectReportDetailItem>()
    const [activeReportId, setActiveReportId] = useState<string>()

    const loadProjectReports = async (preferReportID?: string   ) => {
        if (!project) return;

        const listResp = await listProjectReportApi(project)

        const listData = Array.isArray(listResp.data) ? listResp.data : []

        setReportList(listData)

        if (listData.length === 0) {
            setActiveReportId(undefined)
            setActiveReport(undefined)
            return
        }

        const fallbackID = listData[0]?.id
        const nextID = (preferReportID && listData.some((item:any) => item.id === preferReportID))
            ? preferReportID
            : fallbackID
        setActiveReportId(nextID)
    }

    const loadReportDetail = async (id?: string ) => {
        if (!id) {
            setActiveReport(undefined)
            return
        }

        const resp = await getProjectReportDetailApi(id)
        setActiveReport(resp.data)
    }

    const openCreateReportModal = async () => {
        if (!project) return
        try {
            const created = await invoke.projectReportItemForm.openAsync(
                {
                    mode: "create",
                    project_id: project,
                },
                {
                    title: "Create Project Report Item",
                    footer: null,
                    width: 560,
                }
            )
            await loadProjectReports(created?.id)
        } catch {
        }
    }

    const openUpdateReportModal = async () => {
        if (!activeReport) {
            message.warning("Please select a report tab first")
            return
        }

        try {
            await invoke.projectReportItemForm.openAsync(
                {
                    mode: "update",
                    project_id: project,
                    report: activeReport,
                },
                {
                    title: "Update Project Report Item",
                    footer: null,
                    width: 560,
                }
            )
            await loadProjectReports(activeReport.id)
        } catch {
        }
    }

    const deleteActiveReport = async () => {
        if (!activeReport) {
            message.warning("Please select a report tab first")
            return
        }

        await deleteProjectReportApi({
            id: activeReport.id,
        })
        message.success("Deleted successfully")
        await loadProjectReports()
    }


    useEffect(() => {
        setSideOptions([
            {
                label: "LLM",
                value: "llm-card"
            }, {
                label: "Container App",
                value: "containerAppProject"
            }
        ])
        // setSideView("analysis-tools")
        return () => {
            setSideOptions([])
            setSideView("llm-card")
        }
    }, [])

    useEffect(() => {
        loadProjectReports()
    }, [project])

    useEffect(() => {
        loadReportDetail(activeReportId)
    }, [activeReportId])

    return <div >
        <Card
            style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                height: " 100%",
                boxShadow: "none"
            }}
            styles={{
                body: {
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    height: " 100%",
                    // padding: 0,
                    overflowY: "auto"
                }
            }}
            variant="borderless" size="small" extra={
                <Flex gap={"small"}>
                    {renderViewButton(view, setView, "analysisDocView", "View")}
                    {renderViewButton(view, setView, "analysisDocEditor", "Edit")}

                    <Button size="small" color="cyan" variant="solid" onClick={openCreateReportModal}>Add Item</Button>
                    <Button size="small" color="cyan" variant="solid" onClick={openUpdateReportModal}>Edit Item</Button>
                    <Popconfirm title="Delete selected report item?" onConfirm={deleteActiveReport}>
                        <Button size="small" color="red" variant="solid">Delete Item</Button>
                    </Popconfirm>

                    <Button icon={<ReloadOutlined></ReloadOutlined>} size="small" color="cyan" variant="solid" onClick={() => {
                        loadProjectReports(activeReportId)
                    }}></Button>
                </Flex>

            }>
                {/* {JSON.stringify(reportList)} */}
            {reportList.length > 0 ? <>
                <Tabs
                    size="small"

                    activeKey={activeReportId ? String(activeReportId) : undefined}
                    onChange={(key) => setActiveReportId(key)}
                    items={reportList.map((item) => ({
                        key: String(item.id),
                        label: item.title || `Untitled-${item.id}`,
                    }))}
                />

                <ComponentsDetailsRender view={view}
                    project_id={project}
                    report={activeReport}
                    content={activeReport?.content}
                    onSaved={() => loadReportDetail(activeReport?.id)}></ComponentsDetailsRender>
            </> : <Empty description="No project report item, please create one first" />}
        </Card>

    </div>
}

export default Project