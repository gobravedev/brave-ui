import React, { FC, useState } from 'react';
import { Card, Row, Col, Statistic, Button, Table, Divider, Tooltip, Tag, Collapse, Typography } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/plots';
import { title } from 'process';

// JSON summary (provided)
// export const summaryJson = {
//   criteria: "p <0.05 & abs(coef)>0",
//   title: "Microbiome summary",
//   total: 118,

//   up: 18,
//   down: 22,
//   ns: 78
// };
const DiffSummaryCard: FC<any> = ({ data: summaryJson }) => {
  return (
    <Card size='small' title={<>
      {summaryJson.title} <Tag color='success'>{summaryJson.criteria}</Tag>
    </>} style={{}}>
      {/* {JSON.stringify(data)} */}
      <Row gutter={[8, 8]} align="middle">
        <Col xs={24} sm={6} md={6}>
          <Statistic title="Total features" value={summaryJson.total} />
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Statistic title="Up" value={summaryJson.up} valueStyle={{ color: '#F44336' }} />
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Statistic title="Down" value={summaryJson.down} valueStyle={{ color: '#4CAF50' }} />
        </Col>

        <Col xs={24} sm={6} md={6}>
          <Statistic title="Not significant" value={summaryJson.ns} valueStyle={{ color: '#9E9E9E' }} />
        </Col>
        <Col>
          <Collapse ghost items={[
            {
              key: "1",
              label: "More",
              children: <>
                <Typography>
                  {summaryJson?.feature}
                </Typography>
              </>
            }
          ]} />

        </Col>

      </Row>
    </Card>
  );
}

export default DiffSummaryCard