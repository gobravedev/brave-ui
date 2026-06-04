import { listProjectApi, type ProjectItem } from "@/api/project";
import { Button, Flex, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FC, useEffect, useMemo, useState } from "react";

interface ProjectTableProps {
    onOk?: (value: ProjectItem) => void;
    onCancel?: () => void;
}

const columns: ColumnsType<ProjectItem> = [
    {
        title: "Project Name",
        dataIndex: "project_name",
        key: "project_name",
    },
    {
        title: "Project ID",
        dataIndex: "project_id",
        key: "project_id",
    },
    // {
    //     title: "Description",
    //     dataIndex: "description",
    //     key: "description",
    //     render: (text: string) => text || "-",
    // },
];

const ProjectTable: FC<ProjectTableProps> = ({ onOk, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [projectList, setProjectList] = useState<ProjectItem[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>();

    const selectedProject = useMemo(
        () => projectList.find((item) => item.project_id === selectedProjectId),
        [projectList, selectedProjectId]
    );

    const loadProjectList = async () => {
        setLoading(true);
        try {
            const resp = await listProjectApi();
            const rows = Array.isArray(resp.data) ? resp.data : [];
            setProjectList(rows);
            if (rows.length > 0) {
                setSelectedProjectId(rows[0].project_id);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjectList();
    }, []);

    return (
        <Flex vertical gap="middle">
            <Table<ProjectItem>
                rowKey="project_id"
                columns={columns}
                dataSource={projectList}
                loading={loading}
                size="small"
                pagination={false}
                scroll={{ y: 320 }}
                rowSelection={{
                    type: "radio",
                    selectedRowKeys: selectedProjectId ? [selectedProjectId] : [],
                    onChange: (selectedRowKeys) => {
                        setSelectedProjectId(selectedRowKeys[0] as string);
                    },
                }}
                onRow={(record) => ({
                    onClick: () => setSelectedProjectId(record.project_id),
                })}
            />

            <Flex justify="end" gap="small">
                <Button onClick={() => onCancel && onCancel()}>Cancel</Button>
                <Button
                    type="primary"
                    disabled={!selectedProject}
                    onClick={() => {
                        if (selectedProject) {
                            onOk && onOk(selectedProject);
                        }
                    }}
                >
                    Confirm
                </Button>
            </Flex>
        </Flex>
    );
};

export default ProjectTable;