import React, { useState } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Flex, Table, Tooltip  } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { saveComponentRelationOrderApi } from '@/api/pipeline';
import { useOutletContext } from 'react-router';

interface DataType {
    key: string;
    name: string;
    age: number;
    address: string;
}

const columns: TableColumnsType<DataType> = [
    {
        title: 'component_name',
        dataIndex: 'component_name',
        render: (text: any, record: any) => {
            return <Tooltip  placement='right' title={<>
            <ul>
                <li>component_id: {record.component_id}</li>
                <li>relation_id: {record.relation_id}</li>

            </ul>
            
            </>}>
                {record.component_name}</Tooltip>
        }
    },
    // {
    //     title: 'Age',
    //     dataIndex: 'age',
    // },
    // {
    //     title: 'Address',
    //     dataIndex: 'address',
    // },
];

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    'data-row-key': string;
}

const Row: React.FC<Readonly<RowProps>> = (props) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: props['data-row-key'],
    });

    const style: React.CSSProperties = {
        ...props.style,
        transform: CSS.Translate.toString(transform),
        transition,
        cursor: 'move',
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
    };

    return <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />;
};

const App: React.FC<any> = ({ data ,callback}) => {
    const [dataSource, setDataSource] = useState(data);
    const {messageApi} = useOutletContext<any>()

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                // https://docs.dndkit.com/api-documentation/sensors/pointer#activation-constraints
                distance: 1,
            },
        }),
    );

    const saveComponentRelationOrder = async () => {
        const data = dataSource.map((item: any,index:number) => {
            return {
                order_index: index,
                relation_id: item.relation_id,
            }
        })
        // console.log(data)
        const resp: any = await saveComponentRelationOrderApi(data);
        messageApi.success('保存成功');
        if (callback) {
            callback()
        }
    }

    const onDragEnd = ({ active, over }: DragEndEvent) => {
        if (active.id !== over?.id) {
            setDataSource((prev: any) => {
                const activeIndex = prev.findIndex((i: any) => i.key === active.id);
                const overIndex = prev.findIndex((i: any) => i.key === over?.id);
                return arrayMove(prev, activeIndex, overIndex);
            });
        }
    };

    return (
        <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
            <SortableContext
                // rowKey array
                items={dataSource.map((i: any) => i.key)}
                strategy={verticalListSortingStrategy}
            >
                <Table<DataType>
                    pagination={false}
                    size="small"
                    components={{
                        body: { row: Row },
                    }}
                    rowKey="key"
                    columns={columns}
                    dataSource={dataSource}
                    footer={() => {
                        return <Flex justify='end'>
                            <Button size='small' color='cyan' variant='solid' onClick={saveComponentRelationOrder}>
                               保存
                            </Button>
                        </Flex>
                    }}
                />
            </SortableContext>
            {/* {JSON.stringify(dataSource)} */}
        </DndContext>
    );
};

export default App;