import { GraphRender } from "@/pages/entity-relation/components"
import { Button, Flex, Tag } from "antd"
import axios from "axios"
import { FC, useEffect, useRef, useState } from "react"
import { data, useNavigate, useParams } from "react-router"

const MiningData: FC<any> = () => {
    const { entity_id } = useParams()
    const navigate = useNavigate()
    const [study, setStudy] = useState<any>()
    const [loading, setLoading] = useState<boolean>()
    const graphViewRef = useRef<any>(null)


    const loadData = async () => {
        setLoading(true)
        const resp = await axios.get(`/study/mining-study/${entity_id}`)
        setStudy(resp.data)
        setLoading(false)
    }
    useEffect(() => {
        loadData()
    }, [entity_id])

    return <div style={{ maxWidth: "1500px", margin: "0 auto", marginTop: "1rem" }}>
        <Flex style={{ marginBottom: "1rem" }} justify={"space-between"} align={"center"} gap="small">
            <div >
                <div>
                    {study && <>
                        {study.title}
                    </>}
                </div>
                <div>
                    {study && <>
                        <Tag onClick={async () => {
                            await axios.post(`/study/get-fulltext/${study.entity_id}`)
                        }}>{study.pmid}</Tag>
                        <Tag>{study.pmcid}</Tag>

                        <Tag>{study.doi}</Tag>
                        <Tag>{study.entity_name}</Tag>
                    </>}

                </div>
            </div>

            <Flex gap="small" wrap>
                <Button size="small" color="cyan" variant="solid" onClick={async () => {
                    await axios.post(`/nlp/init-db`)
                }}>init db</Button>
                <Button size="small" color="cyan" variant="solid" onClick={async () => {
                    await axios.post(`/nlp/find-entity/${study.entity_id}`)
                }}>nlp</Button>
                <Button size="small" color="cyan" variant="solid" onClick={loadData}>Refresh</Button>
                <Button size="small" color="cyan" variant="solid" onClick={() => navigate(`/mining`)}>Back</Button>
            </Flex>

        </Flex>

        {study && <>
            {/* <TextHighlighter text={study.fulltext}></TextHighlighter> */}

            <div style={{
                whiteSpace: "pre-line",
                lineHeight: "1.8",
                fontSize: "16px",
                color: "#333",
                textAlign: "justify",
                padding: "8px 0"
            }}
            >
                {study.fulltext}

            </div>

        </>}

        {/* <GraphRender
            ref={graphViewRef}
            height={innerHeight}
            // openGlobalModal={openModal}
            // updateQueryParams={updateQueryParams}
            openView={(view: string, data?: any) => {
                // setActiveView(view)
                // setSizes(['70%', '30%'])
                // if (data) {
                //     setData(data)
                // }
            }}  /> */}
        {/* {JSON.stringify(study)} */}

    </div>
}
export default MiningData
interface Entity {
    id: number;
    text: string;
    start: number;
    end: number;
    type: string;
    dbId?: number;
}

interface Relation {
    id: number;
    text: string;
    start: number;
    end: number;
    type: string;
    entities: [number, number]; // 关联的两个实体 id
    dbId?: number;
}

interface SentenceHighlight {
    id: number;
    text: string;
    start: number;
    end: number;
    entities: Entity[];
    relations: Relation[];
}

const TextHighlighter: FC<{ text: string }> = ({ text }) => {
    const [highlights, setHighlights] = useState<SentenceHighlight[]>([]);
    const [type, setType] = useState<"sentence" | "entity" | "relation">("sentence");
    const containerRef = useRef<HTMLDivElement>(null);
    const idRef = useRef(1);

    /** 获取选区在文本中的偏移 */
    const getSelectionOffsets = (selection: Selection) => {
        const range = selection.getRangeAt(0);
        const preRange = range.cloneRange();
        preRange.selectNodeContents(containerRef.current!);
        preRange.setEnd(range.startContainer, range.startOffset);
        const start = preRange.toString().length;
        const end = start + range.toString().length;
        return { start, end };
    };

    /** 右键标注文本 */
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        const selection = window.getSelection();
        if (!selection || selection.toString().trim() === "") return;

        const { start, end } = getSelectionOffsets(selection);
        const selectedText = selection.toString();
        const id = idRef.current++;

        if (type === "sentence") {
            setHighlights(prev => [
                ...prev,
                { id, text: selectedText, start, end, entities: [], relations: [] },
            ]);
        } else if (type === "entity") {
            const idx = highlights.findIndex(h => start >= h.start && end <= h.end);
            if (idx === -1) {
                alert("请先标注句子再添加实体！");
                return;
            }
            const newEntity: Entity = { id, text: selectedText, start, end, type: "entity" };
            const updated = [...highlights];
            updated[idx].entities.push(newEntity);
            setHighlights(updated);
        } else if (type === "relation") {
            const allEntities = highlights.flatMap(h => h.entities);
            const selectedEntities = allEntities.filter(e => start >= e.start && end <= e.end).map(e => e.id);
            if (selectedEntities.length !== 2) {
                alert("关系必须包含两个实体！");
                return;
            }
            const newRelation: Relation = { id, text: selectedText, start, end, type: "relation", entities: [selectedEntities[0], selectedEntities[1]] };
            const idx = highlights.findIndex(h => start >= h.start && end <= h.end);
            if (idx === -1) return;
            const updated = [...highlights];
            updated[idx].relations.push(newRelation);
            setHighlights(updated);
        }

        selection.removeAllRanges();
    };

    /** 删除标注 */
    const handleDelete = (id: number, kind: "sentence" | "entity" | "relation") => {
        if (kind === "sentence") {
            setHighlights(prev => prev.filter(h => h.id !== id));
        } else if (kind === "entity") {
            const updated = highlights.map(h => ({
                ...h,
                entities: h.entities.filter(e => e.id !== id),
                relations: h.relations.filter(r => !r.entities.includes(id)), // 删除包含该实体的关系
            }));
            setHighlights(updated);
        } else if (kind === "relation") {
            const updated = highlights.map(h => ({
                ...h,
                relations: h.relations.filter(r => r.id !== id),
            }));
            setHighlights(updated);
        }
    };

    /** 文本高亮渲染 */
    const renderText = () => {
        const chars = Array.from(text);
        const charMeta: { color?: string }[] = new Array(chars.length).fill({});

        highlights.forEach(h => {
            for (let i = h.start; i < h.end; i++) charMeta[i] = { color: "#eef" }; // sentence
            h.entities.forEach(e => { for (let i = e.start; i < e.end; i++) charMeta[i] = { color: "#ffe082" }; });
            h.relations.forEach(r => { for (let i = r.start; i < r.end; i++) charMeta[i] = { color: "#c8e6c9" }; });
        });

        return chars.map((ch, idx) => <span key={idx} style={{ backgroundColor: charMeta[idx].color }}>{ch}</span>);
    };

    return (
        <div style={{ display: "flex", gap: "20px" }}>
            {/* 左侧文本区 */}
            <div style={{ flex: 1 }}>
                <div style={{ marginBottom: "8px" }}>
                    标注类型：
                    <select value={type} onChange={e => setType(e.target.value as any)}>
                        <option value="sentence">句子</option>
                        <option value="entity">实体</option>
                        <option value="relation">关系</option>
                    </select>
                </div>
                <div
                    ref={containerRef}
                    onContextMenu={handleContextMenu}
                    style={{ border: "1px solid #ddd", padding: "12px", lineHeight: "1.8", cursor: "text", whiteSpace: "pre-wrap" }}
                >
                    {renderText()}
                </div>
            </div>

            {/* 右侧标注列表 */}
            <div style={{ width: "320px" }}>
                <h4>已标注：</h4>
                {highlights.length === 0 && <p style={{ color: "#888" }}>暂无标注</p>}
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {highlights.map(h => (
                        <li key={h.id} style={{ background: "#eef", padding: "6px", borderRadius: "4px", marginBottom: "6px" }}>
                            <div>
                                <b>句子：</b>{h.text}{" "}
                                <button onClick={() => handleDelete(h.id, "sentence")}>删除</button>
                            </div>
                            {h.entities.map(e => (
                                <div key={e.id} style={{ marginLeft: "8px" }}>
                                    <b>实体：</b>{e.text} <button onClick={() => handleDelete(e.id, "entity")}>删除</button>
                                </div>
                            ))}
                            {h.relations.map(r => (
                                <div key={r.id} style={{ marginLeft: "8px" }}>
                                    <b>关系：</b>{r.text} <button onClick={() => handleDelete(r.id, "relation")}>删除</button>
                                </div>
                            ))}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const TextHighlighter2: FC<any> = ({ text: text_ }) => {
    const [text] = useState<any>(text_);
    const [html, setHtml] = useState("");
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const idRef = useRef(1); // 高亮ID计数器

    useEffect(() => {
        setHtml(text.replace(/\n/g, "<br/>")); // 将 \n 渲染为换行
    }, [text]);

    /** 将选区的相对位置计算为在纯文本中的偏移量 */
    const getSelectionOffsets = (selection: Selection): { start: number; end: number } => {
        const range = selection.getRangeAt(0);
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(containerRef.current!);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;
        const end = start + range.toString().length;
        return { start, end };
    };

    /** 右键选中高亮 */
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        const selection = window.getSelection();
        if (!selection || selection.toString().trim() === "") return;

        const selectedText = selection.toString();
        const range = selection.getRangeAt(0);
        if (!containerRef.current?.contains(range.commonAncestorContainer)) return;

        // 计算位置
        const { start, end } = getSelectionOffsets(selection);

        // 生成唯一 ID
        const id = idRef.current++;

        // 创建高亮 span
        const span = document.createElement("span");
        span.style.backgroundColor = "yellow";
        span.dataset.highlightId = id.toString();
        range.surroundContents(span);

        // 更新 HTML
        const newHtml = containerRef.current?.innerHTML || "";
        setHtml(newHtml);

        // 清除选区
        selection.removeAllRanges();

        // 保存高亮记录
        setHighlights((prev) => [...prev, { id, text: selectedText, start, end }]);
    };

    // 删除高亮
    const handleDelete = (id: number) => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const span = container.querySelector(`span[data-highlight-id="${id}"]`);
        if (span) {
            // 还原高亮内容
            const textNode = document.createTextNode(span.textContent || "");
            span.replaceWith(textNode);
        }

        // 更新 HTML
        const newHtml = container.innerHTML;
        setHtml(newHtml);

        // 从 state 删除
        setHighlights((prev) => prev.filter((h) => h.id !== id));
    };

    return (
        <div style={{ display: "flex", gap: "20px" }}>
            {/* 左侧文本区 */}
            <div
                ref={containerRef}
                onContextMenu={handleContextMenu}
                dangerouslySetInnerHTML={{ __html: html }}
                style={{
                    flex: 1,
                    border: "1px solid #ddd",
                    padding: "12px",
                    borderRadius: "6px",
                    lineHeight: "1.8",
                    cursor: "text",
                    whiteSpace: "pre-wrap",
                }}
            ></div>

            {/* 右侧高亮列表 */}
            <div style={{ width: "320px" }}>
                <h4>📑 已选高亮：</h4>
                {highlights.length === 0 && <p style={{ color: "#888" }}>暂无高亮</p>}
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {highlights.map((item) => (
                        <li
                            key={item.id}
                            style={{
                                background: "#fffbe6",
                                border: "1px solid #ffe58f",
                                padding: "6px 8px",
                                borderRadius: "4px",
                                marginBottom: "6px",
                                fontSize: "14px",
                            }}
                        >
                            <div style={{ marginBottom: "4px" }}>
                                <b>内容：</b>{item.text}
                            </div>
                            <div style={{ fontSize: "12px", color: "#888" }}>
                                <span>位置：{item.start} - {item.end}</span>
                            </div>
                            <div style={{ textAlign: "right", marginTop: "4px" }}>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        color: "red",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                    }}
                                >
                                    删除
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
