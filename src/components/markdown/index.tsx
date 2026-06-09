import { FC, useMemo } from "react"
import { Image } from "antd";

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { useSelector } from "react-redux";
import './index.css'

const isAbsoluteOrSpecialUrl = (url: string) => {
  return /^(https?:)?\/\//i.test(url) || /^(data:|blob:|#)/i.test(url)
}

const resolveImageSrc = (baseURL: string, src?: string) => {
  if (!src) return ''
  if (isAbsoluteOrSpecialUrl(src)) return src
  if (src.startsWith('/')) return `${baseURL}${src}`
  return `${baseURL}/${src}`
}

const Markdown: FC<any> = ({ data }) => {

  const { baseURL, project, theme } = useSelector((state: any) => state.user)
  const parsedData = useMemo(() => {
    if (!data || typeof data !== 'string') return data
    return data.replace(/@report:([A-Za-z0-9-]+)/g, (_match, key) => {
      return `[点击查看](#/analysis-report?project=${project}&key=${key})`
    })
  }, [data, baseURL, project])

  const isDarkTheme = theme === 'dark'
  const markdownThemeClass = isDarkTheme ? 'markdown-theme-dark' : 'markdown-theme-light'

  return <div className={`markdown-wrapper ${markdownThemeClass}`}>
    <ReactMarkdown
      children={parsedData}
      rehypePlugins={[rehypeKatex]}
      remarkPlugins={[remarkGfm, remarkMath]}
      components={{
        code: ({ node, className, children, ...props }: any) => {
          const codeText = String(children ?? '').replace(/\n$/, '')
          const languageMatch = /language-(\w+)/.exec(className || '')
          const language = languageMatch?.[1] || 'text'
          const isBlockCode = Boolean(className?.includes('language-')) || codeText.includes('\n')

          if (!isBlockCode) {
            return <code className="markdown-inline-code" {...props}>{children}</code>
          }

          return (
            <div className="markdown-code-block">
              <div className="markdown-code-block__header">
                <span className="markdown-code-block__lang">{language}</span>
                <button
                  type="button"
                  className="markdown-code-block__copy"
                  onClick={() => {
                    if (navigator?.clipboard?.writeText) {
                      navigator.clipboard.writeText(codeText)
                    }
                  }}
                >
                  复制
                </button>
              </div>
              <pre className="markdown-code-block__pre">
                <code className={className} {...props}>{codeText}</code>
              </pre>
            </div>
          )
        },
        img: ({ node, src, ...props }) => (
          <div className="markdown-image">
            <Image
              src={resolveImageSrc(baseURL, src)}
              className="markdown-image__img"
              style={{ width: '100%', height: 'auto', display: 'block' }}
              alt={props.alt || ''}
              preview={{ mask: '点击预览' }}
            />
            {props.alt ? <div className="markdown-image__caption">{props.alt}</div> : null}
          </div>
        ),
        table: ({ node, children, ...props }) => (
          <div className="markdown-table-wrap">
            <table className="markdown-table" {...props}>{children}</table>
          </div>
        ),
        blockquote: ({ node, children, ...props }) => (
          <blockquote className="markdown-blockquote" {...props}>{children}</blockquote>
        ),
        p: ({ node, children }) => {
          // 如果是单张图片，改用 <div>
          return <div>{children}</div>
        }
      }}
      ></ReactMarkdown>

  </div>
}

export default Markdown