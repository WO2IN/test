'use client'

import { useTransition } from 'react'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface IssueColumn {
  key: string
  label: string
  width?: string
}

interface IssueLogTableProps {
  title?: string
  columns: IssueColumn[]
  rows: Record<string, any>[]
  onAdd: () => Promise<void>
  onUpdate: (id: number, fields: Record<string, string>) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export function IssueLogTable({ title = '이상발생 조치사항', columns, rows, onAdd, onUpdate, onDelete }: IssueLogTableProps) {
  const [, startTransition] = useTransition()

  return (
    <div className="print-issue-table no-break flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="print-compact-label text-sm font-semibold">{title}</h2>
        <Button
          variant="outline"
          size="sm"
          className="no-print"
          onClick={() => startTransition(() => onAdd())}
        >
          <PlusIcon data-icon="inline-start" />
          행 추가
        </Button>
      </div>
      <div className="overflow-x-auto border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className="border-r border-b border-border bg-muted p-2 text-center font-medium last:border-r-0"
                >
                  {col.label}
                </th>
              ))}
              <th className="no-print w-10 border-b border-border bg-muted p-2" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center text-muted-foreground">
                  등록된 이력이 없습니다.
                </td>
                <td className="no-print" />
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((col) => (
                    <td key={col.key} className="border-r border-b border-border p-0 last:border-r-0">
                      <Input
                        defaultValue={row[col.key] ?? ''}
                        onBlur={(e) =>
                          startTransition(() => onUpdate(row.id, { [col.key]: e.target.value }))
                        }
                        className="print-compact-input h-9 rounded-none border-0 text-center shadow-none focus-visible:ring-0"
                      />
                    </td>
                  ))}
                  <td className="no-print border-b border-border p-1 text-center">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => startTransition(() => onDelete(row.id))}
                    >
                      <Trash2Icon />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
