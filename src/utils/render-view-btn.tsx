import { Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
export const renderViewButton = (view: string, setView: (view: string) => void, viewName: string, label: string) => {
    const isActive = view === viewName;
    return (
        <Button
            size="small"
            color="cyan"
            variant={isActive ? "solid" : "outlined"}
            onClick={() => setView(viewName)}
        >
            {label}
        </Button>
    );
}

export const renderCloseViewButton = (view: string, setView: (view: string) => void, viewName: string, label: string, onClose: () => void) => {
    const isActive = view === viewName;
    return (
        <>
            <Button
                size="small"
                color="cyan"
                variant={isActive ? "solid" : "outlined"}
                onClick={() => setView(viewName)}
            >
                {label}
            </Button>
            <Button
                icon={<CloseOutlined></CloseOutlined>}
                size="small"
                color="cyan"
                variant={isActive ? "solid" : "outlined"}
                onClick={onClose}
            ></Button>
        </>
    );
}