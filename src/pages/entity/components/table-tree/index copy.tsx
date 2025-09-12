import React, { useState } from 'react';
import { Tree } from 'antd';
import axios from 'axios';

interface DataNode {
    title: string;
    key: number;
    isLeaf?: boolean;
    children?: DataNode[];
}

// const initTreeData: DataNode[] = [
//     { title: 'Expand to load', key: '0' },
//     { title: 'Expand to load', key: '1' },
//     { title: 'Tree Node', key: '2', isLeaf: true },
// ];

// It's just a simple demo. You can use tree map to optimize update perf.
const updateTreeData = (list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] =>
    list.map((node) => {
        if (node.key === key) {
            return {
                ...node,
                children,
            };
        }
        if (node.children) {
            return {
                ...node,
                children: updateTreeData(node.children, key, children),
            };
        }
        return node;
    });

const App: React.FC = () => {
    // const [treeData, setTreeData] = useState(initTreeData);
    const [treeData, setTreeData] = useState<DataNode[]>([{ title: "Root", key: 1 }]);

    const fetchChildren = async (parentId: number, page: number, size: number): Promise<{ children: DataNode[]; total: number }> => {
        const res = await axios.post(`/entity/page/taxonomy`, {
            page_number: page,
            page_size: size,
            parent_id: parentId,
        });

        const { items, total } = res.data;
        const children: DataNode[] = items.map((item:any) => ({
            title: `${item.entity_name} (${item.rank})`,
            key: item.tax_id,
            isLeaf: false//!item.has_children, // 如果没有子节点，标记为叶子
        }));

        return { children, total };
    };
    const onLoadData = async ({ key, children }: any) => {
        console.log(key)
        console.log(children)
        const { children: newChildren, total } = await fetchChildren(key, 1, 10);
        
        setTreeData((origin) =>
            updateTreeData(origin, key, newChildren),
        );
    }
    return <Tree loadData={onLoadData} treeData={treeData} />;
};

export default App;