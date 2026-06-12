import { GraphicWalker } from '@kanaries/graphic-walker';
import { RedoOutlined } from "@ant-design/icons";
import { Button, Empty, Flex, Space, Spin } from 'antd';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

type GraphicWalkerContentProps = {
    analysis_result_id?: string;
};

const GraphicWalkerContent = ({ analysis_result_id }: GraphicWalkerContentProps) => {
    const { theme } = useSelector((state: any) => state.user);
    const [data, setData] = useState<any>();
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        if (!analysis_result_id) {
            setData(undefined);
            return;
        }

        setLoading(true);
        try {
            const resp = await axios.get(`/analysis-result/graphic-walker/${analysis_result_id}`);
            setData(resp.data);
        } catch (error) {
            console.error(error);
            setData(undefined);
        } finally {
            setLoading(false);
        }
    }, [analysis_result_id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <>
            <Flex justify='end' style={{ marginBottom: 8 }}>
                <Button
                    icon={<RedoOutlined />}
                    size='small'
                    loading={loading}
                    onClick={loadData}
                    disabled={!analysis_result_id}
                />
            </Flex>

            <Spin spinning={loading}>
                {data?.data && data?.fields ? (
                    <GraphicWalker
                        key={analysis_result_id}
                        data={data.data}
                        fields={data.fields}
                        appearance={theme === 'dark' ? 'dark' : 'light'}
                    />
                ) : (
                    <Empty />
                )}
            </Spin>
        </>
    );
};

export default GraphicWalkerContent;