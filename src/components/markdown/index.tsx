import { FC, useMemo } from "react"
import { Image } from "antd";

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { useSelector } from "react-redux";

const Markdown: FC<any> = ({ data }) => {

  const { baseURL,project } = useSelector((state: any) => state.user) 
  const parsedData = useMemo(() => {
    if (!data || typeof data !== 'string') return data
    return data.replace(/@report:([A-Za-z0-9-]+)/g, (_match, key) => {
      return `[点击查看](/#/analysis-report?project=${project}&key=${key})`
    })
  }, [data, baseURL, project])

  return <>
    <ReactMarkdown
      children={parsedData}
      rehypePlugins={[rehypeKatex]}
      remarkPlugins={[remarkGfm, remarkMath]}
      components={{
        img: ({ node, src, ...props }) => (
          <>
          {/* maxWidth: '50%', */}
            <Image
              src={`${baseURL}${src}`}
              style={{  height: 'auto', margin: '1rem auto', display: 'block' }}
              alt={props.alt || ''}
            ></Image>
          </>
        ),
        p: ({ node, children }) => {
          // 如果是单张图片，改用 <div>
          return <div>{children}</div>
        }
      }}
      ></ReactMarkdown>

  </>
}

export default Markdown