import React, { Suspense, useEffect, useState } from 'react';
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Breadcrumb, Button, Divider, Empty, Flex, Layout, Menu, message, notification, Popconfirm, Select, Skeleton, Space, Tag, theme, Tooltip } from 'antd';
import { NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router';
import { Header } from 'antd/es/layout/layout';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setProject } from '@/store/contextSlice'
import { setSetting, setSseData } from '@/store/globalSlice'
import useMessage from 'antd/es/message/useMessage';
import { useModal } from '@/hooks/useModal';
import ContextModal from '@/components/context';
import { useSSE } from '@/hooks/useSSE';
import { useSSEContext } from '@/context/sse/useSSEContext';
import FormProject from '@/components/form-project';
import { deleteProjectApi } from '@/api/project';
import { Project } from '@/type/project';

const { Content, Sider } = Layout;

type NotificationType = 'success' | 'info' | 'warning' | 'error';


const items2: MenuProps['items'] = [UserOutlined, LaptopOutlined, NotificationOutlined].map(
    (icon, index) => {
        const key = String(index + 1);

        return {
            key: `sub${key}`,
            icon: React.createElement(icon),
            label: `subnav ${key}`,
            children: Array.from({ length: 4 }).map((_, j) => {
                const subKey = index * 4 + j + 1;
                return {
                    key: subKey,
                    label: `option${subKey}`,
                };
            }),
        };
    },
);


const Test = () => {
    // useEffect(() => {
    //     console.log("wssssssssssssssssssss")
    // }, [])
    return <Skeleton active></Skeleton>
}
const App: React.FC = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const [leftMenus, setLeftMenus] = useState<any>([])
    const [projectList, setProjectList] = useState<any>([])
    const dispatch = useDispatch()
    const [notificationApi, notificationContextHolder] = notification.useNotification();
    const [messageApi, messageContextHolder] = message.useMessage();
    const { modal, openModal, closeModal } = useModal();
    const [projectMap, setProjectMap] = useState<any>({})
    const [projectObj, setProjectObj] = useState<any>({})

    const openNotification = ({ type, message = "", description = "" }: { type: NotificationType, message: string, description?: string }) => {
        notificationApi[type]({
            message: message,
            description: description,
            placement: "bottomRight"
        });
    };
    const { project: { project_id }, namespace: { name: namespace, namespaceKey: namespaceKey } } = useSelector((state: any) => state.context)
    console.log(project_id)
    const onMenuClick = (key: string) => {
        console.log(key)
        navigate(key);
    }
    const loadProject = async () => {
        const resp: any = await axios.get("/project/list-project")
        // console.log(resp.data)
        setProjectList(resp.data.map((item: any) => {
            return {
                label: `${item.project_name}`,
                value: item.project_id
            }
        }))
        const projectMap = resp.data.reduce((acc: any, item: any) => {
            acc[item.project_id] = item
            item.metadata_form = JSON.parse(item.metadata_form)
            return acc
        }, {})
        setProjectMap(projectMap)
        setProjectObj(projectMap[project_id])
    }
    const getSetting = async () => {
        const resp: any = await axios.get("/setting/get-setting")
        console.log(resp.data)
        dispatch(setSetting(resp.data))
    }
    const { eventSourceRef, status, reconnect } = useSSEContext();
    useEffect(() => {
        console.log("layout eventSourceRef", eventSourceRef)
        if (!eventSourceRef) return;

        const handler = (event: MessageEvent) => {

            const data = JSON.parse(event.data)
            // console.log("1111111111111111",data )
            // console.log(data)
            if (data.msgType === "process_end") {
                const analysis: any = data.analysis
                const msg = `${analysis.analysis_name}(${analysis.analysis_id}) 分析完成`
                openNotification({ type: "info", message: msg })
            }
            if (data.msgType === "analysis_result") {

                openNotification({ type: "info", message: data.msg })
            }

            if (data.msgType === "test") {
                openNotification({ type: "info", message: data.msg })
            }
            dispatch(setSseData(event.data))
        };

        eventSourceRef.current?.addEventListener('message', handler);

        return () => {
            console.log("removeEventListener")
            eventSourceRef.current?.removeEventListener('message', handler);
        };
    }, [eventSourceRef.current]);

    // const [eventSource, setEventSource] = useState<EventSource | null>(null);

    // useEffect(() => {
    //     const eventSource = new EventSource('/brave-api/sse-group');
    //     setEventSource(eventSource);
    //     eventSource.addEventListener('message', (event) => {

    // const data = JSON.parse(event.data)
    // // console.log(data )

    // if(data.msgType === "process_end"){
    //     const analysis:any = data.analysis
    //     const msg = `${analysis.analysis_name}(${analysis.analysis_id}) 分析完成`
    //     openNotification({ type: "info", message: msg })
    // }
    // if (data.msgType === "analysis_result"){

    //     openNotification({ type: "info", message: data.msg })
    // }
    // dispatch(setSseData(event.data))
    //     });

    //     // eventSource.onmessage = (event) => {
    //     //     //   setMessages(prev => [...prev, event.data]);

    //     // };

    //     eventSource.onerror = (err) => {
    //         console.error('SSE connection error:', err);
    //         eventSource.close(); // 可选：关闭连接
    //     };

    //     return () => {
    //         eventSource.close(); // 组件卸载时关闭连接
    //     };
    // }, [])

    // const eventSourceRef :React.RefObject < EventSource | null> = useSSE(openNotification)
    useEffect(() => {
        loadProject()
        getSetting()
    }, [])
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const menu0: MenuProps['items'] = [
        {
            key: "/",
            label: "项目介绍"
        },
        // {
        //     key: `/sample`,
        //     label: "检测样本"
        // }, 

        {
            key: `/pipeline-card`,
            label: "分析管道"
        },
        {
            key: `/software-card`,
            label: "分析软件"
        },
        {
            key: `/file-card`,
            label: "分析文件"
        },
        {
            key: `/script-card`,
            label: "分析脚本"
        },
        {
            key: `/pipeline-monitor-panal`,
            label: "管道监控"
        }, {
            key: `/analysis-result`,
            label: "分析结果"
        },{
            key: `/container-page`,
            label: "容器管理"
        }, {
            key: `/literature`,
            label: "文献资料"
        },
    ]
    const menu1: MenuProps['items'] = [
        {
            key: `${project_id}/sample-qc`,
            label: "样本质控"
        }, {
            key: `${project_id}/meta_genome/remove-host`,
            label: "去宿主"
        }, {
            key: `${project_id}/meta_genome/reads-based-abundance-analysis`,
            label: "基于Reads的丰度分析"
        }, {
            key: `${project_id}/meta_genome/recovering-mag`,
            label: "重构MAG"
        }, {
            key: `${project_id}/meta_genome/abundance-meta`,
            label: "丰度分析"
        }, {
            key: `${project_id}/meta_genome/function-analysis`,
            label: "功能分析"
        }, {
            key: `${project_id}/meta_genome/abundance`,
            label: "old丰度分析"
        }
    ]
    // individual meta
    const menu2: any = [
        // {
        //     key: `${project}/single_genome`,
        //     label: "项目介绍"
        // }, {
        //     key: `${project}/single_genome/sample`,
        //     label: "检测样本"
        // }, 
        {
            key: `${project_id}/single_genome/assembly`,
            label: "单菌组装"
        }, {
            key: `${project_id}/single_genome/gene-prediction`,
            label: "基因预测"
        }, {
            key: `${project_id}/single_genome/gene-annotation`,
            label: "基因注释"
        }, , {
            key: `${project_id}/single_genome/gene-expression`,
            label: "基因表达"
        },
        {
            key: `${project_id}/single_genome/mutation`,
            label: "突变检测"
        }, {
            key: `${project_id}/single_genome/mutation-compare`,
            label: "突变比较"
        }
    ]
    const checkProject = () => {
        if (!project_id) {
            // console.log("checkProject",location.pathname)
            if (location.pathname.startsWith("/component")) {
                return false
            }

            return true
        }
        return true
    }

    const items = [
        {
            key: "menu0",
            label: "实验设计"
        }, {
            key: "menu1",
            label: "宏基因组"
        }, {
            key: "menu2",
            label: "单菌基因组"
        },
    ]
    return (
        <Layout>
            {notificationContextHolder}
            {messageContextHolder}
            {/* <Header style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ color: "#fff",marginRight:"1rem" }} >BRAVE</div>
                <Menu
                
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={['1']}
                    items={menu0}
                    onSelect={k => onMenuClick(k.key)}
                    style={{ flex: 1, minWidth: 0 }}
                />
            </Header> */}
            <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* 左侧：LOGO + 菜单 */}
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#fff", marginRight: "1rem", whiteSpace: 'nowrap' }}>BRAVE</div>
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        defaultSelectedKeys={['1']}
                        items={menu0}
                        onSelect={k => onMenuClick(k.key)}
                        style={{ flex: 1, minWidth: 0 }}
                    />
                </div>

                {/* 右侧：项目选择 */}
                <Flex align="center" gap={"small"}>
                    {/* <Tag color={status === "open" ? "green" : status === "connecting" ? "blue" : "red"} style={{marginRight:"1rem"}}>
                    {status}
                   </Tag> */}
                    <Button size="small"
                        color={status === "open" ? "green" : status === "connecting" ? "blue" : "red"}
                        variant="solid"
                        onClick={reconnect} >
                        {status === "open" ? "已连接" : status === "connecting" ? "连接中" : "连接失败"}
                    </Button>
                    <Button size="small" onClick={async () => {
                        await axios.get("/send-test")
                    }}>
                        sse
                    </Button>

                    {Array.isArray(projectList) && projectList.length > 0 ? (
                        <Select
                            size='small'
                            // open={true}
                            dropdownRender={(menu) => <>
                                {menu}
                                <Divider style={{ margin: '8px 0' }} />
                                <Flex gap={"small"} justify={"space-between"} >
                                    <Button type='text' size="small" color="cyan" variant='solid' onClick={() => {
                                        openModal("project")
                                    }}>创建</Button>
                                    <Button type='text' size="small" color="cyan" variant='solid' onClick={() => {
                                        loadProject()
                                    }}>刷新</Button>
                                </Flex>

                                {project_id && (
                                    <>
                                        <Divider style={{ margin: '8px 0' }} />
                                        <Tooltip title={project_id} placement='bottom'> 

                                        <Flex gap={"small"} justify={"space-between"} >

                                            <Button type='text' size="small" color="cyan" variant='solid' onClick={() => {
                                                openModal("project", {project_id:project_id})
                                            }}>更新</Button>
                                            <Popconfirm title="确定删除吗？" onConfirm={async () => {
                                                await deleteProjectApi(project_id)
                                                messageApi.success("删除成功")
                                                dispatch(setProject({
                                                  
                                                }))
                                                loadProject()
                                            }}>
                                                <Button type='text' size="small" color="danger" variant='solid' >删除</Button>
                                            </Popconfirm>

                                        </Flex>
                                        </Tooltip>

                                    </>)}
                            </>}
                            onChange={(value: any) => {
                                console.log("onChange",value)
                               
                                dispatch(setProject({
                                    name: value,
                                    project_id: value,
                                }))
                                setProjectObj(projectMap[value])
                                // loadProject()
                            }}
                            value={project_id}
                            style={{ width: 120 }}
                            placeholder="选择项目"
                            options={projectList}
                        >
                        </Select>
                    ) : <Button size="small" color="cyan" variant='solid' onClick={() => {
                        openModal("project")
                    }}>创建项目</Button>}
                    {/* <Button color="primary"   onClick={() => {
                      openModal("context")
                    }}>
                        {project}/{namespace}
                    </Button> */}
                    {/* <Button>   {project}</Button> */}
                </Flex>
            </Header>
            <Layout
                style={{ padding: '24px 0', background: colorBgContainer, borderRadius: borderRadiusLG }}
            >
                {/* <Sider style={{ background: colorBgContainer }} width={120}>
                    <Menu
                        mode="inline"
                        onSelect={k => onMenuClick(k.key)}
           
                        style={{ height: '100%' }}
                        items={leftMenus}
                    />
                 

                </Sider> */}
                {/* {JSON.stringify(location)} */}
                {/* {JSON.stringify(projectObj)} */}
                <Content style={{ padding: '0 24px' }}>
                    <Suspense key={location.key} fallback={<Test></Test>}>
                        {checkProject() ? <>
                            <Outlet context={{ project:project_id,projectObj, messageApi }} />
                        </> : <Empty description="请先创建/选择项目" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                            <Button type='primary' onClick={() => {
                                openModal("project")
                            }}>创建项目</Button>
                        </Empty>}
                    </Suspense>
                </Content>
            </Layout>
            <FormProject callback={(project_id:any)=>{
                loadProject()
                dispatch(setProject({
                    name: project_id,
                    project_id: project_id,
                }))
            }} messageApi={messageApi} params={modal.params} visible={modal.visible && modal.key === "project"} onClose={closeModal} />
            {/* <ContextModal visible={modal.visible} onClose={closeModal} /> */}
        </Layout>

    );
};

export default App;