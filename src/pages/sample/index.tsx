import { FC, useEffect, useState } from "react"
import axios from "axios"
import { Button, Card, Drawer, Flex, Form, Input, Modal, Space, Table, TableProps, Tabs } from "antd"
import { useOutletContext, useParams } from "react-router"

import { useModal } from "@/hooks/useModal"
import ImportFile from '@/components/import-data/inport-metadata'
export const getSamples: any = (project: any) => axios.get(`/list-by-project?project=${project}`)
const Sample: FC<any> = () => {
    const [sampleData, setSampleData] = useState([])
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const { project } = useOutletContext<any>()

  
    const { modal, openModal, closeModal } = useModal();
    
    const { Search } = Input;
    const loadSample = async () => {
        setLoading(true)
        const resp: any = await getSamples(project)
        console.log(resp)

        setSampleData(resp.data)
        setData(resp.data)
        setLoading(false)
    }
    const columns: TableProps<any>['columns'] = [
        {
            title: '样本唯一标识',
            dataIndex: 'sample_key',
            key: 'sample_key',
            ellipsis: true,
        },{
            title: '项目',
            dataIndex: 'project',
            key: 'project',
            ellipsis: true,
        },
         {
            title: '样本名称',
            dataIndex: 'sample_name',
            key: 'sample_name',
            ellipsis: true,
        }, 
        // {
        //     title: '样本个体',
        //     dataIndex: 'sample_individual',
        //     key: 'sample_individual',
        //     ellipsis: true,
        // }, {
        //     title: '样本组成',
        //     dataIndex: 'sample_composition',
        //     key: 'sample_composition',
        //     ellipsis: true,
        // }, {
        //     title: '测序技术',
        //     dataIndex: 'sequencing_technique',
        //     key: 'sequencing_technique',
        //     ellipsis: true,
        // }, {
        //     title: '测序目标',
        //     dataIndex: 'sequencing_target',
        //     key: 'sequencing_target',
        //     ellipsis: true,
        // },
         {
            title: '样本分组',
            dataIndex: 'sample_group',
            key: 'sample_group',
            ellipsis: true,
        }, {
            title: '样本分组名称',
            dataIndex: 'sample_group_name',
            key: 'sample_group_name',
            ellipsis: true,
        }, 
        // {
        //     title: '样本来源',
        //     dataIndex: 'sample_source',
        //     key: 'sample_source',
        //     ellipsis: true,
        // },
        // {
        //     title: '参与比对的reads数',
        //     dataIndex: 'alignment_reads_num',
        //     key: 'alignment_reads_num',
        //     render: (_, record) => (<>
        //         {(record.alignment_reads_num / 1e6).toFixed(2)}M
        //     </>)
        // }, {
        //     title: '比对上的reads数',
        //     dataIndex: 'alignment_reads',
        //     key: 'alignment_reads',
        //     render: (_, record) => (<>

        //         {record.alignment_reads > 1e6 ?
        //             (record.alignment_reads / 1e6).toFixed(2) + "M" :
        //             record.alignment_reads
        //         }
        //     </>)
        // }, {
        //     title: '未比对上的reads数',
        //     dataIndex: 'alignment_reads',
        //     key: 'alignment_reads',
        //     render: (_, record) => (<>

        //         {(record.alignment_reads_num - record.alignment_reads) > 1e6 ?
        //             ((record.alignment_reads_num - record.alignment_reads) / 1e6).toFixed(2) + "M" :
        //             (record.alignment_reads_num - record.alignment_reads)
        //         }
        //     </>)
        // }, {
        //     title: '比对率',
        //     dataIndex: 'alignment_reads',
        //     key: 'alignment_reads',
        //     render: (_, record) => (<>

        //         {(record.alignment_reads / record.alignment_reads_num*100).toFixed(4) + "%"
        //         }
        //     </>)
        // }, {
        //     title: '质控前reads数',
        //     dataIndex: 'before_filtering_total_reads',
        //     key: 'before_filtering_total_reads',
        //     render: (_, record) => (<>
        //         {(record.before_filtering_total_reads / 1e6).toFixed(2)}M
        //     </>)
        // }, {
        //     title: '质控前碱基数',
        //     dataIndex: 'before_filtering_total_bases',
        //     key: 'before_filtering_total_bases',
        //     render: (_, record) => (<>
        //         {(record.before_filtering_total_bases / 1e9).toFixed(2)}G
        //     </>)
        // }, {
        //     title: '质控后reads数',
        //     dataIndex: 'after_filtering_total_reads',
        //     key: 'after_filtering_total_reads',
        //     render: (_, record) => (<>
        //         {(record.after_filtering_total_reads / 1e6).toFixed(2)}M
        //     </>)
        // },
        // {
        //     title: '质控后碱基数',
        //     dataIndex: 'after_filtering_total_bases',
        //     key: 'after_filtering_total_bases',
        //     render: (_, record) => (<>
        //         {(record.after_filtering_total_bases / 1e9).toFixed(2)}G
        //     </>)
        // },

        // {
        //     title: '组织',
        //     dataIndex: 'tissue',
        //     key: 'tissue',
        //     ellipsis: true,
        // }, {
        //     title: '备注',
        //     dataIndex: 'remark',
        //     key: 'remark',
        //     ellipsis: true,
        // }, 
        // {
        //     title: 'fastq1',
        //     dataIndex: 'fastq1',
        //     key: 'fastq1',
        //     ellipsis: true,
        // }, {
        //     title: 'fastq2',
        //     dataIndex: 'fastq2',
        //     key: 'fastq2',
        //     ellipsis: true,
        // }, 
        {
            title: '操作',
            key: 'action',
            fixed: "right",
            width: 200,
            render: (_: any, record: any) => (
                <Space size="middle">
                    {/* <a href={`http://10.110.1.11:8000/heixiaoyan/heixiaoyan_workspace/output/fastp/${record.sample_name}.fastp.html`} target="__black">fastp</a>
                    <a href={`http://10.110.1.11:8000/heixiaoyan/heixiaoyan_workspace/output/fastqc/clean_reads/${record.sample_name}_1.fastp_fastqc.html`} target="__black">cf1</a>
                    <a href={`http://10.110.1.11:8000/heixiaoyan/heixiaoyan_workspace/output/fastqc/clean_reads/${record.sample_name}_2.fastp_fastqc.html`} target="__black">cf2</a> */}

                </Space>
            ),
        },
    ]
    
    useEffect(() => {
        loadSample()
    }, [])
    return <>
        {/* {sampleData && <>样本数量{sampleData.length}</>} */}

        {!(modal.key == "modalA" && modal.visible) ? <>
            <Search

                style={{ width: 304 }}
            />

            <Button onClick={loadSample} style={{ marginLeft: "1rem" }}>刷新</Button>
            <Button onClick={() => { openModal("modalA",{operatureUrl:"import_sample_form_str"}) }} style={{ marginLeft: "1rem" }}>导入样本</Button>
            <Button onClick={() => { openModal("modalA",{operatureUrl:"update_sample_form_str"}) }} style={{ marginLeft: "1rem" }}>更新样本</Button>

            <Table
                pagination={{ pageSize: 30 }}
                loading={loading}
                scroll={{ x: 'max-content', y: 55 * 5 }}
                columns={columns}
                footer={() => `一共${sampleData.length}条记录`}
                dataSource={sampleData} />

        </> : <>
            <ImportFile 
            visible={modal.key == "modalA" && modal.visible}
            onClose={closeModal} 
            params={modal.params}
            > </ImportFile>
        </>}

    </>
}


const SampleResult = () => {

    return <>
        <Sample></Sample>
        {/* <Tabs items={[
            {
                key: "sample",
                label: "样本信息",
                children: 
            }
          
        ]}></Tabs> */}
    </>
}

export default SampleResult
