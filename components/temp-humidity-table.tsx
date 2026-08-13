'use client'

import { useMemo, useOptimistic, useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { getDayRange, isWeekend, dayOfWeekLabel } from '@/lib/date-utils'
import { Input } from '@/components/ui/input'
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
import {
  upsertTempHumidityEntry,
  bulkUpsertTempHumidityEntries,
  clearTempHumidityEntries,
} from '@/app/actions/temp-humidity'
import { CalendarCheck2Icon, CalendarDaysIcon, CalendarRangeIcon, Trash2Icon } from 'lucide-react'

interface TempHumidityEntry {
  day: number
  temperature: string | null
  humidity: string | null
  checker: string | null
}

interface TempHumidityTableProps {
  sheetId: number
  year: number
  month: number
  entries: TempHumidityEntry[]
}

function randomInRange(min: number, max: number): string {
  if (min > max) [min, max] = [max, min]
  const value = min + Math.random() * (max - min)
  return value.toFixed(1)
}

export function TempHumidityTable({ sheetId, year, month, entries }: TempHumidityTableProps) {
  const days = getDayRange(year, month)
  const [, startTransition] = useTransition()

  const [tempMin, setTempMin] = useState('15')
  const [tempMax, setTempMax] = useState('25')
  const [humidityMin, setHumidityMin] = useState('40')
  const [humidityMax, setHumidityMax] = useState('60')

  const entryMap = new Map(entries.map((e) => [e.day, e]))

  const [optimisticEntries, setOptimisticEntry] = useOptimistic(
    entryMap,
    (state, update: { day: number; fields: Partial<TempHumidityEntry> }) => {
      const next = new Map(state)
      const current = next.get(update.day) ?? { day: update.day, temperature: null, humidity: null, checker: null }
      next.set(update.day, { ...current, ...update.fields })
      return next
    },
  )

  const today = useMemo(() => new Date(), [])
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
  const todayDay = today.getDate()

  function handleBlur(day: number, field: 'temperature' | 'humidity' | 'checker', value: string) {
    startTransition(() => {
      upsertTempHumidityEntry(sheetId, day, { [field]: value || null })
    })
  }

  function generateEntries(targetDays: number[]) {
    const min = Number(tempMin)
    const max = Number(tempMax)
    const hMin = Number(humidityMin)
    const hMax = Number(humidityMax)
    return targetDays.map((day) => ({
      day,
      temperature: randomInRange(min, max),
      humidity: randomInRange(hMin, hMax),
    }))
  }

  function runRandomFill(targetDays: number[]) {
    const newEntries = generateEntries(targetDays)
    startTransition(() => {
      for (const { day, temperature, humidity } of newEntries) {
        const existing = optimisticEntries.get(day)
        setOptimisticEntry({
          day,
          fields: {
            temperature: existing?.temperature || temperature,
            humidity: existing?.humidity || humidity,
          },
        })
      }
      bulkUpsertTempHumidityEntries(sheetId, newEntries)
    })
  }

  function handleFillAllDays() {
    runRandomFill(days)
  }

  function handleFillUpToToday() {
    runRandomFill(days.filter((day) => day <= todayDay))
  }

  function handleFillWeekly() {
    runRandomFill(days.filter((day) => (day - 1) % 7 === 0))
  }

  function handleClearAll() {
    startTransition(() => {
      for (const day of days) {
        setOptimisticEntry({ day, fields: { temperature: null, humidity: null } })
      }
      clearTempHumidityEntries(sheetId)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="no-print flex flex-col gap-2 border border-border bg-card p-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-1 text-xs font-medium text-muted-foreground">난수 범위 설정:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">온도(℃)</span>
            <Input
              type="number"
              step="0.1"
              value={tempMin}
              onChange={(e) => setTempMin(e.target.value)}
              className="h-8 w-16 text-center"
            />
            <span className="text-xs text-muted-foreground">~</span>
            <Input
              type="number"
              step="0.1"
              value={tempMax}
              onChange={(e) => setTempMax(e.target.value)}
              className="h-8 w-16 text-center"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">습도(%)</span>
            <Input
              type="number"
              step="0.1"
              value={humidityMin}
              onChange={(e) => setHumidityMin(e.target.value)}
              className="h-8 w-16 text-center"
            />
            <span className="text-xs text-muted-foreground">~</span>
            <Input
              type="number"
              step="0.1"
              value={humidityMax}
              onChange={(e) => setHumidityMax(e.target.value)}
              className="h-8 w-16 text-center"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={handleFillAllDays} className="h-8 gap-1.5 px-2.5">
            <CalendarRangeIcon className="size-3.5" />
            1일부터 일별로 채우기
          </Button>
          {isCurrentMonth && (
            <Button type="button" size="sm" variant="outline" onClick={handleFillUpToToday} className="h-8 gap-1.5 px-2.5">
              <CalendarCheck2Icon className="size-3.5" />
              오늘({todayDay}일)까지 채우기
            </Button>
          )}
          <Button type="button" size="sm" variant="outline" onClick={handleFillWeekly} className="h-8 gap-1.5 px-2.5">
            <CalendarDaysIcon className="size-3.5" />
            주마다 채우기
          </Button>
          <p className="px-1 text-xs text-muted-foreground">이미 입력된 값은 덮어쓰지 않습니다.</p>

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="ml-auto h-8 gap-1.5 px-2.5 text-destructive hover:text-destructive"
                />
              }
            >
              <Trash2Icon className="size-3.5" />
              전체 지우기
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>이번 달 온/습도 기록을 모두 지울까요?</AlertDialogTitle>
                <AlertDialogDescription>
                  {year}년 {month}월 온/습도 체크시트에 입력된 모든 값이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={handleClearAll}>
                  전체 지우기
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="print-sheet overflow-x-auto border border-border">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="w-10 border-r border-b border-border bg-muted p-1.5 text-sm font-medium">일자</th>
              <th className="w-10 border-r border-b border-border bg-muted p-1.5 text-sm font-medium">요일</th>
              <th className="w-20 border-r border-b border-border bg-muted p-1.5 text-sm font-medium">온도(℃)</th>
              <th className="w-20 border-r border-b border-border bg-muted p-1.5 text-sm font-medium">습도(%)</th>
              <th className="w-24 border-b border-border bg-muted p-1.5 text-sm font-medium">점검자</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => {
              const entry = optimisticEntries.get(day)
              const weekend = isWeekend(year, month, day)
              return (
                <tr key={day} className={cn(weekend && 'weekend-cell bg-muted-foreground/5')}>
                  <td className="border-r border-b border-border p-1.5 text-center font-medium">{day}</td>
                  <td className="border-r border-b border-border p-1.5 text-center text-muted-foreground">
                    {dayOfWeekLabel(year, month, day)}
                  </td>
                  <td className="border-r border-b border-border p-0">
                    <Input
                      type="number"
                      step="0.1"
                      defaultValue={entry?.temperature ?? ''}
                      key={`temp-${day}-${entry?.temperature ?? ''}`}
                      onBlur={(e) => handleBlur(day, 'temperature', e.target.value)}
                      className="h-8 rounded-none border-0 text-center shadow-none focus-visible:ring-0"
                    />
                  </td>
                  <td className="border-r border-b border-border p-0">
                    <Input
                      type="number"
                      step="0.1"
                      defaultValue={entry?.humidity ?? ''}
                      key={`humidity-${day}-${entry?.humidity ?? ''}`}
                      onBlur={(e) => handleBlur(day, 'humidity', e.target.value)}
                      className="h-8 rounded-none border-0 text-center shadow-none focus-visible:ring-0"
                    />
                  </td>
                  <td className="border-b border-border p-0">
                    <Input
                      defaultValue={entry?.checker ?? ''}
                      key={`checker-${day}-${entry?.checker ?? ''}`}
                      onBlur={(e) => handleBlur(day, 'checker', e.target.value)}
                      className="h-8 rounded-none border-0 text-center shadow-none focus-visible:ring-0"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
