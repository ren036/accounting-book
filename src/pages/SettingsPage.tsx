import { useCallback, useEffect, useState } from 'react'
import { Alert, Box, Button, Divider, FileInput, Group, Paper, Progress, SegmentedControl, Stack, Text, Title, useMantineColorScheme } from '@mantine/core'
import { HardDrive, Moon, Sun } from 'lucide-react'
import { serializeBackup } from '../lib/backup'
import { createBackupFileName } from '../lib/backupFileName'
import { parseImportFile } from '../lib/importBackup'
import {
  clearAllData,
  getPreference,
  listSavingsBuckets,
  listSavingsMovements,
  listTransactions,
  saveSavingsBuckets,
  saveSavingsMovements,
  saveTransactions,
  setPreference
} from '../lib/db'
import { downloadBlob } from '../lib/download'
import { getStorageMode } from '../lib/storageMode'
import { formatStorageSize, getLocalStorageInfo, type LocalStorageInfo } from '../lib/localStorageInfo'
import { confirmAction } from '../ui/feedback'

const versionUpdatedAt = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}).format(new Date(__APP_BUILD_TIME__))

type SettingsPageProps = {
  onChanged: () => Promise<void>
}

export function SettingsPage({ onChanged }: SettingsPageProps) {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const [message, setMessage] = useState('')
  const [selectedImportFile, setSelectedImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [localStorageInfo, setLocalStorageInfo] = useState<LocalStorageInfo | null | undefined>(undefined)
  const storageMode = getStorageMode()

  const refreshLocalStorageInfo = useCallback(async () => {
    try {
      setLocalStorageInfo(await getLocalStorageInfo())
    } catch {
      setLocalStorageInfo(null)
    }
  }, [])

  useEffect(() => {
    void refreshLocalStorageInfo()
  }, [refreshLocalStorageInfo])

  function handleColorSchemeChange(value: string) {
    const nextColorScheme = value === 'dark' ? 'dark' : 'light'
    setColorScheme(nextColorScheme)
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute('content', nextColorScheme === 'dark' ? '#171b18' : '#f4f6f3')
  }

  async function handleJsonExport() {
    const data = await loadBackupData()
    const blob = new Blob([serializeBackup(data)], {
      type: 'application/json'
    })

    downloadBlob(blob, createBackupFileName('json'))
  }

  async function handleExcelExport() {
    const { serializeExcelBackup } = await import('../lib/excelBackup')
    const { transactions, savingsBuckets, savingsMovements, openingDisposableBalance } = await loadBackupData()
    const blob = new Blob([serializeExcelBackup(transactions, savingsBuckets, savingsMovements, openingDisposableBalance)], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    downloadBlob(blob, createBackupFileName('xlsx'))
  }

  async function handleImport() {
    if (!selectedImportFile) {
      setMessage('请先选择要导入的备份文件。')
      return
    }

    try {
      setIsImporting(true)
      const importResult = await parseImportFile(selectedImportFile)

      await saveTransactions(importResult.data.transactions)
      if (importResult.kind === 'full-backup') {
        await Promise.all([
          saveSavingsBuckets(importResult.data.savingsBuckets),
          saveSavingsMovements(importResult.data.savingsMovements),
          setPreference('opening-disposable-balance', String(importResult.data.openingDisposableBalance))
        ])
      }

      await onChanged()
      await refreshLocalStorageInfo()
      setMessage(importResult.message)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '导入失败。')
    } finally {
      setIsImporting(false)
      setSelectedImportFile(null)
    }
  }

  async function handleClearAll() {
    const confirmed = await confirmAction({
      message: '确定清空全部账单、预算和储蓄数据吗？此操作不可恢复。',
      confirmLabel: '清空',
      cancelLabel: '取消',
      destructive: true,
    })

    if (!confirmed) return

    await clearAllData()
    await onChanged()
    await refreshLocalStorageInfo()
    setMessage('已清空全部数据。')
  }

  return (
    <Box component="section" p="md">
      <Title order={2} size="h4" ta="center" mb="sm">设置</Title>
      <Paper p="lg">
        <Stack gap="md">
        <Box>
          <Text fw={700}>外观</Text>
          <Text mt={4} mb="sm" size="sm" c="dimmed">选择记账本的显示主题</Text>
          <SegmentedControl
            fullWidth
            value={colorScheme === 'dark' ? 'dark' : 'light'}
            onChange={handleColorSchemeChange}
            aria-label="显示主题"
            data={[
              { value: 'light', label: <Group gap={6} justify="center"><Sun size={16} aria-hidden />明亮</Group> },
              { value: 'dark', label: <Group gap={6} justify="center"><Moon size={16} aria-hidden />暗色</Group> },
            ]}
          />
        </Box>

        <Divider />

        <Box>
          <Text fw={700}>数据与存储</Text>
          <Text mt={4} mb="sm" size="sm" c="dimmed">{storageMode.description}</Text>
          <LocalStorageCard info={localStorageInfo} />
        </Box>

        <Divider />

        <Button type="button" onClick={handleJsonExport}>
          导出 JSON
        </Button>
        <Button color="blue" type="button" onClick={handleExcelExport}>
          导出 Excel
        </Button>
        <FileInput
          label="导入备份"
          accept=".json,.xls,.xlsx,application/json"
          value={selectedImportFile}
          onChange={(file) => {
            setSelectedImportFile(file)
            setMessage(file ? `已选择文件：${file.name}` : '')
          }}
          clearable
        />
        <Button type="button" onClick={handleImport} disabled={!selectedImportFile} loading={isImporting}>
          {isImporting ? '导入中...' : '导入'}
        </Button>

        <Button color="red" variant="light" type="button" onClick={handleClearAll}>
          清空全部数据
        </Button>

        {message && <Alert color="blue">{message}</Alert>}

        <Text ta="center" size="xs" c="dimmed">
          版本 v{__APP_VERSION__} · 更新于 {versionUpdatedAt}
        </Text>
        </Stack>
      </Paper>
    </Box>
  )
}
async function loadBackupData() {
  const [transactions, savingsBuckets, savingsMovements, openingBalanceText] = await Promise.all([
    listTransactions(),
    listSavingsBuckets(),
    listSavingsMovements(),
    getPreference('opening-disposable-balance')
  ])
  return {
    transactions,
    savingsBuckets,
    savingsMovements,
    openingDisposableBalance: Number(openingBalanceText ?? 0)
  }
}

function LocalStorageCard({ info }: { info: LocalStorageInfo | null | undefined }) {
  const description = info === undefined
    ? '正在读取存储空间...'
    : info === null
      ? '数据保存在本机，当前浏览器未提供空间用量信息'
      : `已用 ${formatStorageSize(info.usage)} / 可用额度 ${formatStorageSize(info.quota)}`

  return (
    <Box className="local-storage-card" role="status" aria-label={`本机存储，${description}`}>
      <Group gap="sm" wrap="nowrap">
        <Box className="local-storage-card__icon" aria-hidden="true">
          <HardDrive size={17} strokeWidth={1.8} />
        </Box>
        <Box miw={0} flex={1}>
          <Text size="sm" fw={700} lh={1.25}>本机存储</Text>
          <Text mt={2} size="xs" c="dimmed" truncate>{description}</Text>
        </Box>
      </Group>
      <Progress
        mt="sm"
        value={info?.percentage ?? 0}
        size={6}
        aria-label="本机存储使用比例"
      />
    </Box>
  )
}
