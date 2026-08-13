'use client'

import { useOptimistic, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { getDayRange, isWeekend } from '@/lib/date-utils'
import { FIVE_S_CATALOG, FIVE_S_CATEGORIES, FIVE_S_SYMBOLS, type FiveSItem } from '@/lib/constants/five-s-catalog'
import { upsertFiveSEntry } from '@/app/actions/five-s'

interface FiveSGridProps {
  sheetId: number
  year: number
  month: number
  entries: { itemCode: string; day: number; value: string | null }[]
}

export function FiveSGrid({ sheetId, year, month, entries }: FiveSGridProps) {
  const days = getDayRange(year, month)
  const [, startTransition] = useTransition()

  const entryMap = new Map(entries.map((e) => [`${e.itemCode}-${e.day}`, e.value ?? '']))

  const [optimisticEntries, setOptimisticEntry] = useOptimistic(
    entryMap,
    (state, update: { key: string; value: string }) => {
      const next = new Map(state)
      next.set(update.key, update.value)
      return next
    },
  )

  function handleCellClick(item: FiveSItem, day: number) {
    const key = `${item.code}-${day}`
    const current = optimisticEntries.get(key) ?? ''
    const idx = FIVE_S_SYMBOLS.indexOf(current as any)
    const next = FIVE_S_SYMBOLS[(idx + 1) % FIVE_S_SYMBOLS.length]
    startTransition(() => {
      setOptimisticEntry({ key, value: next })
      upsertFiveSEntry(sheetId, item.code, day, next)
    })
  }

  return (
    <div className="print-sheet overflow-x-auto border border-border">
      <table className="border-collapse text-xs">
        <thead>
          <tr>
            <th rowSpan={2} className="w-14 border-r border-b border-border bg-muted p-1 text-sm font-medium">
              구분
            </th>
            <th rowSpan={2} className="min-w-56 border-r border-b border-border bg-muted p-1 text-left text-sm font-medium">
              점검 내용
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
          {FIVE_S_CATEGORIES.map((category) => {
            const rows = FIVE_S_CATALOG.filter((item) => item.category === category)
            return rows.map((item, rowIdx) => (
              <tr key={item.code}>
                {rowIdx === 0 && (
                  <td
                    rowSpan={rows.length}
                    className="border-r border-b border-border bg-muted/60 p-1 text-center align-middle text-sm font-medium"
                  >
                    {category}
                  </td>
                )}
                <td className="border-r border-b border-border p-1.5 text-left">{item.content}</td>
                <td className="border-r border-b border-border p-1 text-center text-muted-foreground">{item.cycle}</td>
                {days.map((day) => {
                  const key = `${item.code}-${day}`
                  const value = optimisticEntries.get(key) ?? ''
                  const weekend = isWeekend(year, month, day)
                  const monthlyHighlight = item.cycle === '월'
                  return (
                    <td
                      key={day}
                      onClick={() => !weekend && handleCellClick(item, day)}
                      className={cn(
                        'h-8 w-8 border-r border-b border-border p-0 text-center text-xs font-medium last:border-r-0',
                        weekend ? 'bg-muted-foreground/10 cursor-not-allowed' : 'cursor-pointer hover:bg-accent/30',
                        monthlyHighlight && !weekend && 'bg-accent/70',
                      )}
                    >
                      {value}
                    </td>
                  )
                })}
              </tr>
            ))
          })}
        </tbody>
      </table>
    </div>
  )
}
