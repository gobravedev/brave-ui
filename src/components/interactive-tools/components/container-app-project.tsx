import { FC } from "react";
import ContainerApp from "./container-app";
import { useSelector } from "react-redux";

const ContainerAppProject: FC<any> = () => {

    return<>
        <ContainerApp  keys={[ "rstudio","code-server", "notebook"]}></ContainerApp>
    </>
}

export default ContainerAppProject;