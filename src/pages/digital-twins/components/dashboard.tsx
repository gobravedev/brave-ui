import React, { Children, useEffect, useMemo, useRef, useState } from "react";
import { Card, Row, Col, Space, Button, Descriptions, Statistic, Progress, Tabs, Form, Slider, Steps, Tag, Flex, Select, Divider } from "antd";
import { Line, DualAxes, Gauge, Pie } from "@ant-design/plots";
import dayjs from "dayjs";
import { fa } from "@faker-js/faker";
import { json } from "stream/consumers";
import ChatView from "@/pages/entity-relation/components/chat";
import AIChat from '@/components/chat'
import { ClusterOutlined, FireOutlined, HeartOutlined, ReloadOutlined, SmileOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { ExperimentOutlined, DatabaseOutlined, CloudSyncOutlined, LineChartOutlined } from "@ant-design/icons";
// Digital Twin Dashboard: shows time-series for weight, temp, BMI, BP, HR, activity and microbiome metrics
import humann from "@/assets/human.svg";
type DataPoint = {
    ts: string; // ISO timestamp
    weight: number; // kg
    temperature: number; // °C
    bmi: number; // kg/m2
    systolic: number; // mmHg
    diastolic: number; // mmHg
    heartRate: number; // bpm
    steps: number; // steps per day
    stoolFreq: number; // times per day
    shannon: number; // microbiome diversity index
    scfa: number; // arbitrary unit
    crp: number; // mg/L inflammation marker
};

const now = () => dayjs();

function generateInitialData(days = 30): DataPoint[] {
    const out: DataPoint[] = [];
    let weight = 70;
    let bmi = 24;
    for (let i = days - 1; i >= 0; i--) {
        const ts = now().subtract(i, "day").startOf("day").add(Math.random() * 12, "hour").toISOString();
        // simulate small day-to-day variability
        weight += (Math.random() - 0.45) * 0.3;
        bmi = +(weight / 1.72 / 1.72).toFixed(2); // assume height 1.72m
        const temperature = +(36 + (Math.random() - 0.5) * 0.4).toFixed(2);
        const systolic = Math.round(110 + Math.random() * 20 + (Math.sin(i / 3) * 4));
        const diastolic = Math.round(70 + Math.random() * 12 + (Math.cos(i / 5) * 2));
        const heartRate = Math.round(60 + Math.random() * 20 + (Math.sin(i / 4) * 3));
        const steps = Math.round(2000 + Math.random() * 8000);
        const stoolFreq = +(0.8 + Math.abs(Math.round(Math.random() * 2 + (Math.sin(i) * 0.3)))).toFixed(1);
        const shannon = +(3.5 + (Math.random() - 0.5) * 0.6).toFixed(2);
        const scfa = +(40 + (Math.random() - 0.5) * 10).toFixed(1);
        const crp = +(1 + Math.random() * 3).toFixed(2);

        out.push({
            ts,
            weight: +weight.toFixed(1),
            temperature,
            bmi,
            systolic,
            diastolic,
            heartRate,
            steps,
            stoolFreq,
            shannon,
            scfa,
            crp,
        });
    }
    return out;
}

export default function GutTwinDashboard({ height }: { height?: number }) {
    const [data, setData] = useState<DataPoint[]>(() => generateInitialData(10));
    const [running, setRunning] = useState(false);

    // Simulate live incoming daily datapoint every 2 seconds (for demo)
    useEffect(() => {
        if (!running) return;
        const timer = setInterval(() => {
            setData((prev) => {
                const last = prev[prev.length - 1];
                const ts = now().add(1, "day").toISOString();
                // small drift
                const weight = +(last.weight + (Math.random() - 0.5) * 0.3).toFixed(1);
                const bmi = +(weight / 1.72 / 1.72).toFixed(2);
                const temperature = +(36 + (Math.random() - 0.5) * 0.6).toFixed(2);
                const systolic = Math.round(110 + Math.random() * 20);
                const diastolic = Math.round(68 + Math.random() * 12);
                const heartRate = Math.round(58 + Math.random() * 28);
                const steps = Math.round(1000 + Math.random() * 9000);
                const stoolFreq = +(0.7 + Math.abs(Math.round(Math.random() * 2))).toFixed(1);
                const shannon = +(3.5 + (Math.random() - 0.5) * 0.6).toFixed(2);
                const scfa = +(40 + (Math.random() - 0.5) * 10).toFixed(1);
                const crp = +(1 + Math.random() * 4).toFixed(2);

                const next: DataPoint = {
                    ts,
                    weight,
                    temperature,
                    bmi,
                    systolic,
                    diastolic,
                    heartRate,
                    steps,
                    stoolFreq,
                    shannon,
                    scfa,
                    crp,
                };
                const newData = [...prev.slice(1), next];
                return newData;
            });
        }, 2000);
        return () => clearInterval(timer);
    }, [running]);

    // Prepare data for individual charts
    const tsFormat = (iso: string) => dayjs(iso).format("MM-DD");

    const weightSeries = useMemo(() => data.map((d) => ({ date: tsFormat(d.ts), value: d.weight })), [data]);
    const tempSeries = useMemo(() => data.map((d) => ({ date: tsFormat(d.ts), value: d.temperature })), [data]);
    const hrSeries = useMemo(() => data.map((d) => ({ date: tsFormat(d.ts), value: d.heartRate })), [data]);
    const stepsSeries = useMemo(() => data.map((d) => ({ date: tsFormat(d.ts), value: d.steps })), [data]);
    const stoolSeries = useMemo(() => data.map((d) => ({ date: tsFormat(d.ts), value: d.stoolFreq })), [data]);

    const bpSeries1 = useMemo(() => data.map((d) => ({ date: tsFormat(d.ts), value: d.systolic })), [data]);
    const bpSeries2 = useMemo(() => data.map((d) => ({ date: tsFormat(d.ts), value: d.diastolic })), [data]);

    const shannonSeries = useMemo(() => data.map((d) => ({ date: tsFormat(d.ts), value: d.shannon })), [data]);


    const species = ["Bacteroides", "Firmicutes", "Actinobacteria", "Proteobacteria"];
    const speciesAbundance: Record<string, number> = {};
    let total = 0;
    species.forEach((sp) => {
        const val = Math.random() * 100;
        speciesAbundance[sp] = val;
        total += val;
    });
    // 标准化到百分比
    Object.keys(speciesAbundance).forEach((sp) => {
        speciesAbundance[sp] = +(speciesAbundance[sp] / total * 100).toFixed(1);
    });
    // Configs
    const lineConfig = (series: { date: string; value: number }[]) => ({
        data: series,
        padding: "auto",
        height: 200,
        xField: "date",
        yField: "value",
        smooth: true,
        xAxis: { tickCount: 6 },
        meta: { value: { alias: "value" } },
        tooltip: { showCrosshairs: true, shared: true },
        point: { size: 2 },
        animation: false,
    });

    const bpConfig = {
        height: 200,
        data: data.map((d) => ({ date: tsFormat(d.ts), systolic: d.systolic, diastolic: d.diastolic })),
        xField: 'date',
        legend: true,
        children: [
            {
                type: 'line',
                yField: 'systolic',
                style: {
                    stroke: '#5B8FF9',
                    lineWidth: 2,
                },
                axis: {
                    y: {
                        title: 'systolic',
                        style: { titleFill: '#5B8FF9' },
                    },
                },
            },
            {
                type: 'line',
                yField: 'diastolic',
                style: {
                    stroke: '#5AD8A6',
                    lineWidth: 2,
                },
                axis: {
                    y: {
                        position: 'right',
                        title: 'diastolic',
                        style: { titleFill: '#5AD8A6' },
                    },
                },
            },
        ],
    } as const;

    // Latest snapshot (for gauges and quick stats)
    const latest = data[data.length - 1];

    const bmiGauge = {
        percent: Math.min(1, Math.max(0, (latest.bmi - 15) / (35 - 15))),
        range: [0, 0.5, 1],
        statistic: {
            title: { formatter: () => "BMI" },
            content: { formatter: () => `${latest.bmi.toFixed(1)}` },
        },
    };

    const scores = {
        total: 78,
        temperature: 85,
        bmi: 70,
        heartRate: 90,
        bloodPressure: 65,
        steps: 80,
        stoolFreq: 75
    }


    return (
        <Card size="small"

            style={{
                height: `${height}px`
            }}
            styles={{
                body: {
                    padding: "0.5rem",
                }
            }}>
            <Row gutter={[16, 16]}>
                <Col span={8} style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(0, 0, 0, 0.45) transparent",
                    height: "85vh",
                    overflowX: "hidden",
                    overflowY: "auto"
                }}>

                    <Card title="基本信息&最新指标快览"

                        variant="borderless"
                        size="small" style={{

                            boxShadow: "none"
                        }}>

                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Card title="基本信息" size="small"
                                >
                                    <Descriptions column={2} size="small">
                                        <Descriptions.Item label="姓名">张三</Descriptions.Item>
                                        <Descriptions.Item label="年龄">35岁</Descriptions.Item>
                                        <Descriptions.Item label="性别">男性</Descriptions.Item>
                                        <Descriptions.Item label="体温">{latest.temperature} °C</Descriptions.Item>
                                        <Descriptions.Item label="体重">{latest.weight} kg</Descriptions.Item>
                                        <Descriptions.Item label="BMI">{latest.bmi} kg/m²</Descriptions.Item>
                                        <Descriptions.Item label="心率">{latest.heartRate} bpm</Descriptions.Item>
                                        <Descriptions.Item label="收缩压">{latest.systolic} mmHg</Descriptions.Item>
                                        <Descriptions.Item label="舒张压">{latest.diastolic} mmHg</Descriptions.Item>
                                        <Descriptions.Item label="步数">{latest.steps} steps/day</Descriptions.Item>
                                        <Descriptions.Item label="排便频率">{latest.stoolFreq} times/day</Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <HealthScoreCard ></HealthScoreCard>
                            </Col>
                            <Col span={12}>
                                <Card title="菌群组成" size="small" >
                                    <Pie
                                        data={Object.entries(speciesAbundance).map(([type, value]) => ({ type, value }))}
                                        angleField="value"
                                        colorField="type"
                                        height={200}
                                        radius={1}
                                        label={{
                                            text: 'type',
                                            position: 'outside',
                                            textAlign: 'center',
                                            transform: [
                                                {
                                                    type: 'contrastReverse',
                                                },
                                            ],
                                            // render: customLabel,
                                        }}
                                        legend={false}
                                    />
                                </Card>
                            </Col>


                        </Row>
                    </Card>
                    <Card title="时间维度变化曲线"
                        variant="borderless"
                        style={{ boxShadow: "none" }}
                        size="small">
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Card size="small" title="Shannon 多样性指数">
                                    <Line
                                        {...lineConfig(shannonSeries)}
                                    />
                                </Card>
                            </Col>

                            <Col span={12}>
                                <Card size="small" title="体重 (kg)">
                                    <Line {...lineConfig(weightSeries)} />
                                </Card>
                            </Col>

                            <Col span={12}>
                                <Card size="small" title="体温 (°C)">
                                    <Line {...lineConfig(tempSeries)} />
                                </Card>
                            </Col>

                            <Col span={12}>
                                <Card size="small" title="心率 (bpm)">
                                    <Line {...lineConfig(hrSeries)} />
                                </Card>
                            </Col>

                            <Col span={12}>
                                <Card size="small" title="步数 (daily)">
                                    <Line {...lineConfig(stepsSeries)} />
                                </Card>
                            </Col>

                            <Col span={12}>
                                <Card size="small" title="血压 (收缩 / 舒张 mmHg)">
                                    <DualAxes {...bpConfig} />
                                </Card>
                            </Col>

                            <Col span={12}>
                                <Card size="small" title="排便频率 (times/day)">
                                    <Line {...lineConfig(stoolSeries)} />
                                </Card>
                            </Col>


                        </Row>
                    </Card>
                </Col>
                <Col span={10}>

                    <Tabs
                        size="small"
                        items={[
                            {
                                key: '0',
                                label: `干预设置与预测`,
                                children: <>
                                    <GutTwinIntervention></GutTwinIntervention>

                                </>
                            }, {
                                key: '1',
                                label: `执行干预`,
                                children: <div style={{ padding: "1rem" }}>
                                    <Steps
                                        direction="vertical"
                                        size="small"
                                        current={2}
                                        items={[
                                            {
                                                title: "干预方案设计",
                                                icon: <ExperimentOutlined />,
                                                description: (
                                                    <div>
                                                        <p>
                                                            ✅
                                                            膳食纤维摄入 <Tag color="blue">70 g/day</Tag>，
                                                            益生菌剂量 <Tag color="green">50亿 CFU/day</Tag>，
                                                            运动 <Tag color="orange">30 分钟/天</Tag>
                                                        </p>
                                                        <Button type="link" size="small">
                                                            查看营养细节
                                                        </Button>
                                                    </div>
                                                ),
                                            },
                                            {
                                                title: "采集多源数据",
                                                icon: <DatabaseOutlined />,
                                                description: (
                                                    <div>
                                                        <ul style={{ marginBottom: 6 }}>
                                                            <li>📋 问卷：饮食、睡眠、压力等</li>
                                                            <li>⌚ 智能设备：步数、心率、体重</li>
                                                            <li>🧫 样本采集：粪便 / 血液 / 影像数据</li>
                                                        </ul>
                                                        <Progress percent={45} size="small" />
                                                    </div>
                                                ),
                                            },
                                            {
                                                title: "同步数字孪生体",
                                                icon: <CloudSyncOutlined />,
                                                description: (
                                                    <div>
                                                        <p>正在同步最新健康数据 → 孪生模型</p>
                                                        <Tag color="processing">同步中...</Tag>
                                                    </div>
                                                ),
                                            },
                                            {
                                                title: "再训练模型",
                                                icon: <ReloadOutlined />,
                                                description: (
                                                    <div>
                                                        <p>重新训练微生物群个体模型以更新响应特征。</p>
                                                        <Button size="small" type="primary" disabled>
                                                            启动训练
                                                        </Button>
                                                    </div>
                                                ),
                                            },
                                            {
                                                title: "更新预测与评估",
                                                icon: <LineChartOutlined />,
                                                description: (
                                                    <div>
                                                        <p>
                                                            根据新模型输出更新预测：肠道多样性 ↑、
                                                            炎症标志物 ↓、代谢健康评分 ↑。
                                                        </p>
                                                        <Button size="small" type="primary" disabled>查看预测报告</Button>
                                                    </div>
                                                ),
                                            },
                                        ]}
                                    />
                                </div>
                            }, {
                                key: '2',
                                label: `肠菌检测报告`,
                                children: <>

                                </>
                            }, {
                                key: '3',
                                label: `基因检测报告`,
                                children: <>

                                </>
                            }, {
                                key: '4',
                                label: `影像检测报告`,
                                children: <>

                                </>
                            }
                        ]}
                    ></Tabs>


                </Col>
                <Col span={6}>
                    {/* <Card title="基本信息" size="small" style={{ boxShadow: "none" }}
                        variant="borderless">
                        <Descriptions column={2} size="small">
                            <Descriptions.Item label="姓名">张三</Descriptions.Item>
                            <Descriptions.Item label="年龄">35岁</Descriptions.Item>
                            <Descriptions.Item label="性别">男性</Descriptions.Item>
                           
                        </Descriptions>
                    </Card> */}
                    <Card
                        style={{ boxShadow: "none" }}
                        variant="borderless"
                        title="LLM问答"
                        size="small"

                        styles={{
                            body: {
                                height: "80vh",
                                padding: 0
                            }
                        }}>
                        <AIChat questions={[
                            "请分析最近一周的体重变化趋势？",
                            "如果增加膳食纤维摄入，一个月后肠道菌群会发生什么变化？",
                            "如果服用降压药物，一个月后血压可能会有怎样的变化？",
                            "如何通过运动改善肠道菌群？"
                        ]}></AIChat>

                    </Card>

                </Col>
            </Row>
        </Card>
    );
}



const HealthScoreCard = ({ score = 80 }: any) => {
    // 根据分数设置颜色
    const getColor = (value: any) => {
        if (value >= 80) return "#52c41a"; // 绿色
        if (value >= 60) return "#faad14"; // 黄色
        return "#f5222d"; // 红色
    };

    return (
        <Card
            title="综合健康评分"
            size="small"
            style={{
                height: "100%",
            }}
            styles={{
                body: {
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",

                }
            }}
        >
            {/* 圆形进度条 + 数字 */}
            <Progress
                type="circle"
                percent={score}
                strokeColor={getColor(score)}
                width={150}
                format={() => (
                    <Statistic
                        value={score}
                        valueStyle={{
                            fontSize: 32,
                            fontWeight: "bold",
                            color: getColor(score),
                        }}
                    />
                )}
            />
            {/* <div style={{ marginTop: 16, fontSize: 14, color: "#888" }}>
        
      </div> */}
        </Card>
    );
};

function generateMicrobiomeData(days = 30) {
    const species = ["Bacteroides", "Firmicutes", "Actinobacteria", "Proteobacteria"];
    const data: any = [];

    for (let i = days - 1; i >= 0; i--) {
        const ts = dayjs().subtract(i, "day").toISOString();
        const shannon = +(3.0 + Math.random() * 1.5).toFixed(2);
        const scfa = +(30 + Math.random() * 20).toFixed(1);

        const speciesAbundance: Record<string, number> = {};
        let total = 0;
        species.forEach((sp) => {
            const val = Math.random() * 100;
            speciesAbundance[sp] = val;
            total += val;
        });
        // 标准化到百分比
        Object.keys(speciesAbundance).forEach((sp) => {
            speciesAbundance[sp] = +(speciesAbundance[sp] / total * 100).toFixed(1);
        });

        data.push({ ts, shannon, scfa, speciesAbundance });
    }
    return data;
}





import { Radar } from "@ant-design/plots";

const HealthRadar = ({ data }: any) => {
    // data 示例结构
    // data = {
    //   temperatureScore: 80,
    //   bmiScore: 70,
    //   heartRateScore: 90,
    //   bloodPressureScore: 60,
    //   stepsScore: 85,
    //   stoolFreqScore: 75
    // }

    // 转成雷达图格式
    const radarData = [
        { item: "体温", score: data.temperatureScore },
        { item: "BMI", score: data.bmiScore },
        { item: "心率", score: data.heartRateScore },
        { item: "血压", score: data.bloodPressureScore },
        { item: "步数", score: data.stepsScore },
        { item: "排便频率", score: data.stoolFreqScore },
    ];

    const config = {
        data: radarData,
        xField: "item",
        yField: "score",
        seriesField: "item", // 每个指标单独显示
        meta: {
            score: {
                alias: "健康评分",
                min: 0,
                max: 100,
            },
        },
        xAxis: {
            line: null,
            tickLine: null,
        },
        yAxis: {
            line: null,
            tickLine: null,
            grid: {
                line: {
                    type: "line",
                    style: {
                        stroke: "#e0e0e0",
                        lineDash: [4, 4],
                    },
                },
            },
        },
        point: {
            size: 3,
        },
        area: {},
        smooth: true,
    };

    return <Radar {...config} />;
};





const GutTwinIntervention2 = () => {
    const [params, setParams] = useState({ fiber: 50, probiotic: 30 });


    return (
        <>
            <Row gutter={16}>
                <Col span={8}>
                    <Card
                        extra={<Flex gap={"small"}>
                            <Button size="small" onClick={() => setParams({ fiber: 50, probiotic: 30 })}>重置</Button>
                            <Button size="small" type="primary">
                                启动模拟
                            </Button>
                        </Flex>}
                        title="干预设置" size="small">
                        <Form layout="vertical">
                            <Form.Item label="膳食纤维摄入">
                                <Slider
                                    min={0}
                                    max={100}
                                    value={params.fiber}
                                    onChange={(v) => setParams({ ...params, fiber: v })}
                                />
                            </Form.Item>

                            <Form.Item label="益生菌剂量">
                                <Slider
                                    min={0}
                                    max={100}
                                    value={params.probiotic}
                                    onChange={(v) => setParams({ ...params, probiotic: v })}
                                />
                            </Form.Item>

                            <Form.Item label="运动频率">
                                <Select defaultValue="moderate">
                                    <Select.Option value="low">低</Select.Option>
                                    <Select.Option value="moderate">中</Select.Option>
                                    <Select.Option value="high">高</Select.Option>
                                </Select>
                            </Form.Item>

                        </Form>
                    </Card>

                </Col>

                <Col span={16}>

                </Col>


            </Row>


        </>
    );
};
import "./DigitalTwin.css";


const GutTwinIntervention = () => {
    const [params, setParams] = useState({
        fiber: 50,
        probiotic: 30,
        exercise: "moderate",
    });
    const [predicted, setPredicted] = useState({
        microbiome: 80,
        inflammation: 20,
        metabolism: 85,
        diversity: 70,
        mood: 90,
    });

    const onSimulate = () => {
        // 模拟预测结果变化
        setPredicted({
            microbiome: params.fiber + 20,
            inflammation: 100 - params.fiber * 0.4,
            metabolism: params.probiotic + 50,
            diversity: params.fiber * 0.7,
            mood: params.exercise === "high" ? 95 : params.exercise === "moderate" ? 85 : 70,
        });
    };

    const radarData = [
        { item: "菌群健康", score: predicted.microbiome },
        { item: "炎症水平(反向)", score: 100 - predicted.inflammation },
        { item: "代谢活性", score: predicted.metabolism },
        { item: "多样性", score: predicted.diversity },
        { item: "情绪状态", score: predicted.mood },
    ];

    const radarConfig = {
        data: radarData,
        xField: "item",
        yField: "score",
        meta: { score: { min: 0, max: 100 } },
        area: { style: { fillOpacity: 0.2 } },
        point: { size: 3, shape: "circle" },
        color: "#1890ff",
        lineStyle: { lineWidth: 2 },
        xAxis: {
            label: { style: { fontSize: 12 } },
        },
        yAxis: {
            label: false,
        },
    };

    return (
        <>
            <Row gutter={[16, 16]}>
                {/* 左侧：干预设置 */}
                <Col span={8}>
                    <Card
                        title={
                            <Flex align="center" gap={8}>
                                <ExperimentOutlined />
                                干预设置
                            </Flex>
                        }
                        size="small"
                        extra={
                            <Flex gap="small">
                                <Button
                                    size="small"
                                    onClick={() => setParams({ fiber: 50, probiotic: 30, exercise: "moderate" })}
                                >
                                    重置
                                </Button>
                                <Button size="small" type="primary" onClick={onSimulate}>
                                    启动模拟
                                </Button>
                            </Flex>
                        }
                    >
                        <Form layout="vertical">
                            <Form.Item label="膳食纤维摄入 (g/day)">
                                <Slider
                                    min={0}
                                    max={100}
                                    value={params.fiber}
                                    onChange={(v) => setParams({ ...params, fiber: v })}
                                />
                                <Tag color="blue">{params.fiber} g</Tag>
                            </Form.Item>

                            <Form.Item label="益生菌剂量 (亿 CFU/day)">
                                <Slider
                                    min={0}
                                    max={100}
                                    value={params.probiotic}
                                    onChange={(v) => setParams({ ...params, probiotic: v })}
                                />
                                <Tag color="green">{params.probiotic} 亿</Tag>
                            </Form.Item>

                            <Form.Item label="运动频率">
                                <Select
                                    value={params.exercise}
                                    onChange={(v) => setParams({ ...params, exercise: v })}
                                >
                                    <Select.Option value="low">低</Select.Option>
                                    <Select.Option value="moderate">中</Select.Option>
                                    <Select.Option value="high">高</Select.Option>
                                </Select>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
                <Col span={16}>
                    {/* <div >
                        <iframe title="Gut Barrier"    allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/3f1641c252a1410e8b3414fa128d9a0d/embed"> </iframe>
                    </div> */}
                    <iframe title="HUMAN CIRCULATORY SYSTEM" style={{width:"100%",height:"100%",border:"none"}} allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/b80352ff2ed54b9eb19475464b189640/embed?ui_infos=0&ui_watermark=0&ui_stop=1&ui_help=0&ui_vr=0&ui_settings=0&ui_inspector=0&ui_animations=0&ui_annotations=0&ui_hint=2"> </iframe>
                    {/* <iframe style={{width:"100%",height:"100%"}} title="Circulatory System Human Anatomy" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/e7abdabd3a6d422cb25e6e63b45b1ab0/embed"> </iframe> */}
                    {/* <HumanSvg></HumanSvg> */}
                    {/* <div className="digital-twin-wrapper light" style={{ height: "100%" }}>
                        <div className="tech-background"></div>
                        <Flex justify="center" align="center" className="human-container">
                            <img src={humann} style={{ height: "20rem" }} alt="Digital Human" />
                            <div className="glow"></div>
                        </Flex>
                    </div> */}
                    {/* <ConceptualGutDemo></ConceptualGutDemo> */}
                </Col>
                {/* 右侧：预测结果 */}
                <Col span={24}>
                    <Card
                        title={
                            <Flex align="center" gap={8}>
                                <LineChartOutlined />
                                干预预测结果
                            </Flex>
                        }
                        size="small"
                        bodyStyle={{ display: "flex", gap: 16 }}
                    >
                        {/* 雷达图区域 */}
                        <div style={{ flex: 2 }}>
                            <Radar {...radarConfig} height={280} />
                        </div>

                        {/* 健康指标摘要 */}
                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                gap: 12,
                            }}
                        >
                            <Statistic
                                title="综合健康评分"
                                value={(
                                    (predicted.microbiome +
                                        predicted.metabolism +
                                        predicted.diversity +
                                        predicted.mood +
                                        (100 - predicted.inflammation)) /
                                    5
                                ).toFixed(1)}
                                valueStyle={{ fontSize: 36, fontWeight: "bold", color: "#52c41a" }}
                            />
                            <Divider style={{ margin: "8px 0" }} />
                            <Flex vertical gap={4}>
                                <Flex align="center" justify="space-between">
                                    <span style={{ whiteSpace: "nowrap" }}><HeartOutlined /> 菌群健康</span>
                                    <Progress percent={predicted.microbiome} size="small" showInfo={false} />
                                </Flex>
                                <Flex align="center" justify="space-between">
                                    <span style={{ whiteSpace: "nowrap" }}><FireOutlined /> 炎症控制</span>
                                    <Progress percent={100 - predicted.inflammation} size="small" showInfo={false} />
                                </Flex>
                                <Flex align="center" justify="space-between">
                                    <span style={{ whiteSpace: "nowrap" }}><SmileOutlined /> 情绪状态</span>
                                    <Progress percent={predicted.mood} size="small" showInfo={false} />
                                </Flex>
                                <Flex align="center" justify="space-between">
                                    <span style={{ whiteSpace: "nowrap" }}><ThunderboltOutlined /> 代谢活性</span>
                                    <Progress percent={predicted.metabolism} size="small" showInfo={false} />
                                </Flex>
                                <Flex align="center" justify="space-between">
                                    <span style={{ whiteSpace: "nowrap" }}><ClusterOutlined /> 多样性</span>
                                    <Progress percent={predicted.diversity} size="small" showInfo={false} />
                                </Flex>
                            </Flex>
                        </div>
                    </Card>
                </Col>
            </Row>
        </>
    );
};



function ConceptualGutDemo() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas: any = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const width = canvas.width = canvas.parentElement.clientWidth;
        const height = canvas.height = canvas.parentElement.clientHeight;

        // 人体躯干位置
        const torso = { x: width * 0.7, y: height / 2, w: 50, h: 200 };

        // 肠道曲线点
        const gutPoints = Array.from({ length: 30 }, (_, i) => ({
            x: torso.x - i * 5,
            y: torso.y + Math.sin(i * 0.5) * 50
        }));

        const particles = Array.from({ length: 60 }, () => ({
            i: Math.random() * gutPoints.length,
            offset: Math.random()
        }));

        let animationId: any;
        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // 绘制躯干
            ctx.fillStyle = "rgba(255, 224, 192, 0.3)";
            ctx.fillRect(torso.x - torso.w / 2, torso.y - torso.h / 2, torso.w, torso.h);

            // 绘制肠道曲线
            ctx.strokeStyle = "#69c0ff";
            ctx.lineWidth = 12;
            ctx.beginPath();
            gutPoints.forEach((p, idx) => {
                if (idx === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            });
            ctx.stroke();

            // 绘制菌群粒子
            particles.forEach(p => {
                p.i += 0.05;
                if (p.i >= gutPoints.length) p.i = 0;
                const idx = Math.floor(p.i);
                const nextIdx = (idx + 1) % gutPoints.length;
                const t = p.i - idx;
                const x = gutPoints[idx].x * (1 - t) + gutPoints[nextIdx].x * t;
                const y = gutPoints[idx].y * (1 - t) + gutPoints[nextIdx].y * t;
                ctx.fillStyle = "#ffd666";
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            });

            animationId = requestAnimationFrame(animate);
        };
        animate();

        return () => cancelAnimationFrame(animationId);
    }, []);

    return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
}
