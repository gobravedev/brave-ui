import React, { useState, useEffect, useRef } from 'react';

// 自定义 hook：分页逻辑
export const usePagination = ({ pageApi,params,map, initialPageSize = 10 }: any) => {
    const [data, setData] = useState<any[]>([]);  // 存储数据
    const [pageNumber, setPageNumber] = useState(1); // 当前页码
    const [totalPage, setTotalPage] = useState(0); // 总页数
    const [loading, setLoading] = useState(false); // 加载状态
    const [pageSize] = useState(initialPageSize); // 每页显示条数
    // const fetchDataRef = useRef<(page: number) => void>(() => {});

    
    // 模拟异步数据获取
    const fetchData = async (page: number) => {
        setLoading(true);
        try {
            // 模拟 API 请求（这里用 setTimeout 来模拟延迟）
            //   const response = await new Promise<any>((resolve) => {
            //     setTimeout(() => {
            //       const totalItems = 50; // 假设总共 50 条数据
            //       const newData = Array.from({ length: pageSize }, (_, index) => ({
            //         id: (page - 1) * pageSize + index + 1,
            //         name: `Item ${(page - 1) * pageSize + index + 1}`,
            //       }));
            //       resolve({ data: newData, total: totalItems });
            //     }, 1000);
            //   });
            const response = await pageApi({
                ...params,
                page_number: page,
                page_size: pageSize,
            })

            // "items": find_pipeline,
            // "total":total,
            // "page_number":query.page_number,
            // "page_size":query.page_size
            const {items,total,...rest} = response.data

            if(map){
                response.data = items.map(map)
            }

            setData(response.data); // 设置数据
            // setTotalPage(Math.ceil(response.total / pageSize)); // 计算总页数\
            setTotalPage(total)
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };
    const reload= ()=>{
        fetchData(pageNumber)
    }


    useEffect(() => {
        fetchData(pageNumber); // 获取数据
    }, [pageNumber]);

    return {
        data,
        pageNumber,
        totalPage,
        loading,
        setPageNumber, // 更新页码
        pageSize,
        reload,
    };
};
