import React, { FC } from "react";
import {
  Card,
  Input,
  Typography,
  Row,
  Col,
  Statistic,
  Divider,
  Button,
} from "antd";
import {
  SearchOutlined,
  NodeIndexOutlined,
  ClusterOutlined,
  ExperimentOutlined,
  MedicineBoxOutlined,
  DatabaseOutlined,
  AppleOutlined,
  ExperimentTwoTone,
  BranchesOutlined,
  UserSwitchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import axis from "@/assets/axis.svg";
import gut_brain_axis from "@/assets/gut_brain_axis.png";

const { Title, Paragraph } = Typography;

const PsycMicroGraphHome: FC<any> = () => {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #003973 0%, #E5E5BE 100%)",
        minHeight: "100vh",
        padding: "40px",
      }}
    >
      {/* Header */}
      <div
        style={{ textAlign: "center", color: "white", marginBottom: "40px" }}
      >
        <Title style={{ color: "white" }} level={2}>
          PsycMicroGraph
        </Title>
        <Paragraph style={{ fontSize: "18px", color: "rgba(255,255,255,0.85)" }}>
          Microbe → Mechanism → Brain Function / Disease Knowledge Graph

        </Paragraph>
        <div style={{ maxWidth: 600, margin: "20px auto" }}>
          <Input
            size="large"
            placeholder="Search microbes, diseases, or associations..."
            prefix={<SearchOutlined />}
            style={{ borderRadius: "8px" }}
          />
        </div>
      </div>

      {/* Data Summary Section */}
      <Row gutter={[24, 24]} justify="center">
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: "12px", textAlign: "center" }}>
            <Statistic title="Associations" value={5677} prefix={<ClusterOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: "12px", textAlign: "center" }}>
            <Statistic title="Microbes" value={1781} prefix={<NodeIndexOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: "12px", textAlign: "center" }}>
            <Statistic title="Psychiatric Disorders" value={542} prefix={<MedicineBoxOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: "12px", textAlign: "center" }}>
            <Statistic title="Research Articles" value={1200} prefix={<ExperimentOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* Extended Data Section */}
      <Row gutter={[24, 24]} justify="center" style={{ marginTop: "20px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: "12px", textAlign: "center" }}>
            <Statistic title="Foods" value={350} prefix={<AppleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: "12px", textAlign: "center" }}>
            <Statistic title="Drugs" value={220} prefix={<ExperimentTwoTone />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: "12px", textAlign: "center" }}>
            <Statistic title="Metabolic Pathways" value={150} prefix={<BranchesOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: "12px", textAlign: "center" }}>
            <Statistic title="Biological Models" value={2} prefix={<UserSwitchOutlined />} suffix="(Human/Mouse)" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: "12px", textAlign: "center" }}>
            <Statistic title="Samples" value={15800} prefix={<TeamOutlined />} />
          </Card>
        </Col>
      </Row>

      <Divider
        style={{ margin: "40px 0", borderColor: "rgba(255,255,255,0.3)" }}
      />

      {/* Body Section */}
      <Row gutter={[32, 32]} align="middle">
        <Col xs={24} md={12}>
          <Title level={3} style={{ color: "white" }}>
            Why PsycMicroGraph?
          </Title>
          <Paragraph
            style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px" }}
          >
            PsycMicroGraph connects microbes, mechanisms, and brain functions or psychiatric disorders.
            Explore how microbial metabolites, immune or neural pathways influence human mental health.
          </Paragraph>
          <Button
            type="primary"
            size="large"
            shape="round"
            icon={<DatabaseOutlined />}
          >
            Explore Knowledge Graph
          </Button>
        </Col>
        <Col xs={24} md={12}>
          <img
            src={gut_brain_axis}
            alt="Human Microbiome"
            style={{
              width: "100%",
              maxWidth: 700,
              display: "block",
              margin: "0 auto",
              // filter: "drop-shadow(0 0 20px rgba(0,0,0,0.3))", // 可选投影
              // borderRadius: "15px", // 圆角更柔和
              borderRadius: "15px",
              WebkitMaskImage: "radial-gradient(circle, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              WebkitMaskSize: "cover",
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default PsycMicroGraphHome;
