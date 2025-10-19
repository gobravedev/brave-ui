import React, { useMemo, useRef, useState, useEffect } from "react"
import { useTable, Column } from "react-table"
import { faker } from '@faker-js/faker'

interface SmartTableProps<T extends object> {
  columns: Column<T>[]
  data: T[]
  rowHeight?: number
  height?: number
  width?: number | string
  virtualizedThreshold?: number // 超过多少条开始虚拟滚动，默认500
}




const randomNumber = (min: number, max: number) =>
  faker.number.int({ min, max })

const sentences = new Array(100)
  .fill(true)
  .map(() => faker.lorem.sentence(randomNumber(20, 70)))
console.log('sentences', sentences)
// function RowVirtualizerDynamic() {
//   const parentRef = React.useRef<HTMLDivElement>(null)

//   const [enabled, setEnabled] = React.useState(true)

//   const count = sentences.length
//   // const virtualizer = useVirtualizer({
//   //   count,
//   //   getScrollElement: () => parentRef.current,
//   //   estimateSize: () => 45,
//   //   enabled,
//   // })

//   const items = virtualizer.getVirtualItems()

//   return (
//     <div>
//       <button
//         onClick={() => {
//           virtualizer.scrollToIndex(0)
//         }}
//       >
//         scroll to the top
//       </button>
//       <span style={{ padding: '0 4px' }} />
//       <button
//         onClick={() => {
//           virtualizer.scrollToIndex(count / 2)
//         }}
//       >
//         scroll to the middle
//       </button>
//       <span style={{ padding: '0 4px' }} />
//       <button
//         onClick={() => {
//           virtualizer.scrollToIndex(count - 1)
//         }}
//       >
//         scroll to the end
//       </button>
//       <span style={{ padding: '0 4px' }} />
//       <button
//         onClick={() => {
//           setEnabled((prev) => !prev)
//         }}
//       >
//         turn {enabled ? 'off' : 'on'} virtualizer
//       </button>
//       <hr />
//       <div
//         ref={parentRef}
//         className="List"
//         style={{
//           height: 400,
//           width: 400,
//           overflowY: 'auto',
//           contain: 'strict',
//         }}
//       >
//         <div
//           style={{
//             height: virtualizer.getTotalSize(),
//             width: '100%',
//             position: 'relative',
//           }}
//         >
//           <div
//             style={{
//               position: 'absolute',
//               top: 0,
//               left: 0,
//               width: '100%',
//               transform: `translateY(${items[0]?.start ?? 0}px)`,
//             }}
//           >
//             {items.map((virtualRow) => (
//               <div
//                 key={virtualRow.key}
//                 data-index={virtualRow.index}
//                 ref={virtualizer.measureElement}
//                 className={
//                   virtualRow.index % 2 ? 'ListItemOdd' : 'ListItemEven'
//                 }
//               >
//                 <div style={{ padding: '10px 0' }}>
//                   <div>Row {virtualRow.index}</div>
//                   <div>{sentences[virtualRow.index]}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// // export default RowVirtualizerDynamic


type LogEntry = {
  id: number
  message: string
  level: "INFO" | "ERROR" | "WARN" | "DEBUG"
}

// const generateLogs = (start: number, count: number): LogEntry[] =>
//   Array.from({ length: count }, (_, i) => ({
//     id: start + i,
//     level: i % 10 === 0 ? "ERROR" : "INFO",
//     message: `Log message #${start + i}`,
//   }))


// function VirtualLogViewer() {
//   const [logs, setLogs] = useState<LogEntry[]>([])
//   const [isLoading, setIsLoading] = useState(false)

//   const parentRef = useRef<HTMLDivElement>(null)

//   const rowVirtualizer = useVirtualizer({
//     count: logs.length,
//     getScrollElement: () => parentRef.current,
//     estimateSize: () => 32,
//     overscan: 10,
//   })

//   // 初始加载
//   useEffect(() => {
//     loadMore()
//   }, [])

//   // 监听是否滚动到底
//   useEffect(() => {
//     const lastItem = rowVirtualizer.getVirtualItems().at(-1)
//     if (!lastItem) return

//     if (
//       lastItem.index >= logs.length - 1 &&
//       !isLoading
//     ) {
//       loadMore()
//     }
//   }, [rowVirtualizer.getVirtualItems()])

//   // 模拟加载接口
//   const loadMore = () => {
//     setIsLoading(true)
//     setTimeout(() => {
//       const nextLogs = generateLogs(logs.length + 1, PAGE_SIZE)
//       setLogs(prev => [...prev, ...nextLogs])
//       setIsLoading(false)
//     }, 500)
//   }

//   return (
//     <div
//       ref={parentRef}
//       style={{
//         height: "400px",
//         width: "100%",
//         overflow: "auto",
//         fontFamily: "monospace",
//         fontSize: 14,
//         border: "1px solid #ccc",
//         background: "#fafafa",
//       }}
//     >
//       <div
//         style={{
//           height: `${rowVirtualizer.getTotalSize()}px`,
//           position: "relative",
//         }}
//       >
//         {rowVirtualizer.getVirtualItems().map(virtualRow => {
//           const log = logs[virtualRow.index]
//           return (
//             <div
//               key={log?.id ?? virtualRow.index}
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 width: "100%",
//                 height: `${virtualRow.size}px`,
//                 transform: `translateY(${virtualRow.start}px)`,
//                 padding: "4px 12px",
//                 color: log?.level === "ERROR" ? "red" : "#333",
//                 borderBottom: "1px solid #eee",
//               }}
//             >
//               [{log?.level}] {log?.message}
//             </div>
//           )
//         })}
//       </div>
//       {isLoading && (
//         <div style={{ padding: "8px", textAlign: "center", color: "#888" }}>
//           加载中...
//         </div>
//       )}
//     </div>
//   )
// }














// 每次加载最新日志，支持上滚加载旧日志，自动追加新日志



// 🚀 支持初始化加载最新日志，向上滚动加载旧日志，自动追加新日志（只在底部）

const generateLogs = (start: number, count: number): LogEntry[] =>
  Array.from({ length: count }, (_, i) => ({
    id: start + i,
    level: i % 10 === 0 ? "ERROR" : "INFO",
    message: `Log message #${start + i}`,
  }))

const PAGE_SIZE = 50
// function VirtualLogViewer2() {
//   const [logs, setLogs] = useState<LogEntry[]>([])
//   const [isLoading, setIsLoading] = useState(false)
//   const [autoScroll, setAutoScroll] = useState(true)
//   const parentRef = useRef<HTMLDivElement>(null)

//   const rowVirtualizer = useVirtualizer({
//     count: logs.length,
//     getScrollElement: () => parentRef.current,
//     estimateSize: () => 32,
//     overscan: 10,
//   })

//   // 初始化加载最新页，并滚到底部
//   useEffect(() => {
//     const initial = generateLogs(1000, PAGE_SIZE)
//     console.log('initial', initial)
//     setLogs(initial)
//     requestAnimationFrame(() => {
//       parentRef.current!.scrollTop = parentRef.current!.scrollHeight
//     })
//   }, [])

//   // 向上滚动加载历史日志（prepend）
//   const loadOlderLogs = () => {
//     if (isLoading) return
//     setIsLoading(true)
//     const prevHeight = parentRef.current?.scrollHeight ?? 0

//     const older = generateLogs(logs[0]?.id - PAGE_SIZE || 0, PAGE_SIZE).map(
//       (log, idx) => ({
//         ...log,
//         id: logs[0]?.id - PAGE_SIZE + idx,
//         message: `[OLD] ${log.message}`,
//       })
//     )
//     console.log('older', older)

//     setLogs(prev => [...older, ...prev])

//     requestAnimationFrame(() => {
//       const newHeight = parentRef.current!.scrollHeight
//       parentRef.current!.scrollTop = newHeight - prevHeight
//       setIsLoading(false)
//     })
//   }

//   // 监听用户是否在顶部 or 底部
//   const handleScroll = () => {
//     console.log('handleScroll', logs.length)
//     const el = parentRef.current
//     if (!el) return
//     const { scrollTop, scrollHeight, clientHeight } = el

//     // 向上滚动到顶部，加载历史
//     if (scrollTop <= 10) {
//       loadOlderLogs()
//     }

//     // 判断是否到底部，用于后续追加新日志时是否自动滚动
//     setAutoScroll(scrollTop + clientHeight >= scrollHeight - 10)
//   }

//   // 模拟实时日志追加（定时器替代 SSE/WebSocket）
//   useEffect(() => {
//     const timer = setInterval(() => {
//       const next: LogEntry = {
//         id: logs.length > 0 ? logs[logs.length - 1].id + 1 : 1,
//         level: Math.random() > 0.9 ? "ERROR" : "INFO",
//         message: `Live log #${Date.now()}`,
//       }
//       setLogs(prev => [...prev, next])

//       // 如果当前滚到底部，则自动滚动
//       if (autoScroll) {
//         requestAnimationFrame(() => {
//           parentRef.current!.scrollTop = parentRef.current!.scrollHeight
//         })
//       }
//     }, 1500)

//     return () => clearInterval(timer)
//   }, [logs, autoScroll])

//   return (
//     <div
//       ref={parentRef}
//       onScroll={handleScroll}
//       style={{
//         height: "400px",
//         width: "100%",
//         overflow: "auto",
//         fontFamily: "monospace",
//         fontSize: 14,
//         border: "1px solid #ccc",
//         background: "#fafafa",
//       }}
//     >
//       <div
//         style={{
//           height: `${rowVirtualizer.getTotalSize()}px`,
//           position: "relative",
//         }}
//       >
//         {rowVirtualizer.getVirtualItems().map(virtualRow => {
//           const log = logs[virtualRow.index]
//           return (
//             <div
//               key={log?.id ?? virtualRow.index}
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 width: "100%",
//                 height: `${virtualRow.size}px`,
//                 transform: `translateY(${virtualRow.start}px)`,
//                 padding: "4px 12px",
//                 color: log?.level === "ERROR" ? "red" : "#333",
//                 borderBottom: "1px solid #eee",
//               }}
//             >
//               [{log?.level}] {log?.message}
//             </div>
//           )
//         })}
//       </div>
//       {isLoading && (
//         <div style={{ padding: "8px", textAlign: "center", color: "#888" }}>
//           加载旧日志中...
//         </div>
//       )}
//     </div>
//   )
// }

// export default VirtualLogViewer2


// export default VirtualLogViewer
