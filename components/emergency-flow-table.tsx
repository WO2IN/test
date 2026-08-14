'use client'

import { useTransition } from 'react'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface EmergencyFlowRow {
  id: number
  emergencyType?: string | null
  emergencyAction?: string | null
  occurredDate?: string | null
  cause?: string | null
  action?: string | null
  processedDate?: string | null
  note?: string | null
}

interface EmergencyFlowTableProps {
  rows: EmergencyFlowRow[]
  onAdd: () => Promise<void> | void
  onUpdate: (id: number, fields: Record<string, string>) => Promise<void> | void
  onDelete: (id: number) => Promise<void> | void
  escalationNote: string
  onEscalationChange: (value: string) => void
  onEscalationCommit?: (value: string) => void
}

const cellInputClass = 'print-compact-input h-9 rounded-none border-0 text-center shadow-none focus-visible:ring-0'

export function EmergencyFlowTable({
  rows,
  onAdd,
  onUpdate,
  onDelete,
  escalationNote,
  onEscalationChange,
  onEscalationCommit,
}: EmergencyFlowTableProps) {
  const [, startTransition] = useTransition()
  const dataRowCount = Math.max(rows.length, 1)

  return (
    <div className="print-issue-table no-break flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="print-compact-label text-sm font-semibold">이상발생시 조치사항</h2>
        <Button variant="outline" size="sm" className="no-print" onClick={() => startTransition(() => onAdd())}>
          <PlusIcon data-icon="inline-start" />행 추가
        </Button>
      </div>
      <div className="overflow-x-auto border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th
                rowSpan={dataRowCount + 3}
                className="w-8 border-r border-b border-border bg-muted/60 p-1 text-center font-medium"
              >
                <span className="inline-block [writing-mode:vertical-rl]">이상 발생시</span>
              </th>
              <th className="border-r border-b border-border bg-muted p-2 text-center font-medium">이상 발생</th>
              <th className="border-r border-b border-border bg-muted p-2 text-center font-medium">조치 사항</th>
              <th className="w-8 border-r border-b border-border bg-muted p-2 text-center font-medium">FLOW</th>
              <th colSpan={5} className="border-b border-border bg-muted p-2 text-center font-medium">
                점검담당자 &nbsp;--&gt;&nbsp; 생산팀장
              </th>
              <th className="no-print w-10 border-b border-border bg-muted p-2" />
            </tr>
            <tr>
              <th className="border-r border-b border-border bg-muted/70 p-1" />
              <th className="border-r border-b border-border bg-muted/70 p-1" />
              <th className="w-8 border-r border-b border-border bg-muted/70 p-1" />
              <th className="w-24 border-r border-b border-border bg-muted/70 p-2 text-center font-medium">발생 일자</th>
              <th className="border-r border-b border-border bg-muted/70 p-2 text-center font-medium">고장 원인</th>
              <th className="border-r border-b border-border bg-muted/70 p-2 text-center font-medium">조치 내용</th>
              <th className="w-24 border-r border-b border-border bg-muted/70 p-2 text-center font-medium">처리 일자</th>
              <th className="w-14 border-b border-border bg-muted/70 p-2 text-center font-medium">비고</th>
              <th className="no-print border-b border-border bg-muted/70 p-1" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="border-r border-b border-border p-0">
                  <Input disabled className={cellInputClass} />
                </td>
                <td className="border-r border-b border-border p-0">
                  <Input disabled className={cellInputClass} />
                </td>
                <td className="border-r border-b border-border p-0" />
                <td className="border-r border-b border-border p-0">
                  <Input disabled className={cellInputClass} />
                </td>
                <td className="border-r border-b border-border p-0">
                  <Input disabled className={cellInputClass} />
                </td>
                <td className="border-r border-b border-border p-0">
                  <Input disabled className={cellInputClass} />
                </td>
                <td className="border-r border-b border-border p-0">
                  <Input disabled className={cellInputClass} />
                </td>
                <td className="border-b border-border p-0">
                  <Input disabled className={cellInputClass} />
                </td>
                <td className="no-print border-b border-border p-1" />
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.id}>
                  <td className="border-r border-b border-border p-0">
                    <Input
                      defaultValue={row.emergencyType ?? ''}
                      onBlur={(e) => startTransition(() => onUpdate(row.id, { emergencyType: e.target.value }))}
                      className={cellInputClass}
                    />
                  </td>
                  <td className="border-r border-b border-border p-0">
                    <Input
                      defaultValue={row.emergencyAction ?? ''}
                      onBlur={(e) => startTransition(() => onUpdate(row.id, { emergencyAction: e.target.value }))}
                      className={cellInputClass}
                    />
                  </td>
                  {index === 0 && (
                    <td rowSpan={dataRowCount} className="border-r border-b border-border bg-muted/20 p-1 text-center">
                      <span className="inline-block [writing-mode:vertical-rl] text-xs text-muted-foreground">
                        문제발생이력
                      </span>
                    </td>
                  )}
                  <td className="border-r border-b border-border p-0">
                    <Input
                      defaultValue={row.occurredDate ?? ''}
                      onBlur={(e) => startTransition(() => onUpdate(row.id, { occurredDate: e.target.value }))}
                      className={cellInputClass}
                    />
                  </td>
                  <td className="border-r border-b border-border p-0">
                    <Input
                      defaultValue={row.cause ?? ''}
                      onBlur={(e) => startTransition(() => onUpdate(row.id, { cause: e.target.value }))}
                      className={cellInputClass}
                    />
                  </td>
                  <td className="border-r border-b border-border p-0">
                    <Input
                      defaultValue={row.action ?? ''}
                      onBlur={(e) => startTransition(() => onUpdate(row.id, { action: e.target.value }))}
                      className={cellInputClass}
                    />
                  </td>
                  <td className="border-r border-b border-border p-0">
                    <Input
                      defaultValue={row.processedDate ?? ''}
                      onBlur={(e) => startTransition(() => onUpdate(row.id, { processedDate: e.target.value }))}
                      className={cellInputClass}
                    />
                  </td>
                  <td className="border-b border-border p-0">
                    <Input
                      defaultValue={row.note ?? ''}
                      onBlur={(e) => startTransition(() => onUpdate(row.id, { note: e.target.value }))}
                      className={cellInputClass}
                    />
                  </td>
                  <td className="no-print border-b border-border p-1 text-center">
                    <Button variant="ghost" size="icon-sm" onClick={() => startTransition(() => onDelete(row.id))}>
                      <Trash2Icon />
                    </Button>
                  </td>
                </tr>
              ))
            )}
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
