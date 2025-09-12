import React from "react";
import { Tooltip } from "antd";

interface TaxNode {
  tax_id: number;
  parent_tax_id: number;
  entity_name: string;
  rank: string;
}

interface LineageInlineProps {
  data: TaxNode[];
}

const LineageInline: React.FC<LineageInlineProps> = ({ data }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
      {Array.isArray(data) &&  data.map((item, index) => (
        <React.Fragment key={item.tax_id}>
          <Tooltip title={`${item.rank} (tax_id: ${item.tax_id})`}>
            <span
              style={{
                padding: "2px 6px",
                borderRadius: 4,
                backgroundColor: "#f0f2f5",
                cursor: "pointer",
                transition: "background 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e6f7ff")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f0f2f5")}
            >
              {item.entity_name}
            </span>
          </Tooltip>
          {index < data.length - 1 && <span style={{ margin: "0 4px" }}>→</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default LineageInline;
