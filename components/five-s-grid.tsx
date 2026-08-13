'use client'

import { useMemo, useOptimistic, useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { getDayRange, isWeekend } from '@/lib/date-utils'
import { FIVE_S_CATALOG, FIVE_S_CATEGORIES, FIVE_S_SYMBOLS, type FiveSItem } from '@/lib/constants/five-s-catalog'
import { upsertFiveSEntry, bulkFillFiveSEntries, clearFiveSSheetEntries } from '@/app/actions/five-s'
import { CheckCheckIcon, EraserIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface FiveSGridProps {
  sheetId: number
  year: number
  month: number
  entries: { itemCode: string; day: number; value: string | null }[]
}

const SYMBOL_LABELS: Record<string, string> = {
  '◎': '매우잘함',
  '○': '잘함',
  '△': '보통수준',
  V: '미흡함',
  '×': '대단히 미흡함',
  'N/A': '해당없음',
}

export function FiveSGrid({ sheetId, year, month, entries }: FiveSGridProps) {
  const days = getDayRange(year, month)
  const [, startTransition] = useTransition()
  const [selectedSymbol, setSelectedSymbol] = useState<string>('○')
  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  const entryMap = new Map(entries.map((e) => [`${e.itemCode}-${e.day}`, e.value ?? '']))

  const [optimisticEntries, setOptimisticEntry] = useOptimistic(
    entryMap,
    (state, update: { key: string; value: string }) => {
      const next = new Map(state)
      next.set(update.key, update.value)
      return next
    },
  )

  const today = useMemo(() => new Date(), [])
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
  const todayDay = today.getDate()

  function handleCellClick(item: FiveSItem, day: number) {
    const key = `${item.code}-${day}`
    const current = optimisticEntries.get(key) ?? ''
    const next = current === selectedSymbol ? '' : selectedSymbol
    startTransition(() => {
      setOptimisticEntry({ key, value: next })
      upsertFiveSEntry(sheetId, item.code, day, next)
    })
  }

  function handleBulkFillToday() {
    startTransition(() => {
      for (const item of FIVE_S_CATALOG) {
        for (let day = 1; day <= todayDay; day++) {
          if (isWeekend(year, month, day)) continue
          const key = `${item.code}-${day}`
          if (!optimisticEntries.get(key)) {
            setOptimisticEntry({ key, value: '○' })
          }
        }
      }
      bulkFillFiveSEntries(sheetId, year, month, todayDay, '○')
    })
  }

  function handleClearAll() {
    setClearDialogOpen(false)
    startTransition(() => {
      for (const item of FIVE_S_CATALOG) {
        for (const day of days) {
          setOptimisticEntry({ key: `${item.code}-${day}`, value: '' })
        }
      }
      clearFiveSSheetEntries(sheetId)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="no-print flex flex-wrap items-center gap-2 border border-border bg-card p-2">
        <span className="px-1 text-xs font-medium text-muted-foreground">입력할 표시 선택:</span>
        {FIVE_S_SYMBOLS.filter((s) => s !== '').map((symbol) => (
          <Button
            key={symbol}
            type="button"
            size="sm"
            variant={selectedSymbol === symbol ? 'default' : 'outline'}
            onClick={() => setSelectedSymbol(symbol)}
            className="h-8 gap-1.5 px-2.5"
          >
            <span className="text-sm font-semibold">{symbol}</span>
            <span className="text-xs">{SYMBOL_LABELS[symbol]}</span>
          </Button>
        ))}
        <Button
          type="button"
          size="sm"
          variant={selectedSymbol === '' ? 'default' : 'outline'}
          onClick={() => setSelectedSymbol('')}
          className="h-8 gap-1.5 px-2.5"
        >
          <EraserIcon className="size-3.5" />
          지우개
        </Button>

        {isCurrentMonth && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleBulkFillToday}
            className="ml-auto h-8 gap-1.5 px-2.5"
          >
            <CheckCheckIcon className="size-3.5" />
            오늘({todayDay}일)까지 ○ 일괄체크
          </Button>
        )}

        <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
          <AlertDialogTrigger
            render={
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={cn('h-8 gap-1.5 px-2.5 text-destructive hover:text-destructive', !isCurrentMonth && 'ml-auto')}
              />
            }
          >
            <Trash2Icon className="size-3.5" />
            전체 지우기
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>이번 달 체크 내용을 모두 지울까요?</AlertDialogTitle>
              <AlertDialogDescription>
                {year}년 {month}월 3정 5S Check Sheet에 입력된 모든 표시가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={handleClearAll}
              >
                전체 지우기
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <p className="no-print px-1 text-xs text-muted-foreground">
        위에서 표시를 선택한 뒤 칸을 클릭하면 바로 입력됩니다. 같은 표시를 다시 클릭하면 지워집니다.
      </p>

      <div className="print-sheet overflow-x-auto border border-border">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="print-category-cell w-14 border-r border-b border-border bg-muted p-1 text-sm font-medium"
              >
                구분
              </th>
              <th
                rowSpan={2}
                className="print-content-cell min-w-56 border-r border-b border-border bg-muted p-1 text-left text-sm font-medium"
              >
                점검 내용
              </th>
              <th
                rowSpan={2}
                className="print-cycle-cell w-10 border-r border-b border-border bg-muted p-1 text-sm font-medium"
              >
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
                    'print-day-cell h-7 w-8 border-r border-b border-border p-0 text-xs font-medium last:border-r-0',
                    isWeekend(year, month, day) && 'weekend-cell bg-muted-foreground/10',
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
                      className="print-category-cell border-r border-b border-border bg-muted/60 p-1 text-center align-middle text-sm font-medium"
                    >
                      {category}
                    </td>
                  )}
                  <td className="print-content-cell border-r border-b border-border p-1.5 text-left">{item.content}</td>
                  <td className="print-cycle-cell border-r border-b border-border p-1 text-center text-muted-foreground">
                    {item.cycle}
                  </td>
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
                          'print-day-cell h-8 w-8 border-r border-b border-border p-0 text-center text-xs font-medium last:border-r-0',
                          weekend ? 'weekend-cell bg-muted-foreground/10 cursor-not-allowed' : 'cursor-pointer hover:bg-accent/30',
                          monthlyHighlight && !weekend && 'monthly-cell bg-accent/70',
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
    </div>
  )
}
