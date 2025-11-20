// https://reactrouter.com/start/data/installation
import { FC, lazy, useEffect, useState } from "react";
import Layout from "@/layout";
import MicroGraphLayout from '@/layout/psycmicrograph'
import {
    // createBrowserRouter,
    RouteObject,
    // RouterProvider,
    useRoutes,
} from "react-router";
import { setMenuItems, setSelectedKey } from '../store/menuSlice'


// const router = createBrowserRouter([
//     {
//         path: "/",
//         element: <Layout />,
//         children: [
//             {
//                 path: "/",
//                 Component: Project
//             }, {
//                 path: "/sample",
//                 Component:Sample

//             }
//         ]
//     },
// ]);
// const RenderRouter: FC = () => {

//     return <RouterProvider router={router} />;
// };
const Sample = lazy(() => import('@/pages/sample'));
const Project = lazy(() => import('@/pages/project'));

const Doc = lazy(() => import('@/pages/doc'));
const Mutation = lazy(() => import('@/pages/assembly-genome/mutation'));
const MutationCompare = lazy(() => import('@/pages/mutation-compare'));
const Abundance = lazy(() => import('@/pages/abundance'));
const Assembly = lazy(() => import('@/pages/assembly-genome/assembly'));
const GenePrediction = lazy(() => import('@/pages/assembly-genome/gene-prediction'));
const GeneAnnotation = lazy(() => import('@/pages/assembly-genome/gene-annotation'));
const GeneExpressison = lazy(() => import('@/pages/assembly-genome/gene-expression'));
const ReadsBasedAbundanceAnalysis = lazy(() => import('@/pages/meta-analysis/reads-based-abundance-analysis'));
const RemoveHost = lazy(() => import('@/pages/meta-analysis/remove-host'));
const AbundanceMeta = lazy(() => import('@/pages/meta-analysis/abundance'));
const RecoveringMag = lazy(() => import('@/pages/meta-analysis/recovering-mag'));
const SampleQC = lazy(() => import('@/pages/sample/sample-qc'));
const FunctionAnalysis = lazy(() => import('@/pages/meta-analysis/function-analysis'));
const PipelineCard = lazy(() => import('@/pages/pipeline-components/pipeline-card'));
const AnalysisResult = lazy(() => import('@/pages/analysis-result'));
const Literature = lazy(() => import('@/pages/literature'));
const PielineMonitorPanal = lazy(() => import('@/pages/pipeline-monitor-panal'));
const AnalysisSoftware = lazy(() => import('@/pages/pipeline-components/software'));
const AnalysisFile = lazy(() => import('@/pages/pipeline-components/file'));
const Script = lazy(() => import('@/pages/pipeline-components/script'));
const Pipeline = lazy(() => import('@/pages/pipeline-components'));
const PipelineComponentsCard = lazy(() => import('@/components/pipeline-components-card'));
const SoftwareAnalysisEditor = lazy(() => import('@/pages/software-analysis-editor'));
const AnalysisReport = lazy(() => import('@/pages/analysis-report'));
const EntityPage = lazy(() => import('@/pages/entity'));
const EntityRelation = lazy(() => import('@/pages/entity-relation'));
const PsycMicroGraphHome = lazy(()=>import("@/pages/psycmicrograph"))
const Test = lazy(()=>import("@/pages/test"))
const Mining = lazy(()=>import("@/pages/mining"))
const MiningData = lazy(()=>import("@/pages/mining/components/mining-data"))
const ToolKit = lazy(()=>import("@/pages/tool-kit"))
const DigitalTwins = lazy(()=>import("@/pages/digital-twins"))
const ContainerPage = lazy(() => import('@/pages/container'));
const Files = lazy(() => import('@/pages/files'));
const InteractiveTools = lazy(() => import('@/pages/interactive-tools'));
import axios from "axios";
import { Skeleton } from "antd";
import { useDispatch } from "react-redux";

const rootElement = document.getElementById("root")!;
const appType = rootElement.getAttribute("data-app");
console.log("data-app: ",appType)
let routes: RouteObject[] = []
if (appType == "index") {
    const children = [

        {
            path: "/",
            element: <Project />
        }, {
            path: "/sample",
            element: <Sample />
        }, {
            path: "/sample-qc",
            element: <SampleQC />
        }, {
            path: "/analysis-result",
            element: <AnalysisResult />
        }, {
            path: "/literature",
            element: <Literature />
        }, {
            path: "/tasks",
            element: <PielineMonitorPanal />
        }, {
            path: "/container-page",
            element: <ContainerPage />
        },
        {
            path: "/analysis-report",
            element: <AnalysisReport />
        },
        {
            path: "/pipeline-card",
            element: <PipelineComponentsCard 
            params={{ component_type: "pipeline" }} />
        },
        {
            path: "/tool-kit",
            element: <ToolKit />
        },{
            path: "/files",
            element: <Files />
        },
        {
            path: "/software-card",
            element: <PipelineComponentsCard
                map={(item: any) => ({
                    ...item,
                    name: item.component_name,
                    path: `/software/${item.component_id}`,
                 
                })}
                params={{ component_type: "software" }} />
        }, {
            path: "/file-card",
            element: <PipelineComponentsCard
                map={(item: any) => ({
                     ...item,
                    name: item.component_name,
                    path: `/software/${item.component_id}`,
                })}
                params={{ component_type: "file" }} />
        }, {
            path: "/script-card",
            element: <PipelineComponentsCard
                map={(item: any) => ({
                    ...item,
                    name: item.component_name,
                    path: `/software/${item.component_id}`,
                })}
                params={{ component_type: "script" }} />
        },
        {
            path: "/software-analysis-editor/:analysisId",
            element: <SoftwareAnalysisEditor />
        },

        {
            path: "/component/:component_type/:component_id",
            element: <Pipeline             />
        }, {
            path: "/software/:softwareId",
            element: <AnalysisSoftware />
        },
        {
            path: "/file/:fileId",
            element: <AnalysisFile />
        },
        {
            path: "/script/:scriptId",
            element: <Script />
        }, {
            path: "/entity-page",
            element: <EntityPage />
        }, {
            path: "/entity-relation",
            element: <EntityRelation />
        },



        {
            path: "/:project/meta_genome/reads-based-abundance-analysis",
            element: <ReadsBasedAbundanceAnalysis />
        }, {
            path: "/:project/meta_genome/remove-host",
            element: <RemoveHost />
        }, {
            path: "/:project/meta_genome/recovering-mag",
            element: <RecoveringMag />
        },
        {
            path: "/:project/meta_genome/abundance-meta",
            element: <AbundanceMeta />
        },
        {
            path: "/:project/meta_genome/abundance",
            element: <Abundance />
        }, {
            path: "/:project/meta_genome/function-analysis",
            element: <FunctionAnalysis />
        },

        {
            path: "/:project/single_genome/mutation",
            element: <Mutation />
        }, {
            path: "/:project/single_genome/mutation-compare",
            element: <MutationCompare />
        }, {
            path: "/:project/single_genome/assembly",
            element: <Assembly />
        }, {
            path: "/:project/single_genome/gene-prediction",
            element: <GenePrediction />
        }, {
            path: "/:project/single_genome/gene-annotation",
            element: <GeneAnnotation />
        }, {
            path: "/:project/single_genome/gene-expression",
            element: <GeneExpressison />
        },{
            path: "/interactive-tools",
            element: <InteractiveTools />
        }
        
    ]
    routes = [
        {
            path: "/doc",
            element: <Doc />
        }, {
            path: "/",
            element: <Layout />,
            children: [
                ...children,
            ]
        },{
            path: "/test",
            element: <Test />
        },
    ]
} else if (appType == "micrograph") {
    const children = [
       
        {
            path: "/",
            element: <PsycMicroGraphHome />
        }, {
            path: "/sample",
            element: <Sample />
        }, {
            path: "/sample-qc",
            element: <SampleQC />
        }, {
            path: "/analysis-result",
            element: <AnalysisResult />
        }, {
            path: "/literature",
            element: <Literature />
        }, {
            path: "/pipeline-monitor-panal",
            element: <PielineMonitorPanal />
        }, {
            path: "/container-page",
            element: <ContainerPage />
        },
        {
            path: "/analysis-report",
            element: <AnalysisReport />
        },
        {
            path: "/pipeline-card",
            element: <PipelineComponentsCard params={{ component_type: "pipeline" }} />
        },

        {
            path: "/software-card",
            element: <PipelineComponentsCard
                map={(item: any) => ({
                    id: item.id,
                    component_id: item.component_id,
                    name: item.component_name,
                    category: item.category,
                    img: item.img,
                    tags: item.tags,
                    description: item.description,
                    order: item.order_index,
                    path: `/software/${item.component_id}`,
                    namespace: item.namespace,
                    namespace_name: item.namespace_name
                })}
                params={{ component_type: "software" }} />
        }, {
            path: "/file-card",
            element: <PipelineComponentsCard
                map={(item: any) => ({
                    id: item.id,
                    component_id: item.component_id,
                    name: item.component_name,
                    category: item.category,
                    img: item.img,
                    tags: item.tags,
                    description: item.description,
                    order: item.order_index,
                    path: `/file/${item.component_id}`,
                    namespace: item.namespace,
                    namespace_name: item.namespace_name
                })}
                params={{ component_type: "file" }} />
        }, {
            path: "/script-card",
            element: <PipelineComponentsCard
                map={(item: any) => ({
                    id: item.id,
                    component_id: item.component_id,
                    name: item.component_name,
                    category: item.category,
                    img: item.img,
                    tags: item.tags,
                    description: item.description,
                    order: item.order_index,
                    path: `/script/${item.component_id}`,
                    namespace: item.namespace,
                    namespace_name: item.namespace_name
                })}
                params={{ component_type: "script" }} />
        },
        {
            path: "/software-analysis-editor/:analysisId",
            element: <SoftwareAnalysisEditor />
        },

        {
            path: "/component/:component_type/:component_id",
            element: <Pipeline />
        }, {
            path: "/software/:softwareId",
            element: <AnalysisSoftware />
        },
        {
            path: "/file/:fileId",
            element: <AnalysisFile />
        },
        {
            path: "/script/:scriptId",
            element: <Script />
        }, {
            path: "/entity-page",
            element: <EntityPage />
        }, {
            path: "/entity-relation",
            element: <EntityRelation />
        }, {
            path: "/mining",
            element: <Mining />
        },{
            path: "/mining-data/:entity_id",
            element: <MiningData />
        },{
            path: "/digital-twins",
            element: <DigitalTwins />
        },
        
        

        {
            path: "/:project/meta_genome/reads-based-abundance-analysis",
            element: <ReadsBasedAbundanceAnalysis />
        }, {
            path: "/:project/meta_genome/remove-host",
            element: <RemoveHost />
        }, {
            path: "/:project/meta_genome/recovering-mag",
            element: <RecoveringMag />
        },
        {
            path: "/:project/meta_genome/abundance-meta",
            element: <AbundanceMeta />
        },
        {
            path: "/:project/meta_genome/abundance",
            element: <Abundance />
        }, {
            path: "/:project/meta_genome/function-analysis",
            element: <FunctionAnalysis />
        },

        {
            path: "/:project/single_genome/mutation",
            element: <Mutation />
        }, {
            path: "/:project/single_genome/mutation-compare",
            element: <MutationCompare />
        }, {
            path: "/:project/single_genome/assembly",
            element: <Assembly />
        }, {
            path: "/:project/single_genome/gene-prediction",
            element: <GenePrediction />
        }, {
            path: "/:project/single_genome/gene-annotation",
            element: <GeneAnnotation />
        }, {
            path: "/:project/single_genome/gene-expression",
            element: <GeneExpressison />
        }
    ]
    routes = [
        {
            path: "/",
            element: <MicroGraphLayout />,
            children: [
                ...children,
            ]
        }, {
            path: "/test",
            element: <Test />
        },
    ]
}

import { listPipeline } from '@/api/pipeline'
import path from "path";
const RenderRouter: FC = () => {
    // const [routes, setRoutes] = useState<RouteObject[] | null>([]);
    // const dispatch = useDispatch()



    // const loadData = async () => {
    //     const data:any = await listPipeline(dispatch)
    //     const routes = data.flatMap((group:any) =>
    //         group.items.map((item:any) => ({
    //             path: `/${item.path}`,
    //             element: <Pipeline name={item.path} />
    //         }))
    //     );
    //     // console.log(routes)
    //     // const routes = resp.data.pipeline.map((item: any) => {
    //     //     return {
    //     // path: `/:project/${item.path}`,
    //     // element: <Pipeline name={item.path} />
    //     //     }
    //     // })
    //     const router: RouteObject[] = [
    //         {
    //             path: "/",
    //             element: <Layout />,
    //             children: [
    //                 ...routes,
    //                 ...childern,
    //             ]
    //         },
    //     ]
    //     // console.log(router)
    //     setRoutes(router)

    // }
    // useEffect(() => {
    //     loadData()
    //     // console.log("1111111111111111")
    // }, [])
    // const element = routes ? useRoutes(routes) : null;

    // const routes: RouteObject[] = [
    // {
    //     path: "/",
    //     element: <Layout />,
    //     children: [
    //         ...childern,
    //     ]
    // },
    // ]

    // const element = useRoutes(router);
    const element = useRoutes(routes)

    return element;
    // return element;
};

export default RenderRouter;