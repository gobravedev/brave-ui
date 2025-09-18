// import React, { FC, useState } from "react";
// import {
//   Row,
//   Col,
//   Input,
//   Typography,
//   Card,
//   Statistic,
//   Divider,
//   Button,
//   Drawer,
//   List,
//   Tag,
//   Space,
//   Tooltip,
// } from "antd";
// import {
//   SearchOutlined,
//   ExperimentOutlined,
//   ClusterOutlined,
//   NodeIndexOutlined,
//   MedicineBoxOutlined,
//   AppleOutlined,
//   BranchesOutlined,
//   UserSwitchOutlined,
//   TeamOutlined,
//   DownloadOutlined,
//   DatabaseOutlined,
// } from "@ant-design/icons";

// const { Title, Paragraph } = Typography;

// type AxisKey = "gut" | "oral" | "brain";

// const axisMeta: Record<
//   AxisKey,
//   {
//     title: string;
//     summary: string;
//     topMicrobes: string[];
//     keyMetabolites: string[];
//     mechanisms: string[];
//     examplePmids: string[];
//   }
// > = {
//   gut: {
//     title: "Gut Microbiome → Brain Axis",
//     summary:
//       "Gut microbes influence the brain via metabolites (SCFAs, tryptophan metabolites), immune activation, vagus nerve signaling and modulation of the blood–brain barrier.",
//     topMicrobes: ["Faecalibacterium prausnitzii", "Bacteroides fragilis", "Akkermansia"],
//     keyMetabolites: ["Butyrate", "Propionate", "Tryptophan metabolites"],
//     mechanisms: [
//       "Short-chain fatty acids (SCFAs)",
//       "Vagus nerve signaling",
//       "Immune / cytokine modulation",
//       "BBB permeability alteration",
//     ],
//     examplePmids: ["PMID: 31012345", "PMID: 32098765"],
//   },
//   oral: {
//     title: "Oral Microbiome → Brain Axis",
//     summary:
//       "Oral microbes can reach systemic circulation, trigger peripheral inflammation, and may affect neuroinflammation and psychiatric outcomes.",
//     topMicrobes: ["Porphyromonas gingivalis", "Streptococcus mutans", "Fusobacterium"],
//     keyMetabolites: ["LPS / endotoxins", "Inflammatory cytokines"],
//     mechanisms: ["Systemic inflammation", "Direct translocation", "Immune priming"],
//     examplePmids: ["PMID: 30123456", "PMID: 29876543"],
//   },
//   brain: {
//     title: "Brain (Target)",
//     summary:
//       "The brain integrates peripheral signals. Changes manifest as altered neurotransmission, neuroinflammation, and behavioral phenotypes.",
//     topMicrobes: [],
//     keyMetabolites: ["Neurotransmitter precursors (5-HT, GABA)"],
//     mechanisms: ["Neurotransmitter modulation", "Microglia activation"],
//     examplePmids: ["PMID: 30543210"],
//   },
// };

// const PsycMicroGraphHome: FC<any> = () => {
//   const [openAxis, setOpenAxis] = useState<AxisKey | null>(null);

//   // placeholder numbers — replace with API data
//   const stats = {
//     associations: 5677,
//     microbes: 1781,
//     disorders: 542,
//     articles: 1200,
//     foods: 350,
//     drugs: 220,
//     pathways: 150,
//     models: "Human / Mouse",
//     samples: 15800,
//   };

//   return (
//     <div style={{ minHeight: "100vh", background: "#0e6b64", color: "#fff" }}>
//       <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
//         {/* Header */}
//         <div style={{ textAlign: "left", marginBottom: 28 }}>
//           <Title style={{ color: "#e6fff8", marginBottom: 6 }} level={2}>
//             PsycMicroGraph
//           </Title>
//           <Paragraph style={{ color: "rgba(230,255,248,0.9)", marginBottom: 12 }}>
//             Focused view on <b>Gut microbiome — Brain axis</b> and{" "}
//             <b>Oral microbiome — Brain axis</b>. Explore how microbes shape brain function via
//             metabolites, immune routes, vagal signaling and more.
//           </Paragraph>

//           <div style={{ maxWidth: 720 }}>
//             <Input
//               size="large"
//               placeholder="Search microbes, disorders, metabolites, pathways..."
//               prefix={<SearchOutlined />}
//               style={{ borderRadius: 8 }}
//               // TODO: wire to search
//             />
//           </div>
//         </div>

//         {/* Hero: left is SVG axis + hotspots, right is summary + CTA */}
//         <Row gutter={24} align="middle" style={{ marginBottom: 28 }}>
//           <Col xs={24} md={12}>
//             <Card
//               style={{
//                 borderRadius: 12,
//                 overflow: "hidden",
//                 background:
//                   "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
//               }}
//               bodyStyle={{ padding: 16 }}
//             >
//               {/* Simple illustrative SVG showing brain, gut, oral with clickable hotspots */}
//               <div style={{ display: "flex", justifyContent: "center" }}>
//                 <svg
//                   viewBox="0 0 600 360"
//                   width="100%"
//                   height="320"
//                   preserveAspectRatio="xMidYMid meet"
//                 >
//                   {/* Gut (left-bottom) */}
//                   <g transform="translate(30,170)">
//                     <ellipse
//                       cx="130"
//                       cy="100"
//                       rx="110"
//                       ry="60"
//                       fill="#ffefd5"
//                       stroke="#ffd6b3"
//                     />
//                     <text x="40" y="110" fill="#2b2b2b" fontSize="12">
//                       Gut
//                     </text>
//                     <circle
//                       cx="130"
//                       cy="70"
//                       r="18"
//                       fill="#69c0a4"
//                       opacity="0.95"
//                       style={{ cursor: "pointer" }}
//                       onClick={() => setOpenAxis("gut")}
//                     />
//                     <text x="120" y="76" fill="#fff" fontSize="10">
//                       G
//                     </text>
//                   </g>

//                   {/* Oral (top-left) */}
//                   <g transform="translate(30,20)">
//                     <rect x="20" y="10" rx="18" ry="18" width="120" height="70" fill="#ffe6e6" />
//                     <text x="40" y="55" fill="#2b2b2b" fontSize="12">
//                       Oral
//                     </text>
//                     <circle
//                       cx="80"
//                       cy="40"
//                       r="14"
//                       fill="#ff7875"
//                       style={{ cursor: "pointer" }}
//                       onClick={() => setOpenAxis("oral")}
//                     />
//                     <text x="74" y="44" fill="#fff" fontSize="10">
//                       O
//                     </text>
//                   </g>

//                   {/* Brain (right) */}
//                   <g transform="translate(360,40)">
//                     <path
//                       d="M120 40 Q80 10 40 40 Q0 70 20 110 Q30 145 70 150 Q120 160 160 130 Q190 100 160 70 Q140 50 120 40 Z"
//                       fill="#d6f7ff"
//                       stroke="#bfefff"
//                     />
//                     <text x="100" y="120" fill="#2b2b2b" fontSize="12">
//                       Brain
//                     </text>
//                     <circle
//                       cx="80"
//                       cy="60"
//                       r="16"
//                       fill="#69b7ff"
//                       style={{ cursor: "pointer" }}
//                       onClick={() => setOpenAxis("brain")}
//                     />
//                     <text x="75" y="64" fill="#fff" fontSize="10">
//                       B
//                     </text>
//                   </g>

//                   {/* arrows (gut->brain, oral->brain) */}
//                   <defs>
//                     <marker
//                       id="arrow"
//                       viewBox="0 0 10 10"
//                       refX="5"
//                       refY="5"
//                       markerWidth="6"
//                       markerHeight="6"
//                       orient="auto-start-reverse"
//                     >
//                       <path d="M 0 0 L 10 5 L 0 10 z" fill="#fff" opacity="0.9" />
//                     </marker>
//                   </defs>

//                   {/* arrow gut->brain */}
//                   <path
//                     d="M190 180 Q260 140 340 110"
//                     stroke="#fff"
//                     strokeWidth="2"
//                     fill="none"
//                     markerEnd="url(#arrow)"
//                     opacity={0.9}
//                   />
//                   {/* arrow oral->brain */}
//                   <path
//                     d="M150 60 Q260 70 340 90"
//                     stroke="#fff"
//                     strokeWidth="2"
//                     fill="none"
//                     markerEnd="url(#arrow)"
//                     opacity={0.9}
//                     strokeDasharray="6 4"
//                   />
//                 </svg>
//               </div>

//               <div style={{ marginTop: 8 }}>
//                 <Space direction="vertical">
//                   <div>
//                     <Tag color="#69c0a4">Gut → Brain</Tag>
//                     <Tag color="#ff7875">Oral → Brain</Tag>
//                     <Tag color="#69b7ff">Neuro effects</Tag>
//                   </div>
//                   <Paragraph style={{ color: "rgba(255,255,255,0.85)", margin: 0 }}>
//                     Click any hotspot (G / O / B) to inspect mechanisms, top microbes,
//                     metabolites and representative literature.
//                   </Paragraph>
//                 </Space>
//               </div>
//             </Card>
//           </Col>

//           <Col xs={24} md={12}>
//             <Card style={{ borderRadius: 12, background: "transparent" }} bodyStyle={{ padding: 20 }}>
//               <Title level={4} style={{ color: "#fff", marginBottom: 6 }}>
//                 Focused Axes — Mechanisms & Evidence
//               </Title>
//               <Paragraph style={{ color: "rgba(255,255,255,0.85)", marginBottom: 12 }}>
//                 We prioritize the Gut–Brain and Oral–Brain axes: map microbe → metabolite → pathway →
//                 brain outcome with evidence tags (PMID, cohort size, model).
//               </Paragraph>

//               <Space style={{ marginBottom: 12 }}>
//                 <Button
//                   type="primary"
//                   shape="round"
//                   icon={<DatabaseOutlined />}
//                   onClick={() => {
//                     // TODO: 导航到知识图谱页面
//                   }}
//                 >
//                   Explore Knowledge Graph
//                 </Button>
//                 <Button
//                   shape="round"
//                   icon={<DownloadOutlined />}
//                   onClick={() => {
//                     // TODO: 导出 summary CSV
//                   }}
//                 >
//                   Download Summary
//                 </Button>
//               </Space>

//               <Divider style={{ borderColor: "rgba(255,255,255,0.05)" }} />

//               <Row gutter={12}>
//                 <Col span={12}>
//                   <Card size="small" bordered={false} style={{ background: "rgba(255,255,255,0.02)" }}>
//                     <Statistic
//                       title="Associations"
//                       value={stats.associations}
//                       prefix={<ClusterOutlined />}
//                       valueStyle={{ color: "#fff" }}
//                     />
//                   </Card>
//                 </Col>
//                 <Col span={12}>
//                   <Card size="small" bordered={false} style={{ background: "rgba(255,255,255,0.02)" }}>
//                     <Statistic
//                       title="Microbes"
//                       value={stats.microbes}
//                       prefix={<NodeIndexOutlined />}
//                       valueStyle={{ color: "#fff" }}
//                     />
//                   </Card>
//                 </Col>
//                 <Col span={12} style={{ marginTop: 12 }}>
//                   <Card size="small" bordered={false} style={{ background: "rgba(255,255,255,0.02)" }}>
//                     <Statistic
//                       title="Psych Disorders"
//                       value={stats.disorders}
//                       prefix={<MedicineBoxOutlined />}
//                       valueStyle={{ color: "#fff" }}
//                     />
//                   </Card>
//                 </Col>
//                 <Col span={12} style={{ marginTop: 12 }}>
//                   <Card size="small" bordered={false} style={{ background: "rgba(255,255,255,0.02)" }}>
//                     <Statistic
//                       title="Articles"
//                       value={stats.articles}
//                       prefix={<ExperimentOutlined />}
//                       valueStyle={{ color: "#fff" }}
//                     />
//                   </Card>
//                 </Col>
//               </Row>
//             </Card>
//           </Col>
//         </Row>

//         <Divider style={{ borderColor: "rgba(255,255,255,0.06)" }} />

//         {/* Extended data summary grid */}
//         <Row gutter={[16, 16]} style={{ marginBottom: 18 }}>
//           <Col xs={24} sm={12} md={6}>
//             <Card bordered={false} style={{ borderRadius: 8 }}>
//               <Statistic title="Foods" value={stats.foods} prefix={<AppleOutlined />} />
//             </Card>
//           </Col>
//           <Col xs={24} sm={12} md={6}>
//             <Card bordered={false} style={{ borderRadius: 8 }}>
//               <Statistic title="Drugs" value={stats.drugs} prefix={<ExperimentOutlined />} />
//             </Card>
//           </Col>
//           <Col xs={24} sm={12} md={6}>
//             <Card bordered={false} style={{ borderRadius: 8 }}>
//               <Statistic title="Pathways" value={stats.pathways} prefix={<BranchesOutlined />} />
//             </Card>
//           </Col>
//           <Col xs={24} sm={12} md={6}>
//             <Card bordered={false} style={{ borderRadius: 8 }}>
//               <Statistic title="Models" value={stats.models} prefix={<UserSwitchOutlined />} />
//             </Card>
//           </Col>
//           <Col xs={24} sm={12} md={6}>
//             <Card bordered={false} style={{ borderRadius: 8 }}>
//               <Statistic title="Samples" value={stats.samples} prefix={<TeamOutlined />} />
//             </Card>
//           </Col>
//         </Row>

//         <Divider style={{ borderColor: "rgba(255,255,255,0.06)" }} />

//         {/* Mechanisms overview */}
//         <Row gutter={16}>
//           <Col xs={24} md={8}>
//             <Card title="Metabolic Mediators" bordered={false} style={{ borderRadius: 8 }}>
//               <List
//                 size="small"
//                 dataSource={["SCFAs (butyrate)", "Tryptophan metabolites", "GABA/Serotonin precursors"]}
//                 renderItem={(item) => <List.Item>{item}</List.Item>}
//               />
//             </Card>
//           </Col>
//           <Col xs={24} md={8}>
//             <Card title="Immune / Inflammation" bordered={false} style={{ borderRadius: 8 }}>
//               <List
//                 size="small"
//                 dataSource={["Peripheral cytokines (IL-6, TNF-α)", "Microglia priming", "LPS-driven inflammation"]}
//                 renderItem={(item) => <List.Item>{item}</List.Item>}
//               />
//             </Card>
//           </Col>
//           <Col xs={24} md={8}>
//             <Card title="Neural Routes" bordered={false} style={{ borderRadius: 8 }}>
//               <List
//                 size="small"
//                 dataSource={["Vagus nerve signaling", "Neurotransmitter modulation", "BBB permeability"]}
//                 renderItem={(item) => <List.Item>{item}</List.Item>}
//               />
//             </Card>
//           </Col>
//         </Row>

//         <Divider style={{ borderColor: "rgba(255,255,255,0.06)" }} />

//         {/* Footer CTA */}
//         <Row style={{ marginTop: 24 }} justify="space-between" align="middle">
//           <Col>
//             <Paragraph style={{ color: "rgba(255,255,255,0.85)", margin: 0 }}>
//               Want to bulk-import publications or map your cohort? We provide CLI & API to ingest
//               cohort-level 16S/metagenome metadata and map associations.
//             </Paragraph>
//           </Col>
//           <Col>
//             <Space>
//               <Button type="primary">Get API Key</Button>
//               <Button>Documentation</Button>
//             </Space>
//           </Col>
//         </Row>
//       </div>

//       {/* Axis Drawer (shows details when hotspot clicked) */}
//       <Drawer
//         width={420}
//         title={openAxis ? axisMeta[openAxis].title : ""}
//         placement="right"
//         onClose={() => setOpenAxis(null)}
//         visible={!!openAxis}
//         bodyStyle={{ background: "#001f1e", color: "#fff" }}
//       >
//         {openAxis && (
//           <div style={{ color: "#fff" }}>
//             <Paragraph style={{ color: "rgba(255,255,255,0.9)" }}>{axisMeta[openAxis].summary}</Paragraph>

//             <Divider style={{ borderColor: "rgba(255,255,255,0.04)" }} />

//             <Title level={5} style={{ color: "#fff" }}>
//               Top microbes
//             </Title>
//             <Space wrap style={{ marginBottom: 12 }}>
//               {axisMeta[openAxis].topMicrobes.map((m) => (
//                 <Tag key={m} color="cyan" style={{ cursor: "pointer" }}>
//                   {m}
//                 </Tag>
//               ))}
//             </Space>

//             <Title level={5} style={{ color: "#fff", marginTop: 12 }}>
//               Key metabolites
//             </Title>
//             <List
//               size="small"
//               dataSource={axisMeta[openAxis].keyMetabolites}
//               renderItem={(it) => (
//                 <List.Item style={{ background: "transparent", border: "none", padding: "6px 0" }}>
//                   <Space direction="vertical" size={0}>
//                     <div style={{ fontWeight: 600 }}>{it}</div>
//                     <div style={{ color: "rgba(255,255,255,0.7)" }}>
//                       {/* placeholder explanation */}
//                       Short explanation of {it} role in gut–brain signaling.
//                     </div>
//                   </Space>
//                 </List.Item>
//               )}
//             />

//             <Divider style={{ borderColor: "rgba(255,255,255,0.04)" }} />

//             <Title level={5} style={{ color: "#fff" }}>
//               Representative Evidence
//             </Title>
//             <List
//               size="small"
//               dataSource={axisMeta[openAxis].examplePmids}
//               renderItem={(p) => (
//                 <List.Item>
//                   <Space direction="vertical" size={0}>
//                     <a style={{ color: "#a7ffeb" }}>{p}</a>
//                     <div style={{ color: "rgba(255,255,255,0.65)" }}>Cohort / model / short note</div>
//                   </Space>
//                 </List.Item>
//               )}
//             />

//             <Divider style={{ borderColor: "rgba(255,255,255,0.04)" }} />

//             <Space direction="vertical" style={{ width: "100%" }}>
//               <Button type="primary" block icon={<DatabaseOutlined />}>
//                 View related associations
//               </Button>
//               <Button block>Query cohort samples</Button>
//               <Button block>Export evidence (CSV)</Button>
//             </Space>
//           </div>
//         )}
//       </Drawer>
//     </div>
//   );
// };

// export default PsycMicroGraphHome;

import React, { FC, useMemo, useRef, useState } from "react";
import { Card, Row, Col, Input, Checkbox, Divider, Tag, Drawer, Button, Space } from "antd";
import ForceGraph2D from "react-force-graph-2d";
import { SearchOutlined, InfoCircleOutlined, FunnelPlotOutlined, CloseCircleOutlined } from "@ant-design/icons";

// -----------------------------------------------------------------------------
// PsycMicroGraph Schema Visualizer
// - Visualizes: (Microbe) -> (Mechanism: Metabolite / Immune / Neural) -> (BrainFunction / Disease)
// - Features: color-coded node groups, toggle mechanism filters, search + highlight, click node to view evidence
// - Usage: drop this file into a React app (TypeScript). Install deps: antd, react-force-graph-2d
//   npm install antd react-force-graph-2d
// -----------------------------------------------------------------------------

type NodeType = "microbe" | "metabolite" | "immune" | "neural" | "brain" | "disease";

type GNode = {
  id: string; // unique
  name: string;
  type: NodeType;
  description?: string;
  evidence?: string[]; // PMIDs or short notes
};

type GLink = {
  source: string;
  target: string;
  relation: string; // produces / activates / stimulates / modulates / affects
  mechanism: "metabolic" | "immune" | "neural" | "other"; // used for filtering & color
  evidence?: string[];
};

const SAMPLE_NODES: GNode[] = [
  { id: "m_bifido", name: "Bifidobacterium longum", type: "microbe", description: "Probiotic genus", evidence: ["PMID:30000001"] },
  { id: "m_lacto", name: "Lactobacillus rhamnosus", type: "microbe", description: "GABA producer", evidence: ["PMID:30500002"] },
  { id: "met_butyrate", name: "Butyrate (SCFA)", type: "metabolite", description: "Short-chain fatty acid", evidence: ["PMID:31000003"] },
  { id: "met_trypt", name: "Tryptophan metabolites", type: "metabolite", description: "Kynurenine, indoles...", evidence: ["PMID:31100004"] },
  { id: "imm_lps", name: "LPS / TLR4 pathway", type: "immune", description: "Endotoxin-driven inflammation", evidence: ["PMID:32000005"] },
  { id: "neuro_vagus", name: "Vagus nerve signaling", type: "neural", description: "ENS -> Vagus -> Brain", evidence: ["PMID:33000006"] },
  { id: "brain_anxiety", name: "Anxiety (behavior)", type: "brain", description: "Behavioral phenotype", evidence: ["PMID:34000007"] },
  { id: "d_depression", name: "Depression (disorder)", type: "disease", description: "Major depressive disorder", evidence: ["PMID:35000008"] },
];

const SAMPLE_LINKS: GLink[] = [
  { source: "m_bifido", target: "met_butyrate", relation: "produces", mechanism: "metabolic", evidence: ["PMID:30000001"] },
  { source: "m_lacto", target: "met_trypt", relation: "produces", mechanism: "metabolic", evidence: ["PMID:30500002"] },
  { source: "met_butyrate", target: "brain_anxiety", relation: "modulates", mechanism: "metabolic", evidence: ["PMID:31000003"] },
  { source: "met_trypt", target: "d_depression", relation: "modulates", mechanism: "metabolic", evidence: ["PMID:31100004"] },
  { source: "m_bifido", target: "imm_lps", relation: "activates", mechanism: "immune", evidence: ["PMID:30000001"] },
  { source: "imm_lps", target: "d_depression", relation: "affects", mechanism: "immune", evidence: ["PMID:32000005"] },
  { source: "m_lacto", target: "neuro_vagus", relation: "stimulates", mechanism: "neural", evidence: ["PMID:33000006"] },
  { source: "neuro_vagus", target: "brain_anxiety", relation: "modulates", mechanism: "neural", evidence: ["PMID:33000006"] },
];

const COLOR_BY_TYPE: Record<NodeType, string> = {
  microbe: "#FFB74D",
  metabolite: "#64B5F6",
  immune: "#E57373",
  neural: "#81C784",
  brain: "#BA68C8",
  disease: "#90A4AE",
};

const LINK_COLOR_BY_MECH: Record<string, string> = {
  metabolic: "#64B5F6",
  immune: "#E57373",
  neural: "#81C784",
  other: "#CCCCCC",
};

export default function PsycMicroGraphSchemaVis() {
  const fgRef = useRef<any>(null);
  const [nodes] = useState<GNode[]>(SAMPLE_NODES);
  const [links] = useState<GLink[]>(SAMPLE_LINKS);

  const [mechanismFilter, setMechanismFilter] = useState<string[]>(["metabolic", "immune", "neural", "other"]);
  const [search, setSearch] = useState("");
  const [highlightNode, setHighlightNode] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GNode | null>(null);

  // Derived graph for filtering
  const graphData = useMemo(() => {
    const showLink = (l: GLink) => mechanismFilter.includes(l.mechanism);
    const filteredLinks = links.filter(showLink);
    const nodeIds = new Set<string>();
    filteredLinks.forEach((l) => {
      nodeIds.add(l.source);
      nodeIds.add(l.target);
    });
    // include isolated nodes if they match search
    nodes.forEach((n) => {
      if (search && n.name.toLowerCase().includes(search.toLowerCase())) nodeIds.add(n.id);
    });
    const filteredNodes = nodes.filter((n) => nodeIds.has(n.id));
    return { nodes: filteredNodes, links: filteredLinks };
  }, [nodes, links, mechanismFilter, search]);

  // node paint: circle with color and label
  const paintNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const r = 8 + (node.type === "microbe" ? 3 : 0);
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = COLOR_BY_TYPE[node.type as NodeType] || "#999";
    ctx.fill();

    // outline if highlighted
    if (highlightNode === node.id) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ffff66";
      ctx.stroke();
    }

    // label
    const label = node.name;
    const fontSize = 10 / Math.sqrt(globalScale);
    ctx.font = `${Math.max(8, fontSize)}px Sans-Serif`;
    ctx.fillStyle = "#111";
    ctx.textAlign = "center";
    ctx.fillText(label, node.x, node.y + r + 12 / globalScale);
  };

  return (
    <div style={{ padding: 16 }}>
      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col flex="320px">
          <Card size="small">
            <Input
              placeholder="Search node name..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />

            <Divider style={{ margin: "12px 0" }} />

            <div style={{ marginBottom: 8 }}>Filter mechanisms</div>
            <Checkbox.Group
              value={mechanismFilter}
              onChange={(v) => setMechanismFilter(v as string[])}
              options={[
                { label: "Metabolic", value: "metabolic" },
                { label: "Immune", value: "immune" },
                { label: "Neural", value: "neural" },
                { label: "Other", value: "other" },
              ]}
            />

            <Divider style={{ margin: "12px 0" }} />

            <div style={{ marginBottom: 8 }}>Legend</div>
            <Space direction="vertical">
              {(Object.keys(COLOR_BY_TYPE) as NodeType[]).map((t) => (
                <div key={t} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 12, height: 12, background: COLOR_BY_TYPE[t], borderRadius: 3 }} />
                  <div style={{ fontSize: 12 }}>{t}</div>
                </div>
              ))}
              <div style={{ height: 6 }} />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 12, height: 12, background: LINK_COLOR_BY_MECH.metabolic }} />
                <div style={{ fontSize: 12 }}>Metabolic link</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 12, height: 12, background: LINK_COLOR_BY_MECH.immune }} />
                <div style={{ fontSize: 12 }}>Immune link</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 12, height: 12, background: LINK_COLOR_BY_MECH.neural }} />
                <div style={{ fontSize: 12 }}>Neural link</div>
              </div>
            </Space>

            <Divider style={{ margin: "12px 0" }} />

            <div style={{ display: "flex", gap: 8 }}>
              <Button
                size="small"
                icon={<FunnelPlotOutlined />}
                onClick={() => {
                  // fit view
                  fgRef.current && fgRef.current.zoomToFit(400);
                }}
              >
                Fit
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setSearch("");
                }}
              >
                Clear
              </Button>
            </div>
          </Card>
        </Col>

        <Col flex="auto">
          <Card bodyStyle={{ padding: 8 }}>
            <div style={{ height: 600 }}>
              <ForceGraph2D
                ref={fgRef}
                graphData={graphData as any}
                nodeId="id"
                linkDirectionalArrowLength={5}
                linkDirectionalArrowRelPos={0.9}
                linkDirectionalParticles={1}
                linkDirectionalParticleSpeed={0.005}
                linkCanvasObjectMode={() => "after"}
                linkColor={(link: any) => LINK_COLOR_BY_MECH[link.mechanism] || "#999"}
                linkWidth={(l: any) => (l.mechanism === "metabolic" ? 2.5 : l.mechanism === "immune" ? 2.5 : 2)}
                nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) =>
                  paintNode(node, ctx, globalScale)
                }
                onNodeHover={(node: any) => {
                  if (node) setHighlightNode(node.id);
                  else setHighlightNode(null);
                }}
                onNodeClick={(node: any) => {
                  setSelectedNode(node as GNode);
                  setDrawerVisible(true);
                }}
                linkLabel={(l: any) => `${l.relation} (${l.mechanism})`}
                nodeLabel={(n: any) => `${n.name} — ${n.type}`}
                onBackgroundClick={() => {
                  setSelectedNode(null);
                  setDrawerVisible(false);
                }}
                // simple physics tuning
                d3AlphaDecay={0.02}
                d3VelocityDecay={0.4}
                width={900}
                height={600}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Drawer
        title={selectedNode ? selectedNode.name : "Node details"}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={360}
        footer={
          <div style={{ textAlign: "right" }}>
            <Button onClick={() => setDrawerVisible(false)} icon={<CloseCircleOutlined />}>Close</Button>
          </div>
        }
      >
        {selectedNode ? (
          <div>
            <div style={{ marginBottom: 8 }}><strong>Type:</strong> {selectedNode.type}</div>
            {selectedNode.description && <div style={{ marginBottom: 8 }}><strong>Desc:</strong> {selectedNode.description}</div>}
            <Divider />
            <div style={{ marginBottom: 8 }}><strong>Evidence</strong></div>
            {selectedNode.evidence && selectedNode.evidence.length ? (
              <Space direction="vertical">
                {selectedNode.evidence.map((e, i) => (
                  <Tag key={i} color="default" style={{ cursor: 'pointer' }}>{e}</Tag>
                ))}
              </Space>
            ) : (
              <div style={{ color: '#666' }}>No evidence recorded</div>
            )}

            <Divider />
            <div style={{ fontSize: 12, color: '#666' }}>
              Click any node to see details. Use the checkbox filters to show/hide mechanism types. Links are colored by mechanism and edges show relation labels on hover.
            </div>
          </div>
        ) : (
          <div>Select a node</div>
        )}
      </Drawer>
    </div>
  );
}
