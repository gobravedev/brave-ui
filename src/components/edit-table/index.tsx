import { Modal } from "antd";
import { FC, use, useEffect, useState } from "react";
import { MonacoEditor } from "../react-monaco-editor";
import { useSelector } from "react-redux";
import axios from "axios";
import { useGlobalMessage } from "@/hooks/useGlobalMessage";

export const EditResultTableModal: FC<any> = ({ visible, params, onClose, callback }) => {
    const [data, setData] = useState<any>("");
    useEffect(() => {
        if (params?.data) {
            const tsv = params?.data
                .map((item: any) => `${item.analysis_result_id}\t${item.file_name}`)
                .join("\n");
            setData(tsv);
        }
    }, [params])

    return <Modal open={visible} onCancel={onClose} width={"80%"} footer={null} title="Edit Table">
        {/* {data} */}
        <MonacoEditor value={data} onChange={setData}  ></MonacoEditor>

    </Modal>
}


export const EditMetadataTableModal: FC<any> = ({ visible, params, onClose, callback }) => {
    const [data, setData] = useState<any>("");
    const { projectObj } = useSelector((state: any) => state.user);
    const message = useGlobalMessage();
    useEffect(() => {

        if (params?.data) {

            const fields = [
                "sample_id",
                "sample_name",
            ];
            if (projectObj?.metadata_form) {
                for (const field of projectObj?.metadata_form) {
                    fields.push(field.name)
                }
            }
            const header = fields.join("\t");

            const rows = params.data
                .map((item: any) =>
                    fields.map(f => item[f] ?? "").join("\t")
                )
                .join("\n");
            const tsv = header + "\n" + rows;

            setData(tsv);
        } else {
            const fields = [
                "sample_name",
            ];
            if (projectObj?.metadata_form) {
                for (const field of projectObj?.metadata_form) {
                    fields.push(field.name)
                }
            }
            const header = fields.join("\t");

            setData(header)
        }
    }, [params])

    return <Modal
        onOk={async () => {
            if (params?.data) {
                await axios.post(`/batch-update-sample`, { content: data, project_id: projectObj?.project_id })
                message.success("Metadata updated")
            } else {
                await axios.post(`/batch-create-sample`, { content: data, project_id: projectObj?.project_id })
                message.success("Samples created")
            }
            onClose();
            callback && callback();
            
        }}
        onClose={onClose}
        open={visible} onCancel={onClose} width={"80%"}
        title="Edit Table">
        {/* {data} */}
        {/* {JSON.stringify(projectObj?.metadata_form)} */}
        <MonacoEditor value={data} onChange={setData}  ></MonacoEditor>

    </Modal>
}
