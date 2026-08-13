'use client'

import { useOptimistic, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { getDayRange, isWeekend } from '@/lib/date-utils'
import { upsertDailyCheckEntry } from '@/app/actions/daily-check'

const SYMBOLS = ['O', 'X', '△', ''] as const

interface DailyCheckItem {
  id: number
  itemNo: number
  content: string
  method: string | null
  cycle: string | null
}

interface DailyCheckGridProps {
  sheetId: number
  year: number
  month: number
  items: DailyCheckItem[]
  entries: { itemId: number; day: number; value: string | null }[]
}

export function DailyCheckGrid({ sheetId, year, month, items, entries }: DailyCheckGridProps) {
  const days = getDayRange(year, month)
  const [, startTransition] = useTransition()

  const entryMap = new Map(entries.map((e) => [`${e.itemId}-${e.day}`, e.value ?? '']))

  const [optimisticEntries, setOptimisticEntry] = useOptimistic(
    entryMap,
    (state, update: { key: string; value: string }) => {
      const next = new Map(state)
      next.set(update.key, update.value)
      return next
    },
  )

  function handleCellClick(itemId: number, day: number) {
    const key = `${itemId}-${day}`
    const current = optimisticEntries.get(key) ?? ''
    const idx = SYMBOLS.indexOf(current as any)
    const next = SYMBOLS[(idx + 1) % SYMBOLS.length]
    startTransition(() => {
      setOptimisticEntry({ key, value: next })
      upsertDailyCheckEntry(sheetId, itemId, day, next)
    })
  }

  if (items.length === 0) {
    return (
      <div className="border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        점검항목이 없습니다. 설비 관리 페이지에서 점검항목을 먼저 등록하세요.
      </div>
    )
  }

  return (
    <div className="print-sheet overflow-x-auto border border-border">
      <table className="border-collapse text-xs">
        <thead>
          <tr>
            <th rowSpan={2} className="w-10 border-r border-b border-border bg-muted p-1 text-sm font-medium">
              항목
            </th>
            <th rowSpan={2} className="min-w-56 border-r border-b border-border bg-muted p-1 text-left text-sm font-medium">
              점검 부위
            </th>
            <th rowSpan={2} className="w-16 border-r border-b border-border bg-muted p-1 text-sm font-medium">
              점검방법
            </th>
            <th rowSpan={2} className="w-10 border-r border-b border-border bg-muted p-1 text-sm font-medium">
              주기
            </th>
            <th colSpan={days.length} className="border-b border-border bg-muted p-1 text-sm font-medium">
              점검현황
            </th>
          </tr>
          <tr>
            {days.map((day) => (
              <th
                key={day}
                className={cn(
                  'h-7 w-8 border-r border-b border-border p-0 text-xs font-medium last:border-r-0',
                  isWeekend(year, month, day) && 'bg-muted-foreground/10',
                )}
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="border-r border-b border-border p-1 text-center">{item.itemNo}</td>
              <td className="border-r border-b border-border p-1.5 text-left">{item.content}</td>
              <td className="border-r border-b border-border p-1 text-center text-muted-foreground">
                {item.method || '-'}
              </td>
              <td className="border-r border-b border-border p-1 text-center text-muted-foreground">
                {item.cycle || '-'}
              </td>
              {days.map((day) => {
                const key = `${item.id}-${day}`
                const value = optimisticEntries.get(key) ?? ''
                const weekend = isWeekend(year, month, day)
                return (
                  <td
                    key={day}
                    onClick={() => !weekend && handleCellClick(item.id, day)}
                    className={cn(
                      'h-8 w-8 border-r border-b border-border p-0 text-center text-xs font-medium last:border-r-0',
                      weekend ? 'bg-muted-foreground/10 cursor-not-allowed' : 'cursor-pointer hover:bg-accent/30',
                    )}
                  >
                    {value}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
