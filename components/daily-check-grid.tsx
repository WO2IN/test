'use client'

import { useMemo, useOptimistic, useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { getDayRange, isWeekend } from '@/lib/date-utils'
import { upsertDailyCheckEntry, bulkFillDailyCheckEntries, clearDailyCheckSheetEntries } from '@/app/actions/daily-check'
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

const SYMBOLS = ['O', 'X', '△'] as const

const SYMBOL_LABELS: Record<string, string> = {
  O: '양호',
  X: '불량',
  '△': '주의',
}

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
  const [selectedSymbol, setSelectedSymbol] = useState<string>('O')

  const entryMap = new Map(entries.map((e) => [`${e.itemId}-${e.day}`, e.value ?? '']))

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

  function handleCellClick(itemId: number, day: number) {
    const key = `${itemId}-${day}`
    const current = optimisticEntries.get(key) ?? ''
    const next = current === selectedSymbol ? '' : selectedSymbol
    startTransition(() => {
      setOptimisticEntry({ key, value: next })
      upsertDailyCheckEntry(sheetId, itemId, day, next)
    })
  }

  function handleBulkFillToday() {
    const itemIds = items.map((item) => item.id)
    startTransition(() => {
      for (const itemId of itemIds) {
        for (let day = 1; day <= todayDay; day++) {
          if (isWeekend(year, month, day)) continue
          const key = `${itemId}-${day}`
          if (!optimisticEntries.get(key)) {
            setOptimisticEntry({ key, value: 'O' })
          }
        }
      }
      bulkFillDailyCheckEntries(sheetId, year, month, todayDay, 'O', itemIds)
    })
  }

  function handleClearAll() {
    startTransition(() => {
      for (const item of items) {
        for (const day of days) {
          setOptimisticEntry({ key: `${item.id}-${day}`, value: '' })
        }
      }
      clearDailyCheckSheetEntries(sheetId)
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
    <div className="flex flex-col gap-2">
      <div className="no-print flex flex-wrap items-center gap-2 border border-border bg-card p-2">
        <span className="px-1 text-xs font-medium text-muted-foreground">입력할 표시 선택:</span>
        {SYMBOLS.map((symbol) => (
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
            오늘({todayDay}일)까지 O 일괄체크
          </Button>
        )}

        <AlertDialog>
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
              <AlertDialogTitle>이번 달 점검 내용을 모두 지울까요?</AlertDialogTitle>
              <AlertDialogDescription>
                {year}년 {month}월 일상점검 체크시트에 입력된 모든 표시가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
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
                className="print-category-cell w-10 border-r border-b border-border bg-muted p-1 text-sm font-medium"
              >
                항목
              </th>
              <th
                rowSpan={2}
                className="print-content-cell min-w-56 border-r border-b border-border bg-muted p-1 text-left text-sm font-medium"
              >
                점검 부위
              </th>
              <th
                rowSpan={2}
                className="print-cycle-cell w-16 border-r border-b border-border bg-muted p-1 text-sm font-medium"
              >
                점검방법
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
            {items.map((item) => (
              <tr key={item.id}>
                <td className="print-category-cell border-r border-b border-border p-1 text-center">{item.itemNo}</td>
                <td className="print-content-cell border-r border-b border-border p-1.5 text-left">{item.content}</td>
                <td className="print-cycle-cell border-r border-b border-border p-1 text-center text-muted-foreground">
                  {item.method || '-'}
                </td>
                <td className="print-cycle-cell border-r border-b border-border p-1 text-center text-muted-foreground">
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
                        'print-day-cell h-8 w-8 border-r border-b border-border p-0 text-center text-xs font-medium last:border-r-0',
                        weekend ? 'weekend-cell bg-muted-foreground/10 cursor-not-allowed' : 'cursor-pointer hover:bg-accent/30',
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
    </div>
  )
}
