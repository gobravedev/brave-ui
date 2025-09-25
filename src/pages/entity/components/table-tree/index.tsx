import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Tree, Input, Spin, Tooltip, Skeleton } from 'antd';
import axios from 'axios';
import { RedoOutlined } from '@ant-design/icons'
import { EntityRef } from '../interface'

interface DataNode {
    title: React.ReactNode;
    key: number | string;
    isLeaf?: boolean;
    children?: DataNode[];
}

const updateTreeData = (list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] =>
    list.map((node) => {
        if (node.key === key) {
            return { ...node, children };
        }
        if (node.children) {
            return { ...node, children: updateTreeData(node.children, key, children) };
        }
        return node;
    });

const App = forwardRef<any, { entityType: any, params: any }>(({ entityType, params }, ref) => {
    const [treeData, setTreeData] = useState<DataNode[]>();
    const [loadingKeys, setLoadingKeys] = useState<Set<number>>(new Set());
    const [children, setChildren] = useState<any>()
    const [parentId, setParentId] = useState<any>("default")

    const fetchChildren = async (parentId: number, page: number, size: number, keyword = ""): Promise<{ children: DataNode[]; total: number }> => {
        const res = await axios.post(`/entity/page/${entityType}`, {
            page_number: page,
            page_size: size,
            parent_id: String(parentId),
            keyword, //  给接口传搜索条件
            ...params
        });

        const { items, total } = res.data;
        if (entityType == "taxonomy") {
            const children: DataNode[] = items.map((item: any) => ({
                title: <>
                    <Tooltip title={`${item.entity_name}(${item.rank})(${item.tax_id})`}>
                        {item.entity_name} ({item.rank})
                    </Tooltip>
                </>,
                key: item.tax_id,
                isLeaf: !item.has_children,
            }));
            setChildren(children)
            return { children, total };
        } else if (entityType == "mesh") {
            const children: DataNode[] = items.map((item: any) => ({
                title: <>
                    <Tooltip title={`${item.entity_name}`}>
                        {item.entity_name}({item.entity_id})
                    </Tooltip>
                </>,
                key: item.tree_number,
                isLeaf: !item.has_children,
            }));
            setChildren(children)
            return { children, total };
        } else {
            const children: DataNode[] = items.map((item: any) => ({
                title: <>
                    <Tooltip title={`${item.entity_name}`}>
                        {item.entity_name}
                    </Tooltip>
                </>,
                key: item.entity_id,
                isLeaf: !item.has_children,
            }));
            setChildren(children)
            return { children, total };
        }


    };
    const loadData = async () => {
        const { children: newChildren } = await fetchChildren(parentId, 1, -1);
        setTreeData(newChildren)
    }
    useImperativeHandle(ref, () => ({
        reload: loadData
    }))

    useEffect(() => {
        loadData()
    }, [entityType,JSON.stringify(params)])

    const onLoadData = async ({ key, children }: any) => {
        if (children) return;
        // debugger
        setLoadingKeys((prev) => new Set(prev).add(key));
        const { children: newChildren } = await fetchChildren(key, 1, -1);
        setTreeData((origin: any) =>
            updateTreeData(origin, key, [
                // {
                //     key: `${key}-search`,
                //     title: (
                //         // <Input.Search
                //         //     placeholder="搜索子节点"
                //         //     onSearch={async (val) => {
                //         //         const { children: filteredChildren } = await fetchChildren(Number(key), 1, 10, val);
                //         //         setTreeData((o) => updateTreeData(o, key, [
                //         //             {
                //         //                 key: `${key}-search`,
                //         //                 title: (o.find((n) => n.key === key)?.children?.[0]?.title as React.ReactNode) || "搜索",
                //         //                 isLeaf: true,
                //         //             },
                //         //             ...filteredChildren,
                //         //         ]));
                //         //     }}
                //         // />
                //         <RedoOutlined  />
                //     ),
                //     isLeaf: true,
                // },
                ...newChildren,
            ])
        );
        setLoadingKeys((prev) => {
            const copy = new Set(prev);
            copy.delete(key);
            return copy;
        });
    };



    const containerRef = useRef<HTMLDivElement>(null);
    const [innerHeight, setInnerHeight] = useState<any>(null);
    const updateHeight = () => {
        if (containerRef.current) {
            const height = containerRef.current.getBoundingClientRect().top // 包含 padding
            setInnerHeight(window.innerHeight - height);
        }
    }
    // useEffect(() => {

    // }, []);
    useEffect(() => {
        updateHeight(); // 初始化
        window.addEventListener("resize", updateHeight);
        // window.addEventListener("scroll", updateHeight);
        return () => {
            window.removeEventListener("resize", updateHeight);
            //   window.removeEventListener("scroll", updateHeight);
        };
    }, []);

    return (
        <div ref={containerRef}>
            {treeData ? <>
                <Tree
                    height={innerHeight}
                    loadData={onLoadData}
                    treeData={treeData}
                    showLine
                    //   switcherIcon={({ expanded }) => (expanded ? "▼" : "▶")}
                    titleRender={(nodeData) => (
                        loadingKeys.has(Number(nodeData.key)) ? <Spin size="small" /> : nodeData.title
                    )}
                />
            </> : <Skeleton active></Skeleton>}

        </div>

    );
})

export default App;
