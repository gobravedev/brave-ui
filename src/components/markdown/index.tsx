import { FC, useEffect, useMemo, useRef, useState } from "react"
import { Image } from "antd";

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { useSelector } from "react-redux";
import ViewResolver from "@/core/ui-renderer/ViewResolver";
import type { ViewRenderProps } from "@/core/component-registry/registry-types";
import './index.css'

const VIEW_RESOLVER_TOKEN_REGEXP = /@@VIEW_RESOLVER_(\d+)@@/g

const parsePrimitiveValue = (rawValue: string) => {
  const value = rawValue.trim()
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  if (value === 'undefined') return undefined
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
  return value
}

const parseViewResolverProps = (attrsText: string): Record<string, unknown> => {
  const props: Record<string, unknown> = {}
  const attrRegexp = /([A-Za-z_][A-Za-z0-9_-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\}|([^\s"'=<>`]+))/g

  let match: RegExpExecArray | null
  while ((match = attrRegexp.exec(attrsText)) !== null) {
    const key = match[1]
    const raw = match[2] ?? match[3] ?? match[4] ?? match[5] ?? ''
    const unwrapped = raw.replace(/^['"]|['"]$/g, '')
    props[key] = parsePrimitiveValue(unwrapped)
  }

  return props
}

type SafeViewResolverProps = {
  view: string
} & Record<string, unknown>

const isValidViewResolverProps = (props: Record<string, unknown>): props is SafeViewResolverProps => {
  return typeof props.view === 'string' && props.view.length > 0
}

const replaceViewResolverTags = (text: string) => {
  const viewResolvers: Record<string, Record<string, unknown>> = {}
  let index = 0

  const markdownText = text.replace(
    /<ViewResolver\b([^>]*)\/?>(?:\s*<\/ViewResolver>)?/g,
    (_match, attrsText: string) => {
      const token = `@@VIEW_RESOLVER_${index}@@`
      viewResolvers[token] = parseViewResolverProps(attrsText || '')
      index += 1
      return token
    }
  )

  return { markdownText, viewResolvers }
}

const renderTextWithViewResolvers = (
  value: string,
  viewResolvers: Record<string, Record<string, unknown>>
) => {
  const segments: any[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  VIEW_RESOLVER_TOKEN_REGEXP.lastIndex = 0
  while ((match = VIEW_RESOLVER_TOKEN_REGEXP.exec(value)) !== null) {
    const token = match[0]
    if (match.index > lastIndex) {
      segments.push(value.slice(lastIndex, match.index))
    }

    const props = viewResolvers[token]
    if (props && isValidViewResolverProps(props)) {
      const viewRenderProps = props as ViewRenderProps
      segments.push(
        <ViewResolver
          key={`${token}-${match.index}`}
          {...viewRenderProps}
        />
      )
    } else {
      segments.push(token)
    }
    lastIndex = match.index + token.length
  }

  if (lastIndex < value.length) {
    segments.push(value.slice(lastIndex))
  }

  if (segments.length === 0) return value
  return segments
}

const isAbsoluteOrSpecialUrl = (url: string) => {
  return /^(https?:)?\/\//i.test(url) || /^(data:|blob:|#)/i.test(url)
}

const resolveImageSrc = (baseURL: string, src?: string) => {
  if (!src) return ''
  if (isAbsoluteOrSpecialUrl(src)) return src
  if (src.startsWith('/')) return `${baseURL}${src}`
  return `${baseURL}/${src}`
}

const MermaidBlock: FC<{ chart: string; isDarkTheme: boolean }> = ({ chart, isDarkTheme }) => {
  const graphRef = useRef<HTMLDivElement | null>(null)
  const [errorText, setErrorText] = useState('')
  const [zoomScale, setZoomScale] = useState(1)

  const clampScale = (scale: number) => {
    if (scale < 0.4) return 0.4
    if (scale > 3) return 3
    return Number(scale.toFixed(2))
  }

  const handleWheelZoom = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    const step = Math.exp(-event.deltaY * 0.0015)
    setZoomScale((prev) => clampScale(prev * step))
  }

  useEffect(() => {
    let isCancelled = false

    const renderMermaid = async () => {
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: isDarkTheme ? 'dark' : 'default'
        })

        const renderId = `markdown-mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const { svg } = await mermaid.render(renderId, chart)

        if (isCancelled || !graphRef.current) return
        graphRef.current.innerHTML = svg
        setErrorText('')
        setZoomScale(1)
      } catch (_error) {
        if (!isCancelled) {
          setErrorText('Mermaid 图表渲染失败')
        }
      }
    }

    renderMermaid()

    return () => {
      isCancelled = true
    }
  }, [chart, isDarkTheme])

  return (
    <div className="markdown-code-block markdown-mermaid-block">
      <div className="markdown-code-block__header">
        <span className="markdown-code-block__lang">mermaid</span>
        <div className="markdown-mermaid__actions">
          <span className="markdown-mermaid__zoom">{Math.round(zoomScale * 100)}%</span>
          <button
            type="button"
            className="markdown-code-block__copy"
            onClick={() => setZoomScale(1)}
          >
            重置
          </button>
          <button
            type="button"
            className="markdown-code-block__copy"
            onClick={() => {
              if (navigator?.clipboard?.writeText) {
                navigator.clipboard.writeText(chart)
              }
            }}
          >
            复制
          </button>
        </div>
      </div>
      <div className="markdown-mermaid__container" onWheel={handleWheelZoom}>
        {errorText ? (
          <div className="markdown-mermaid__error">
            <div>{errorText}</div>
            <pre className="markdown-code-block__pre">
              <code>{chart}</code>
            </pre>
          </div>
        ) : (
          <div
            ref={graphRef}
            className="markdown-mermaid__graph"
            style={{ transform: `scale(${zoomScale})` }}
          />
        )}
      </div>
    </div>
  )
}

const Markdown: FC<any> = ({ data }) => {

  const { baseURL, project, theme } = useSelector((state: any) => state.user)
  const parsedResult = useMemo(() => {
    if (!data || typeof data !== 'string') return data
    const reportReplaced = data.replace(/@report:([A-Za-z0-9-]+)/g, (_match, key) => {
      return `[点击查看](#/analysis-report?project=${project}&key=${key})`
    })
    return replaceViewResolverTags(reportReplaced)
  }, [data, project])

  const parsedData = typeof parsedResult === 'string' ? parsedResult : parsedResult?.markdownText
  const viewResolvers = typeof parsedResult === 'string' ? {} : (parsedResult?.viewResolvers || {})

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
          const normalizedLanguage = language.toLowerCase()
          const isBlockCode = Boolean(className?.includes('language-')) || codeText.includes('\n')

          if (!isBlockCode) {
            return <code className="markdown-inline-code" {...props}>{children}</code>
          }

          if (normalizedLanguage === 'mermaid') {
            return <MermaidBlock chart={codeText} isDarkTheme={isDarkTheme} />
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
          const normalizedChildren = Array.isArray(children) ? children : [children]
          return (
            <div>
              {normalizedChildren.map((child, index) => {
                if (typeof child !== 'string') return child
                return (
                  <span key={`md-p-${index}`}>
                    {renderTextWithViewResolvers(child, viewResolvers)}
                  </span>
                )
              })}
            </div>
          )
        }
      }}
      ></ReactMarkdown>

  </div>
}

export default Markdown