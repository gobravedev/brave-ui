import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Card, Col, Empty, Form, Input, Row, Select, Tooltip } from "antd";
import { useForm } from "antd/es/form/Form";
import { RedoOutlined } from '@ant-design/icons'
interface Entry {
  id: string;
  name: string;
  type: string;
  link: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

const KGMLMap: FC<any> = ({ pathwayId, organisms, ...rest }) => {
  const [image, setImage] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(false)

  const loadKgml = async (pathwayId: any) => {
    setLoading(true)
    const res = await axios.get(`/kegg/kgml/${pathwayId}`)
    setImage(res.data.image);
    setEntries(res.data.entries);
    setLoading(false)
  }
  useEffect(() => {
    if (pathwayId && organisms) {
      loadKgml(`${organisms}${pathwayId}`)
    }

  }, [pathwayId, organisms]);

  return (
    <Card
      size="small"
      extra={<>
        <Tooltip title="refresh">
          <RedoOutlined onClick={() => loadKgml(`${organisms}${pathwayId}`)} />
        </Tooltip>
      </>}
      title={`${organisms}${pathwayId}`} loading={loading}>
      {/* {JSON.stringify(entries)} */}
      <div style={{ position: "relative", textAlign: "center" }}>
        {image && (
          <>
            <img
              src={image}
              alt="KEGG pathway"
              useMap="#kgmlmap"
              style={{ border: "1px solid #ddd", maxWidth: "100%" }}
            />
            <map name="kgmlmap">
              {entries.map((e) => {
                const left = e.x - e.width / 2;
                const top = e.y - e.height / 2;
                const right = e.x + e.width / 2;
                const bottom = e.y + e.height / 2;
                return (
                  <area
                    key={e.id}
                    shape="rect"
                    coords={`${left},${top},${right},${bottom}`}
                    href={e.link}
                    target="_blank"
                    alt={e.label}
                    title={e.label}
                  />
                );
              })}
            </map>
          </>
        )}
      </div>
    </Card>

  );
}

const KGMLMap2: FC<any> = ({ pathwayId, organisms }) => {
  const [image, setImage] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightKeys, setHighlightKeys] = useState<string[]>([]);

  const loadKgml = async (pathwayId: string) => {
    setLoading(true);
    const res = await axios.get(`/kegg/kgml/${pathwayId}`);
    setImage(res.data.image);
    setEntries(res.data.entries);
    setLoading(false);
  };

  useEffect(() => {
    if (pathwayId && organisms) {
      loadKgml(`${organisms}${pathwayId}`);
    }
  }, [pathwayId, organisms]);

  return (
    <Card
      size="small"
      extra={
        <>
          <Tooltip title="刷新">
            <RedoOutlined onClick={() => loadKgml(`${organisms}${pathwayId}`)} />
          </Tooltip>
          <Input
            placeholder="输入要高亮的基因/化合物ID，用逗号分隔"
            style={{ width: 250, marginLeft: 10 }}
            onChange={(e) => setHighlightKeys(e.target.value.split(","))}
          />
        </>
      }
      title={`${organisms}${pathwayId}`}
      loading={loading}
    >
      <div style={{ position: "relative", textAlign: "center" }}>
        {image && (
          <>
            <img
              src={image}
              alt="KEGG pathway"
              style={{ border: "1px solid #ddd", maxWidth: "100%" }}
            />
            {entries.map((e) => {
              const left = e.x - e.width / 2;
              const top = e.y - e.height / 2;
              const isHighlight = highlightKeys.includes(e.id) || highlightKeys.includes(e.name);

              return (
                <a
                  key={e.id}
                  href={e.link}
                  target="_blank"
                  style={{
                    position: "absolute",
                    left,
                    top,
                    width: e.width,
                    height: e.height,
                    background: "red",
                    border: isHighlight ? "2px solid red" : "1px solid transparent",
                    borderRadius: 4,
                    boxSizing: "border-box",
                    pointerEvents: "auto",
                    animation: isHighlight ? "flash 1s infinite alternate" : "none",
                  }}
                >
                  <Tooltip title={e.label}>
                    <div style={{ width: "100%", height: "100%" }} />
                  </Tooltip>
                </a>
              );
            })}
          </>
        )}
      </div>

      <style>
        {`
          @keyframes flash {
            0% { opacity: 1; box-shadow: 0 0 5px red; }
            50% { opacity: 0.5; box-shadow: 0 0 15px yellow; }
            100% { opacity: 1; box-shadow: 0 0 5px red; }
          }
        `}
      </style>
    </Card>
  );
};


interface Entry {
  id: string;
  name: string;
  type: string;
  link: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}
const { Search } = Input

const KGMLMapSVG: FC<any> = ({ pathwayId, organisms }) => {
  const [image, setImage] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightKeys, setHighlightKeys] = useState<string[]>([]);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  const loadKgml = async (pathwayId: string) => {
    setLoading(true);
    const res = await axios.get(`/kegg/kgml/${pathwayId}`);
    setImage(res.data.image);
    setEntries(res.data.entries);
    setLoading(false);
  };

  useEffect(() => {
    if (pathwayId && organisms) {
      loadKgml(`${organisms}${pathwayId}`);
    }
  }, [pathwayId, organisms]);

  // 缩放比例
  const scaleX = imgRef.current ? imgRef.current.width / imgSize.width : 1;
  const scaleY = imgRef.current ? imgRef.current.height / imgSize.height : 1;
  const checkContains = (label: any,name:any) => {

    const isMatch = highlightKeys.some(item =>
      label
        .split(",")
        .map((v: any) => v.trim().toLowerCase())
        .includes(item.trim().toLowerCase()) ||
      name
        .split(" ")
        .map((v: any) => v.trim().toLowerCase())
        .includes(item.trim().toLowerCase())
    );


    return isMatch
  }
  const highlightEntries = useMemo(() => {
    if (highlightKeys.length == 0) return entries;
    return entries.map((item: any) => {
      if (checkContains(item.label, item.name)) {
        return {
          isHighlight: true,
          ...item
        }
      } else {
        return {
          ...item
        }
      }
    });
  }, [entries, highlightKeys]);
  console.log(highlightEntries.filter((item: any) => item.isHighlight))
  return (
    <Card
      size="small"
      extra={
        <>
          <Tooltip title="刷新">
            <RedoOutlined onClick={() => loadKgml(`${organisms}${pathwayId}`)} />
          </Tooltip>
          <Search
            placeholder="输入要高亮的基因/化合物ID，用逗号分隔"
            style={{ width: 250, marginLeft: 10 }}
            allowClear
            onSearch={(val) => setHighlightKeys(val.split(","))}
          />
        </>
      }
      title={`${organisms}${pathwayId}`}
      loading={loading}
    >
      {/* {JSON.stringify(highlightKeys)} */}
      <div style={{ position: "relative", display: "inline-block" }}>
        {image && (
          <>
            <img
              ref={imgRef}
              src={image}
              alt="KEGG pathway"
              style={{ maxWidth: "100%", height: "auto" }}
              onLoad={(e) => {
                const target = e.currentTarget;
                setImgSize({ width: target.naturalWidth, height: target.naturalHeight });
              }}
            />
            {/* SVG Overlay */}
            <svg
              width={imgSize.width}
              height={imgSize.height}
              style={{ position: "absolute", top: 0, left: 0, }}
            >
              {highlightEntries.map((e) => {
                // const isHighlight = checkContains(e.label)// highlightKeys.includes(e.label) || highlightKeys.includes(e.name);
                return (
                  <a
                    key={e.id}
                    href={e.link}
                    target="_blank"
                  >
                    <rect
                      x={(e.x - e.width / 2) * scaleX}
                      y={(e.y - e.height / 2) * scaleY}
                      width={e.width * scaleX}
                      height={e.height * scaleY}
                      fill={e.isHighlight ? "red" : "transparent"}
                      stroke={e.isHighlight ? "red" : "green"}
                      strokeWidth={2}
                      rx={4}
                      ry={4}
                    >
                      {e.isHighlight && (
                        <animate
                          attributeName="opacity"
                          values="1;0.3;1"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      )}
                    </rect>
                    <title>{e.label}</title>
                  </a>
                );
              })}
            </svg>
          </>
        )}
      </div>
    </Card>
  );
};
const Kegg: FC<any> = () => {
  const [pathwayId, setPathwayId] = useState<string>()
  const [form] = useForm()
  const [values, setValues] = useState<any>()
  // const formId = Form.useWatch((values: any) => values?.analysis_id, form);
  const onValuesChange = (changedValues: any, allValues: any) => {
    console.log(changedValues)
    console.log(allValues)
    setValues(allValues)
  }
  return <>

    <Row>
      <Col lg={6} sm={6} xs={24} style={{ paddingRight: "1rem" }}>
        <Card
          size="small"
        >
          <Form form={form} onValuesChange={onValuesChange}>
            <Form.Item name={"organisms"} label={"organisms"}
              rules={[{ required: true, message: '该字段不能为空!' }]}
              tooltip={<>
                KEGG Organisms:<a target="_blank" href="https://www.genome.jp/kegg/tables/br08606.html">br08606</a>
              </>}

            >
              <Select allowClear options={[
                {
                  label: "hsa",
                  value: "hsa"
                }, {
                  label: "mmu",
                  value: "mmu"
                }, {
                  label: "rno",
                  value: "rno"
                }
              ]}></Select>
            </Form.Item>
            <Form.Item
              rules={[{ required: true, message: '该字段不能为空!' }]}
              name={"pathwayId"} label={"Pathway Id"}>
              <Select allowClear options={[
                {
                  label: "04144",
                  value: "04144"
                }, {
                  label: "04927",
                  value: "04927"
                }
              ]}></Select>
            </Form.Item>
          </Form>
        </Card>
      </Col>
      <Col lg={18} sm={18} xs={24} >

        {(values?.organisms && values?.pathwayId) ? <KGMLMapSVG  {...values}></KGMLMapSVG> :
          <Card>   <Empty></Empty></Card>
        }

      </Col>

    </Row>

  </>
}

export default Kegg