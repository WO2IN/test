'use client'

import { useTransition } from 'react'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface EmergencyGuide {
  id: number
  emergencyType?: string | null
  emergencyAction?: string | null
}

export interface EmergencyHistory {
  id: number
  occurredDate?: string | null
  cause?: string | null
  action?: string | null
  processedDate?: string | null
  note?: string | null
}

interface EmergencyFlowTableProps {
  guides: EmergencyGuide[]
  histories: EmergencyHistory[]
  onAddGuide: () => Promise<void> | void
  onUpdateGuide: (id: number, fields: Record<string, string>) => Promise<void> | void
  onDeleteGuide: (id: number) => Promise<void> | void
  onAddHistory: () => Promise<void> | void
  onUpdateHistory: (id: number, fields: Record<string, string>) => Promise<void> | void
  onDeleteHistory: (id: number) => Promise<void> | void
  escalationNote: string
  onEscalationChange: (value: string) => void
  onEscalationCommit?: (value: string) => void
}

const cellInputClass = 'print-compact-input h-9 rounded-none border-0 text-center shadow-none focus-visible:ring-0'

export function EmergencyFlowTable({
  guides,
  histories,
  onAddGuide,
  onUpdateGuide,
  onDeleteGuide,
  onAddHistory,
  onUpdateHistory,
  onDeleteHistory,
  escalationNote,
  onEscalationChange,
  onEscalationCommit,
}: EmergencyFlowTableProps) {
  const [, startTransition] = useTransition()
  const dataRowCount = Math.max(guides.length, histories.length, 1)
  const renderRows = Array.from({ length: dataRowCount }).map((_, i) => ({
    guide: guides[i] || null,
    history: histories[i] || null,
  }))

  return (
    <div className="print-issue-table no-break flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="print-compact-label text-sm font-semibold">이상발생시 조치사항</h2>
        <div className="no-print flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => startTransition(() => onAddGuide())}>
            <PlusIcon data-icon="inline-start" />이상발생 추가
          </Button>
          <Button variant="outline" size="sm" onClick={() => startTransition(() => onAddHistory())}>
            <PlusIcon data-icon="inline-start" />조치이력 추가
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto border-2 border-foreground/50">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th
                rowSpan={dataRowCount + 3}
                className="w-12 border-r border-b border-border bg-muted/60 p-1 text-center font-medium"
              >
                <div className="flex flex-row items-center justify-center gap-1">
                  <span className="inline-block [writing-mode:vertical-rl] tracking-widest">이상발생시</span>
                  <span className="inline-block [writing-mode:vertical-rl] tracking-widest">응급조치사항</span>
                </div>
              </th>
              <th rowSpan={2} className="border-r border-b border-border bg-muted p-2 text-center font-medium tracking-widest">이 상 발 생</th>
              <th rowSpan={2} className="border-r border-b border-border bg-muted p-2 text-center font-medium tracking-widest">조 치 사 항</th>
              <th rowSpan={2} className="w-12 border-r border-b border-border bg-muted p-2 text-center font-medium">FLOW</th>
              <th colSpan={5} className="border-b border-border bg-muted p-2 text-center font-medium">
                점검담당자 &nbsp;--&gt;&nbsp; 생산팀장
              </th>
              <th rowSpan={2} className="no-print w-10 border-b border-border bg-muted p-2" />
            </tr>
            <tr>
              <th className="w-24 border-r border-b border-border bg-muted/70 p-2 text-center font-medium">발생 일자</th>
              <th className="border-r border-b border-border bg-muted/70 p-2 text-center font-medium">고 장 원 인</th>
              <th className="border-r border-b border-border bg-muted/70 p-2 text-center font-medium">조 치 내 용</th>
              <th className="w-24 border-r border-b border-border bg-muted/70 p-2 text-center font-medium">처리 일자</th>
              <th className="w-14 border-b border-border bg-muted/70 p-2 text-center font-medium">비 고</th>
            </tr>
          </thead>
          <tbody>
            {renderRows.map((row, index) => (
              <tr key={index}>
                <td className="border-r border-b border-border p-0 relative group">
                  <Input
                    defaultValue={row.guide?.emergencyType ?? ''}
                    disabled={!row.guide}
                    onBlur={(e) => row.guide && startTransition(() => onUpdateGuide(row.guide!.id, { emergencyType: e.target.value }))}
                    className={cellInputClass}
                  />
                  {row.guide && (
                    <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity no-print z-10">
                      <Button variant="ghost" className="h-6 w-6 p-0 text-muted-foreground bg-background/80 hover:bg-destructive hover:text-destructive-foreground" onClick={() => startTransition(() => onDeleteGuide(row.guide!.id))}>
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </td>
                <td className="border-r border-b border-border p-0">
                  <Input
                    defaultValue={row.guide?.emergencyAction ?? ''}
                    disabled={!row.guide}
                    onBlur={(e) => row.guide && startTransition(() => onUpdateGuide(row.guide!.id, { emergencyAction: e.target.value }))}
                    className={cellInputClass}
                  />
                </td>
                {index === 0 && (
                  <td rowSpan={dataRowCount} className="border-r border-b border-border bg-muted/20 p-1 text-center">
                    <div className="flex flex-row items-center justify-center gap-1">
                      <span className="inline-block [writing-mode:vertical-rl] text-xs text-muted-foreground tracking-widest">문제발생</span>
                      <span className="inline-block [writing-mode:vertical-rl] text-xs text-muted-foreground tracking-widest">조치이력</span>
                    </div>
                  </td>
                )}
                <td className="border-r border-b border-border p-0">
                  <Input
                    defaultValue={row.history?.occurredDate ?? ''}
                    disabled={!row.history}
                    onBlur={(e) => row.history && startTransition(() => onUpdateHistory(row.history!.id, { occurredDate: e.target.value }))}
                    className={cellInputClass}
                  />
                </td>
                <td className="border-r border-b border-border p-0">
                  <Input
                    defaultValue={row.history?.cause ?? ''}
                    disabled={!row.history}
                    onBlur={(e) => row.history && startTransition(() => onUpdateHistory(row.history!.id, { cause: e.target.value }))}
                    className={cellInputClass}
                  />
                </td>
                <td className="border-r border-b border-border p-0">
                  <Input
                    defaultValue={row.history?.action ?? ''}
                    disabled={!row.history}
                    onBlur={(e) => row.history && startTransition(() => onUpdateHistory(row.history!.id, { action: e.target.value }))}
                    className={cellInputClass}
                  />
                </td>
                <td className="border-r border-b border-border p-0">
                  <Input
                    defaultValue={row.history?.processedDate ?? ''}
                    disabled={!row.history}
                    onBlur={(e) => row.history && startTransition(() => onUpdateHistory(row.history!.id, { processedDate: e.target.value }))}
                    className={cellInputClass}
                  />
                </td>
                <td className="border-b border-border p-0">
                  <Input
                    defaultValue={row.history?.note ?? ''}
                    disabled={!row.history}
                    onBlur={(e) => row.history && startTransition(() => onUpdateHistory(row.history!.id, { note: e.target.value }))}
                    className={cellInputClass}
                  />
                </td>
                <td className="no-print border-b border-border p-1 text-center">
                  {row.history && (
                    <Button variant="ghost" size="icon-sm" onClick={() => startTransition(() => onDeleteHistory(row.history!.id))}>
                      <Trash2Icon />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={8} className="border-r border-border p-0">
                <Input
                  value={escalationNote}
                  onChange={(e) => onEscalationChange(e.target.value)}
                  onBlur={(e) => onEscalationCommit?.(e.target.value)}
                  placeholder="이상 발생시 (작업자 → 과장 → 부장) 즉시 전달"
                  className="print-compact-input h-9 rounded-none border-0 px-3 text-left shadow-none focus-visible:ring-0"
                />
              </td>
              <td className="no-print p-1" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
