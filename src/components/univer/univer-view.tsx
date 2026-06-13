

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Input, Space, message } from 'antd'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import type { IWorkbookData } from '@univerjs/presets'
import { WORKBOOK_DATA } from './data.ts'
import { readSheetWorkbookApi, writeSheetWorkbookApi } from '@/api/sheet'

import './styles.css'

import '@univerjs/preset-sheets-core/lib/index.css'

const DEFAULT_SHEET_PATH = '/home/admin/Downloads/test1.xlsx'

const UniverView = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const univerAPIRef = useRef<ReturnType<typeof createUniver>['univerAPI'] | null>(null)
  const workbookSeqRef = useRef(0)
  const [filePath, setFilePath] = useState(DEFAULT_SHEET_PATH)
  const [loading, setLoading] = useState(false)

  const replaceWorkbook = useCallback((workbookData: Partial<IWorkbookData>) => {
    const univerAPI = univerAPIRef.current
    if (!univerAPI) {
      return
    }

    const activeWorkbook = univerAPI.getActiveWorkbook()
    if (activeWorkbook) {
      activeWorkbook.dispose()
    }

    workbookSeqRef.current += 1
    const baseId = String(workbookData.id ?? 'workbook')
    const uniqueWorkbookData: Partial<IWorkbookData> = {
      ...workbookData,
      id: `${baseId}-${Date.now()}-${workbookSeqRef.current}`,
    }

    univerAPI.createWorkbook(uniqueWorkbookData)
  }, [])

  const loadWorkbookFromFile = useCallback(async (targetPath: string) => {
    const univerAPI = univerAPIRef.current
    if (!univerAPI) {
      return
    }

    setLoading(true)
    try {
      const resp = await readSheetWorkbookApi({
        file_path: targetPath,
      })

      replaceWorkbook(resp.data.workbook_data as Partial<IWorkbookData>)
      message.success(`读取成功: ${resp.data.file_path}`)
    } catch (error) {
      console.error(error)
      replaceWorkbook(WORKBOOK_DATA as Partial<IWorkbookData>)
      message.warning('读取失败，已回退到本地示例数据')
    } finally {
      setLoading(false)
    }
  }, [replaceWorkbook])

  const saveWorkbookToFile = useCallback(async () => {
    const univerAPI = univerAPIRef.current
    if (!univerAPI) {
      return
    }

    const activeWorkbook = univerAPI.getActiveWorkbook()
    if (!activeWorkbook) {
      message.warning('当前没有可保存的工作簿')
      return
    }

    setLoading(true)
    try {
      const workbookData = activeWorkbook.save()
      const resp = await writeSheetWorkbookApi({
        file_path: filePath,
        // format: 'xlsx',
        workbook_data: workbookData as unknown as Record<string, unknown>,
      })

      message.success(`保存成功: ${resp.data.file_path}`)
    } catch (error) {
      console.error(error)
      message.error('保存失败，请检查文件路径和服务状态')
    } finally {
      setLoading(false)
    }
  }, [filePath])

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const { univer, univerAPI } = createUniver({
      locale: LocaleType.ZH_CN,
      locales: {
        [LocaleType.ZH_CN]: mergeLocales(sheetsCoreZhCN),
      },
      presets: [
        UniverSheetsCorePreset({
          container: containerRef.current,
        }),
      ],
    })

    univerAPIRef.current = univerAPI

    void loadWorkbookFromFile(DEFAULT_SHEET_PATH)

    return () => {
      univerAPIRef.current = null
      univer.dispose()
    }
  }, [loadWorkbookFromFile])

  return (
    <div className="univer-view">
      <div className="univer-view__toolbar">
        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={filePath}
            onChange={(event) => setFilePath(event.target.value)}
            placeholder="请输入相对路径，例如 demo/univer-demo.xlsx"
          />
          <Button loading={loading} onClick={() => loadWorkbookFromFile(filePath)}>读取Excel</Button>
          <Button type="primary" loading={loading} onClick={saveWorkbookToFile}>保存Excel</Button>
        </Space.Compact>
      </div>
      <div className="univer-view__container" ref={containerRef} />
    </div>
  )
}

export default UniverView