// import { Button } from "antd"
// import { Card, Spin, Typography } from "antd"
// import axios from "axios"
// import { FC, useEffect, useState } from "react"

// const FileBrowser: FC<any> = ({ output_dir: dir }) => {
//     const [data, setData] = useState<any>()
//     const [loading, setLoading] = useState<any>()
//     const browseOutputDir = async () => {
//         setLoading(true)
//         const resp = await axios.get(`/file-operation/list-dir?directory=${dir}`)
//         setData(resp.data)
//         setLoading(false)
//     }
//     useEffect(() => {
//         console.log("file-list-recursive dir", dir);

//         browseOutputDir()
//     }, [dir])
// return <Card title="文件列表" extra={
//     <Button size="small" color="cyan" variant="solid" onClick={browseOutputDir}>
//         刷新
//     </Button>
// }>
//     <Spin spinning={loading}>

//         <Typography>
//             <pre>{JSON.stringify(data, null, 2)}</pre>
//         </Typography>
//     </Spin>
// </Card>
// }

// export default FileBrowser


import React, { FC, useEffect, useState } from "react";
import axios from "axios";
import { Breadcrumb, Button, Card, Flex, Input, List, Pagination, Space, Typography } from "antd";
const { Search } = Input
const { Text } = Typography
type FileItem = {
    name: string;
    is_dir: boolean;
    size?: number;
    modified: number;
};
import { FolderOutlined, FileOutlined, DownloadOutlined, ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons"

const FileBrowser: FC<any> = ({ output_dir: dir }) => {
    const [currentPath, setCurrentPath] = useState<string>(dir);
    const [files, setFiles] = useState<FileItem[]>([]);

    const loadFiles = async (path: string = "") => {
        const res = await axios.get(`/file-operation/list-dir`, {
            params: { path: path },
        });
        setFiles(res.data);
        setCurrentPath(path);
    };

    const handleNavigate = (name: string) => {
        loadFiles(`${currentPath}/${name}`);
    };

    const handleBack = () => {
        const parts = currentPath.split("/").filter(Boolean);
        parts.pop();
        loadFiles("/" + parts.join("/"));
    };

    const handleDownload = (name: string) => {
        const url = `/brave-api/file-operation/download?path=${encodeURIComponent(currentPath + "/" + name)}`;
        window.open(url, "_blank");
    };

    useEffect(() => {
        loadFiles(dir);
    }, []);

    return (

        <Card title="文件列表" extra={
            <Flex justify="space-between" align="center" gap={"small"}>
                <Button size="small" color="cyan" variant="solid" onClick={() => loadFiles(dir)}>
                    重置
                </Button>
                <Button size="small" color="cyan" variant="solid" onClick={() => loadFiles(currentPath)}>
                    刷新
                </Button>
            </Flex>
        }>
            <div>
                <h2>Browsing: /{currentPath}</h2>
                {currentPath && <button onClick={handleBack}>⬅ Back</button>}
                <ul>
                    {files.map((file) => (
                        <li key={file.name}>
                            {file.is_dir ? (
                                <button onClick={() => handleNavigate(file.name)}>📁 {file.name}</button>
                            ) : (
                                <span>
                                    📄 {file.name} ({(file.size! / 1024).toFixed(1)} KB)
                                    <button onClick={() => handleDownload(file.name)}>⬇ Download</button>
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </Card>
    );
}






const FileBrowserV2: FC<any> = ({ path, onSelectFile,onClose }) => {
    const [files, setFiles] = useState<FileItem[]>([])
    const [currentPath, setCurrentPath] = useState(path)
    const [keyword, setKeyword] = useState("")
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const limit = 10
  
    const loadFiles = async (
      pathVal: string = currentPath,
      keywordVal: string = keyword,
      pageNum: number = page
    ) => {
      const res = await axios.get("/file-operation/list-dir-v2", {
        params: {
          path: pathVal,
          keyword: keywordVal,
          page: pageNum,
          limit,
        },
      })
      setFiles(res.data.items)
      setTotal(res.data.total)
      setCurrentPath(pathVal)
      setPage(pageNum)
    }
  
    useEffect(() => {
      loadFiles(path)
    }, [path])
  
    const handleNavigate = (name: string) => {
      loadFiles(`${currentPath}/${name}`, "", 1)
    }
  
    const handleBack = () => {
      const parts = currentPath.split("/").filter(Boolean)
      parts.pop()
      loadFiles("/" + parts.join("/"), "", 1)
    }
  
    const handleSearch = (val: string) => {
      loadFiles(currentPath, val, 1)
    }
  
    const handleSelectFile = (file: FileItem) => {
      onSelectFile({
        path: currentPath + "/" + file.name,
        file: file.name,
      })
    }
  
    const pathSegments = currentPath.split("/").filter(Boolean)
  
    return (
      <Card
        title="文件浏览器"
        size="small"
        styles={{body:{
  
        }}}
        extra={
          <Space>
            {onClose &&<Button size="small" color="blue" variant="solid" onClick={onClose}>Close</Button>}
            <Button   size="small" color={"cyan"} variant="solid" icon={<ReloadOutlined />} onClick={() => loadFiles(path)} >
              Reset
            </Button>
            <Button size="small" color={"cyan"} variant="solid"  icon={<ReloadOutlined />} onClick={() => loadFiles(currentPath)} >
              Refresh
            </Button>
          </Space>
        }
      >
        <Breadcrumb style={{ marginBottom: "1rem" }}>
          <Breadcrumb.Item>
            <a onClick={() => loadFiles("/")}>根目录</a>
          </Breadcrumb.Item>
          {pathSegments.map((seg:any, index:any) => (
            <Breadcrumb.Item key={index}>
              <a
                onClick={() => {
                  const subPath = "/" + pathSegments.slice(0, index + 1).join("/")
                  loadFiles(subPath)
                }}
              >
                {seg}
              </a>
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
  
        <Search
          placeholder="搜索文件名"
          enterButton="搜索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onSearch={handleSearch}
          style={{ marginBottom: 16 }}
        />
  
        <List
          size="small"
          style={{
                    height:"50vh",
          overflowY:"auto"
          }}
          bordered
          dataSource={files}
          locale={{ emptyText: "暂无文件" }}
          renderItem={(file) => (
            <List.Item
              actions={
                file.is_dir
                  ? [<Button size="small" onClick={() => handleNavigate(file.name)}>进入</Button>]
                  : [
                      <Button
                        type="link"
                        size="small"
                        icon={<DownloadOutlined />}
                        href={`/brave-api/file-operation/download?path=${encodeURIComponent(currentPath + "/" + file.name)}`}
                        target="_blank"
                      >
                        下载
                      </Button>,
                      <Button type="link" size="small" onClick={() => handleSelectFile(file)}>
                        选择
                      </Button>,
                    ]
              }
            >
              <List.Item.Meta
                avatar={file.is_dir ? <FolderOutlined /> : <FileOutlined />}
                title={
                  <Text
                    strong
                    style={{ cursor: file.is_dir ? "pointer" : "default" }}
                    onClick={() => file.is_dir && handleNavigate(file.name)}
                  >
                    {file.name}
                  </Text>
                }
                description={
                  !file.is_dir && <Text type="secondary">{(file.size! / 1024).toFixed(1)} KB</Text>
                }
              />
            </List.Item>
          )}
        />
  
        <Pagination
          style={{ marginTop: "1rem", textAlign: "center" }}
          current={page}
          total={total}
          pageSize={limit}
          onChange={(pageNum) => loadFiles(currentPath, keyword, pageNum)}
          showSizeChanger={false}
        />
      </Card>
    )
  }
      

export default FileBrowserV2
