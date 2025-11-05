import { Button, Flex, Input, Table, Tabs, Tooltip } from "antd";
import { FC, useEffect, useMemo, useState } from "react";
import OpenFile from "../open-file";
import { useModal } from "@/hooks/useModal";
import { Bar, Column } from "@ant-design/plots";
import axios from "axios";

const AnalysisTask: FC<any> = ({ analysis_id, onClose }) => {
    const [chartData, setChartData] = useState<any>()
    const [loading, setLoading] = useState<any>(false)

    function parseRealtime(str: any) {
        const minMatch = str.match(/(\d+)m/);
        const secMatch = str.match(/(\d+)s/);
        const minutes = minMatch ? parseInt(minMatch[1]) : 0;
        const seconds = secMatch ? parseInt(secMatch[1]) : 0;
        return minutes * 60 + seconds;
    }

    const loadData = async () => {
        setLoading(true)
        const resp = await axios.get(`/analysis/analysis-progress/${analysis_id}`)
        const grouped: any = {};
        resp.data.forEach((item: any) => {
            const key = `${item.process}-${item.status}`;
            if (!grouped[key]) {
                grouped[key] = { process: item.process, status: item.status, count: 0 };
            }
            grouped[key].count += 1;
        });

        const statusData = Object.values(grouped);
        const timeData = resp.data.map((d: any) => ({
            process: d.process,
            task: d.task_id,
            realtime: parseRealtime(d.realtime),
            label: d.realtime
        }));
        setChartData({
            table: resp.data,
            statusData: statusData,
            timeData: timeData
        })
        setLoading(false)

    }





    useEffect(() => {
        loadData()
    }, [])
    return <div>

        {/* {JSON.stringify(chartData?.timeData)}  */}

        {chartData &&
            <Tabs
                tabBarExtraContent={<Flex gap={"small"}>
                    <Button size="small" color="cyan" variant="solid" onClick={loadData}>Refresh</Button>
                    {onClose && <Button size="small" color="red" variant="solid" onClick={onClose}>Close</Button>}

                </Flex>}
                defaultActiveKey="0"
                onChange={() => {
                    // setTimeout(() => {
                    //     window.dispatchEvent(new Event("resize"));
                    // }, );
                    window.dispatchEvent(new Event("resize"));
                }}
                items={[
                    {
                        key: "0",
                        label: "任务表格",
                        children: <TaskTable data={chartData?.table || []}></TaskTable>
                    }, {
                        key: "1",
                        label: "任务状态",
                        children: <BarChart data={chartData?.statusData || []}></BarChart>
                    }, {
                        key: "2",
                        label: "运行时间",
                        children: <ProcessChart data={chartData?.timeData || []}></ProcessChart>
                    }
                ]}></Tabs>
        }

    </div>
}
const ColumnChart: FC<any> = ({ data }) => {
    const config = {
        data: data,
        xField: 'task',          // 横轴是任务 ID
        yField: 'realtime',      // 纵轴是运行时间（秒）
        colorField: 'process',   // 按 process 分组
        // isGroup: true,
        // style: {
        //     maxWidth: 50,
        // },
        group: { padding: 0 },
        label: {
            text: (d: any) => d.label,
            textBaseline: 'bottom',
        },
    };

    return <>
        {/* {JSON.stringify(data)} */}
        <Column {...config} />
    </>
};


const ProcessChart: FC<any> = ({ data }) => {
    if (!data || (Array.isArray(data) && data.length === 0)) return null;
    const processes = Array.from(new Set(data.map((d: any) => d.process)));
    const [selectedProcess, setSelectedProcess] = useState(processes[0]);

    // 筛选出当前 process 的数据
    const filteredData = data.filter((d: any) => d.process === selectedProcess);

    return (
        <div>
            {/* {JSON.stringify(filteredData)} */}
            <div style={{ marginBottom: 16 }}>
                {processes.map((p: any) => (
                    <Button
                        size="small"
                        key={p}
                        type={p === selectedProcess ? 'primary' : 'default'}
                        onClick={() => setSelectedProcess(p)}
                        style={{ marginRight: 8 }}
                    >
                        {p}
                    </Button>
                ))}
            </div>

            <ColumnChart data={filteredData} />
        </div>
    );
}

const BarChart: FC<any> = ({ data }) => {
    if (!data || (Array.isArray(data) && data.length === 0)) return null;

    // };
    const config = {
        data: data,
        xField: 'process',
        yField: 'count',
        colorField: 'status',
        stack: true,
        sort: {
            reverse: true,
            by: 'y',
        },
        style: {
            maxWidth: 50,
        },
        // axis: {
        //     y: { labelFormatter: '~s' },
        //     x: {
        //         labelSpacing: 4,
        //         style: {
        //             labelTransform: 'rotate(90)',
        //         },
        //     },
        // },
    };

    return <Bar {...config} />
}

const TaskTable: FC<any> = ({ data }) => {
    // "task_id":1,"tag":"-","container":"192.168.3.60:5001/r-notebook-nf:x86_64-ubuntu-22.04","process":"metaphlan","native_id":219,"workdir":"/data/wangyang/nf_work/a4f4acb2-e119-4a9e-8c59-cdea6bff3df5/55/7068441d5359cffa8b7c1f3306658e","hash":"55/706844","name":"metaphlan (1)","status":"FAILED","exit":"1","realtime":"5.5s","%cpu":"-","cpus":10,"%mem":"-","memory":"10 GB","rss":"-","vmem":"-","read_bytes":"-","write_bytes":"-"},
    const { modal, openModal, closeModal } = useModal();
    const columns: any = [
        {
            title: 'process',
            dataIndex: 'process',
            key: 'process',
            ellipsis: true,
        }, {
            title: 'tag',
            dataIndex: 'tag',
            key: 'tag',
            ellipsis: true,
        }, {
            title: 'name',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            render: (text: any, record: any) => {
                return <Tooltip title={<>
                    <ul>
                        <li> {record.workdir} </li>
                    </ul>
                </>}>
                    {text}
                </Tooltip>
            }
        }, {
            title: 'container',
            dataIndex: 'container',
            key: 'container',
            ellipsis: true,
        }, {
            title: 'status',
            dataIndex: 'status',
            key: 'status',
            ellipsis: true,
        }, {
            title: 'realtime',
            dataIndex: 'realtime',
            key: 'realtime',
            ellipsis: true,
        }, {
            title: 'cpus',
            dataIndex: 'cpus',
            key: 'cpus',
            ellipsis: true,
            render: (text: any, record: any) => {
                return <Tooltip title={<>
                    {record["%cpu"]}
                </>}>
                    {text}
                </Tooltip>
            }
        }, {
            title: 'memory',
            dataIndex: 'memory',
            key: 'memory',
            ellipsis: true,
            width: 100,
            render: (text: any, record: any) => {
                return <Tooltip title={<>
                    {record["%mem"]}
                </>}>
                    {text}
                </Tooltip>
            }
        }, {
            title: "操作",
            key: "action",
            fixed: "right",
            ellipsis: true,
            width: 200,
            render: (_: any, record: any) => (
                <Flex gap={"small"}>

                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                        openModal("openFile", {
                            content: {
                                ".command.sh": `${record.workdir}/.command.sh`,
                                ".command.trace": `${record.workdir}/.command.trace`,
                                ".command.run": `${record.workdir}/.command.run`,
                                ".command.out": `${record.workdir}/.command.out`,
                                ".command.err": `${record.workdir}/.command.err`,
                                ".command.begin": `${record.workdir}/.command.begin`,
                            }
                        })

                    }}>查看</Button>
                </Flex>
            )
        }
    ]
    const [searchText, setSearchText] = useState("");
    const filteredData = useMemo(() => {
        if (!searchText) return data;
        return data.filter((item: any) =>
            Object.values(item).some((val) =>
                String(val).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [data, searchText]);

    return <>

        <Table
            title={() => (
                <Input.Search
                    size="small"
                    placeholder="搜索任务..."
                    allowClear
                    enterButton
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                />
            )}
            scroll={{ x: 'max-content', y: 55 * 5 }}
            size="small"
            bordered
            footer={() => `A total of ${filteredData.length} records`}
            // pagination={false}
            columns={columns} dataSource={filteredData} rowKey={(record: any) => record.task_id}></Table>
        {/* {JSON.stringify(data)} */}

        <OpenFile
            visible={modal.key == "openFile" && modal.visible}
            onClose={closeModal}
            params={modal.params}></OpenFile>
    </>
}


export default AnalysisTask