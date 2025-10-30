import React, { FC, Suspense, useEffect, useState } from 'react';
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
import LanguageSelector from '@/components/setting-switcher/language'
import { useI18n } from '@/hooks/useI18n';
import { useMenuItems } from './psycmicrograph-menu'
const { Content, Sider } = Layout;
import ThemeSelector from '@/components/setting-switcher/theme'
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
    const dispatch = useDispatch()
    const [notificationApi, notificationContextHolder] = notification.useNotification();
    const [messageApi, messageContextHolder] = message.useMessage();
    const { modal, openModal, closeModal } = useModal();
    const [projectObj, setProjectObj] = useState<any>({})
    const [current, setCurrent] = useState('/');
    const [menus, setMenus] = useState<any>([])
    const [selectedKeyMap, setSelectedKeyMap] = useState<any>()
    const [projectList, setProjectList] = useState<any>()
    const { t, locale } = useI18n();
    const { theme } = useSelector((state: any) => state.user); // 'light' | 'dark'

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#001529' : '#fff'; // 深色/白色
    const textColor = isDark ? '#fff' : '#000';

    const openNotification = ({ type, message = "", description = "" }: { type: NotificationType, message: string, description?: string }) => {
        notificationApi[type]({
            message: message,
            description: description,
            placement: "bottomRight"
        });
    };
    const onMenuClick = (key: string) => {
        console.log(key)
        navigate(key);
        setCurrent(key)
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
        // loadProject()
        getSetting()
    }, [])
    // const {
    //     token: { colorBgContainer, borderRadiusLG },
    // } = theme.useToken();
    // const menu0: MenuItem[] =  useMenuItems()
    const menu0: any = [
        {
            key: "/",
            label: {
                zh_CN: "主页",
                en_US: "Home"
            }
        }, {
            key: `/entity-relation`,
            label: {
                zh_CN: "Microbial Graph",
                en_US: "Microbial Graph"
            }

        }, {

            key: `/digital-twins`,
            label: {
                zh_CN: "Digital Twins",
                en_US: "Digital Twins"
            }
        }, {
            key: `/entity-page`,
            label: {
                zh_CN: "Ontology",
                en_US: "Ontology"
            }

        }, {
            key: `/mining`,
            label: {
                zh_CN: "Mining",
                en_US: "Mining"
            }, children: [
                {
                    key: `/mining-data`,
                    label: {
                        zh_CN: "Mining Data",
                        en_US: "Mining Data"
                    },
                    hidden: true
                }
            ]

        },

    ]
    type MenuItem = {
        key: string;
        label: string;
        children?: MenuItem[];
        hidden?: boolean; // 新增字段
    };

    // const filterMenu = (menus: MenuItem[]): MenuItem[] => {
    //     return menus
    //         .filter(item => !item.hidden)
    //         .map(item => {
    //             const newItem: MenuItem = { ...item };
    //             if (newItem.children) {
    //                 newItem.children = filterMenu(newItem.children);
    //                 if (newItem.children.length === 0) delete newItem.children;
    //             }
    //             return newItem;
    //         });
    // };
    const filterMenu = (menus: MenuItem[]): MenuProps['items'] => {
        return menus
            .filter(item => !item.hidden)
            .map(item => {
                const newItem: MenuItem = { ...item } as MenuItem;
                newItem.label = item.label[locale]; // 选择当前语言
                if (item.children) {
                    newItem.children = filterMenu(item.children) as MenuItem[];
                    if (newItem.children.length === 0) delete newItem.children;
                }
                return newItem;
            });
    };
    // 生成 path -> selectedKey 映射表，同时按 key 长度降序排序
    const generateSelectedKeyMap = (menus: MenuItem[]) => {
        const map: { key: string; selectedKey: string }[] = [];

        const traverse = (items: MenuItem[], parentKey?: string) => {
            for (const item of items) {
                const mappedKey = item.hidden && parentKey ? parentKey : item.key;
                map.push({ key: item.key, selectedKey: mappedKey });

                if (item.children) {
                    traverse(item.children, mappedKey);
                }
            }
        };

        traverse(menus);

        // 按 key 长度降序排序，保证最长前缀匹配优先
        map.sort((a, b) => b.key.length - a.key.length);
        return map;
    };

    // 根据路径快速查找 selectedKey
    const getSelectedKey = (path: string, selectedKeyMap: { key: string; selectedKey: string }[]) => {
        for (const item of selectedKeyMap) {
            if (path.startsWith(item.key)) {
                return item.selectedKey;
            }
        }
        return "/"; // 默认回退首页
    };
    useEffect(() => {
        // const selectedKeyMap = generateSelectedKeyMap(menu0);
        // setSelectedKeyMap(selectedKeyMap)
        const finalMenu = filterMenu(menu0);
        setMenus(finalMenu)
    }, [locale])
    // 使用示例
    useEffect(() => {
        // const pathname = findSelectedKey(menu0, location.pathname)

        if (!selectedKeyMap) {
            const selectedKeyMap = generateSelectedKeyMap(menu0);
            setSelectedKeyMap(selectedKeyMap)
            const pathname = getSelectedKey(location.pathname, selectedKeyMap)
            console.log("not exist selectedKeyMap", pathname)
            setCurrent(pathname)
        } else {
            // console.log("exist selectedKeyMap",selectedKeyMap)
            const pathname = getSelectedKey(location.pathname, selectedKeyMap)
            setCurrent(pathname)

        }
    }, [location.pathname])


    // individual meta

    // const checkProject = () => {
    //     if (!project_id) {
    //         // console.log("checkProject",location.pathname)
    //         if (location.pathname.startsWith("/component") || location.pathname.startsWith("/analysis-report")) {
    //             return false
    //         }

    //         return true
    //     }
    //     return true
    // }

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
        <Layout style={{ minHeight: '100vh' }}>
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
            <Header style={{

                position: 'sticky',
                top: 0,
                zIndex: 10,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: bgColor,
                color: textColor,
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',


            }}>
                {/* 左侧：LOGO + 菜单 */}
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                    <div style={{ color: textColor, marginRight: '1rem', cursor: 'pointer' }} onClick={async () => {
                        await axios.get("/send-test")
                    }}>PsycMicroGraph</div>
                    <Menu
                        // theme="dark"
                        // theme="light"
                        mode="horizontal"
                        // defaultSelectedKeys={['1']}
                        selectedKeys={[current]}
                        items={menus}
                        onSelect={k => {
                            onMenuClick(k.key)
                            console.log(k)
                        }}
                        style={{ flex: 1, minWidth: 0, background: 'transparent' }}
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
                        {status === "open" ? "connected" : status === "connecting" ? "connecting" : "connection fail"}
                    </Button>
                    {/* <Button size="small" onClick={async () => {
                        await axios.get("/send-test")
                    }}>
                        sse
                    </Button> */}
                    {/* {checkProject() && <>
                        <ProjectComp  onProjectLoad={setProjectList} project_id={project_id} openModal={openModal} setProjectObj={setProjectObj}></ProjectComp>

                    </>} */}
                    <LanguageSelector></LanguageSelector>
                    <ThemeSelector></ThemeSelector>
                    {/* <Button color="primary"   onClick={() => {
                      openModal("context")
                    }}>
                        {project}/{namespace}
                    </Button> */}
                    {/* <Button>   {project}</Button> */}
                </Flex>
            </Header>
            <Layout
            // style={{ padding: '0 0 0  0', background: colorBgContainer, borderRadius: borderRadiusLG }}
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
                <Content style={{}}>
                    {/* {t('home')} */}
                    {/* <h1>{t("welcome")}</h1>
                <p>{t("description")}</p> */}
                    <Suspense key={location.key} fallback={<Test></Test>}>
                        <Outlet context={{ messageApi }} />
                        {/* {checkProject() ? <>
                            
                        </> : <Empty description="请先创建/选择项目" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                            <ProjectComp onProjectLoad={setProjectList}  project_id={project_id} openModal={openModal} setProjectObj={setProjectObj}></ProjectComp>

                           
                        </Empty>} */}
                    </Suspense>
                </Content>
            </Layout>

        </Layout>

    );
};

export default App;

const ProjectComp: FC<any> = ({ project_id, openModal, setProjectObj, onProjectLoad }) => {
    const [projectMap, setProjectMap] = useState<any>({})
    const [projectList, setProjectList] = useState<any>([])
    const dispatch = useDispatch()
    const [messageApi, messageContextHolder] = message.useMessage();

    const loadProject = async () => {
        const resp: any = await axios.get("/project/list-project")
        // console.log(resp.data)
        const projectList = resp.data.map((item: any) => {
            return {
                label: `${item.project_name}`,
                value: item.project_id
            }
        })
        setProjectList(projectList)
        if (onProjectLoad) {
            onProjectLoad(projectList)
        }
        const projectMap = resp.data.reduce((acc: any, item: any) => {
            acc[item.project_id] = item
            // item.metadata_form = JSON.parse(item.metadata_form)
            return acc
        }, {})
        setProjectMap(projectMap)
        setProjectObj(projectMap[project_id])
    }
    useEffect(() => {
        loadProject()
    }, [])
    return <>
        {messageContextHolder}
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
                                        openModal("project", { project_id: project_id })
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
                    console.log("onChange", value)

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



    </>
}