'use client'

import { useEffect, useMemo, useOptimistic, useRef, useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { getDayRange, isWeekend } from '@/lib/date-utils'
import { FIVE_S_CATEGORIES, FIVE_S_SYMBOLS } from '@/lib/constants/five-s-catalog'
import { upsertFiveSEntry, bulkFillFiveSEntries, clearFiveSSheetEntries } from '@/app/actions/five-s'
import { Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HolidayPickerPopover } from '@/components/holiday-picker-popover'
import { RangeFillPopover } from '@/components/range-fill-popover'
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

export interface FiveSCheckItem {
  id: number
  code: string
  category: string
  no: number
  content: string
  cycle: string
}

interface FiveSGridProps {
  sheetId: number
  year: number
  month: number
  items: FiveSCheckItem[]
  entries: { itemCode: string; day: number; value: string | null }[]
  holidays?: number[]
  onToggleHoliday?: (day: number) => void
}

const SYMBOL_LABELS: Record<string, string> = {
  '◎': '매우잘함',
  '○': '잘함',
  '△': '보통수준',
  V: '미흡함',
  '×': '대단히 미흡함',
  'N/A': '해당없음',
}

export function FiveSGrid({ sheetId, year, month, items, entries, holidays = [], onToggleHoliday }: FiveSGridProps) {
  const days = getDayRange(year, month)
  const [, startTransition] = useTransition()
  const [selectedSymbol, setSelectedSymbol] = useState<string>('○')
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [optimisticHolidays, toggleOptimisticHoliday] = useOptimistic(
    holidays,
    (state, day: number) =>
      state.includes(day) ? state.filter((d) => d !== day) : [...state, day].sort((a, b) => a - b),
  )

  function isDayOff(day: number) {
    return isWeekend(year, month, day) || optimisticHolidays.includes(day)
  }
  const commandBuffer = useRef('')
  const commandTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return
      commandBuffer.current = `${commandBuffer.current}${event.key.toLowerCase()}`.slice(-8)
      if (commandBuffer.current === 'woorihip') {
        setAdminOpen((open) => !open)
        commandBuffer.current = ''
      }
      if (commandTimer.current) clearTimeout(commandTimer.current)
      commandTimer.current = setTimeout(() => { commandBuffer.current = '' }, 1500)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      if (commandTimer.current) clearTimeout(commandTimer.current)
    }
  }, [])

  function handleCellClick(item: FiveSCheckItem, day: number) {
    if (isDayOff(day)) return
    const key = `${item.code}-${day}`
    const current = optimisticEntries.get(key) ?? ''
    const next = current === selectedSymbol ? '' : selectedSymbol
    startTransition(() => {
      setOptimisticEntry({ key, value: next })
      upsertFiveSEntry(sheetId, item.code, day, next)
    })
  }

  function isScheduledDay(item: FiveSCheckItem, day: number) {
    if (isDayOff(day)) return false
    if (item.cycle === '일') return true
    if (item.cycle === '주') return new Date(year, month - 1, day).getDay() === 1
    return day === Array.from({ length: day }, (_, index) => index + 1).find((candidate) => !isDayOff(candidate))
  }

  function handleBulkFill(fromDay: number, toDay: number) {
    startTransition(() => {
      for (const item of items) {
        for (let day = fromDay; day <= toDay; day++) {
          if (!isScheduledDay(item, day)) continue
          const key = `${item.code}-${day}`
          if (!optimisticEntries.get(key)) setOptimisticEntry({ key, value: selectedSymbol })
        }
      }
      bulkFillFiveSEntries(sheetId, year, month, toDay, selectedSymbol, items, fromDay)
    })
  }

  function handleClearAll() {
    setClearDialogOpen(false)
    startTransition(() => {
      for (const item of items) {
        for (const day of days) {
          setOptimisticEntry({ key: `${item.code}-${day}`, value: '' })
        }
      }
      clearFiveSSheetEntries(sheetId)
    })
  }

  function handleHolidayToggle(day: number) {
    if (isWeekend(year, month, day) || !onToggleHoliday) return
    const adding = !optimisticHolidays.includes(day)
    startTransition(() => {
      toggleOptimisticHoliday(day)
      if (adding) {
        for (const item of items) {
          setOptimisticEntry({ key: `${item.code}-${day}`, value: '' })
        }
      }
      onToggleHoliday(day)
    })
  }

  return (
    <div className="print-grid flex min-h-0 flex-col gap-2">
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

        <div className="ml-auto flex items-center gap-2">
          {adminOpen && (
            <RangeFillPopover
              lastDay={days.length}
              todayDay={todayDay}
              isCurrentMonth={isCurrentMonth}
              description={`선택한 표시(${selectedSymbol})를 빈 칸에만 채웁니다. 휴무일·주말과 주기 외 날짜는 건너뜁니다.`}
              onFillRange={handleBulkFill}
              onFillUpToToday={isCurrentMonth ? () => handleBulkFill(1, todayDay) : undefined}
            />
          )}
          {onToggleHoliday && (
            <HolidayPickerPopover
              year={year}
              month={month}
              holidays={optimisticHolidays}
              onToggle={handleHolidayToggle}
            />
          )}

        <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
          <AlertDialogTrigger
            render={
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 px-2.5 text-destructive hover:text-destructive"
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
                className="print-cycle-cell w-14 border-r border-b border-border bg-muted p-1 text-sm font-medium"
              >
                주기
              </th>
              <th colSpan={days.length} className="border-b border-border bg-muted p-1 text-sm font-medium">
                점검현황
              </th>
            </tr>
            <tr>
              {days.map((day) => {
                const weekend = isWeekend(year, month, day)
                const holiday = optimisticHolidays.includes(day)
                return (
                  <th
                    key={day}
                    className={cn(
                      'print-day-cell h-7 w-8 border-r border-b border-border p-0 text-xs font-medium last:border-r-0',
                      (weekend || holiday) && 'weekend-cell bg-muted-foreground/10',
                    )}
                  >
                    {day}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {FIVE_S_CATEGORIES.map((category) => {
              const rows = items.filter((item) => item.category === category)
              return rows.map((item, rowIdx) => (
                <tr key={item.code}>
                  {rowIdx === 0 && (
                    <td
                      rowSpan={rows.length}
                      className="print-category-cell whitespace-nowrap border-r border-b border-border bg-muted/60 p-1 text-center align-middle text-sm font-medium"
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
                    const dayOff = isDayOff(day)
                    const monthlyHighlight = item.cycle === '월'
                    return (
                      <td
                        key={day}
                        onClick={() => !dayOff && handleCellClick(item, day)}
                        className={cn(
                          'print-day-cell h-8 w-8 border-r border-b border-border p-0 text-center text-xs font-medium last:border-r-0',
                          dayOff ? 'weekend-cell bg-muted-foreground/10 cursor-not-allowed' : 'cursor-pointer hover:bg-accent/30',
                          monthlyHighlight && !dayOff && 'monthly-cell bg-accent/70',
                        )}
                      >
                        {dayOff ? '' : value}
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
