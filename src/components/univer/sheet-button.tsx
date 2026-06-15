import { invoke } from "@/core/ui-system/invokeV2";
import { Button } from "antd";
import { FC, useEffect, useState } from "react";

const SheetButton: FC<any> = ({ path }) => {
    // js 安全的获取文件名称
    const [fileName, setFileName] = useState("Sheet Preview");
    useEffect(() => {
        if (path) {
            const name = path.split("/").pop();
            setFileName(name || "Sheet Preview");
        }
    }, [path])


    return (<>
        <Button size="small" onClick={() => {
            invoke.univerView.open({ path: path }, {
                width: "90%",
                title: fileName,
                footer: null,
            })
        }}>{fileName}</Button>
    </>)
}
export default SheetButton;