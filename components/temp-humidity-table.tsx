'use client'

import { useTransition } from 'react'
import { cn } from '@/lib/utils'
import { getDayRange, isWeekend, dayOfWeekLabel } from '@/lib/date-utils'
import { Input } from '@/components/ui/input'
import { upsertTempHumidityEntry } from '@/app/actions/temp-humidity'

interface TempHumidityTableProps {
  sheetId: number
  year: number
  month: number
  entries: { day: number; temperature: string | null; humidity: string | null; checker: string | null }[]
}

export function TempHumidityTable({ sheetId, year, month, entries }: TempHumidityTableProps) {
  const days = getDayRange(year, month)
  const [, startTransition] = useTransition()

  const entryMap = new Map(entries.map((e) => [e.day, e]))

  function handleBlur(day: number, field: 'temperature' | 'humidity' | 'checker', value: string) {
    startTransition(() => {
      upsertTempHumidityEntry(sheetId, day, { [field]: value || null })
    })
  }

  return (
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
            const entry = entryMap.get(day)
            const weekend = isWeekend(year, month, day)
            return (
              <tr key={day} className={cn(weekend && 'bg-muted-foreground/5')}>
                <td className="border-r border-b border-border p-1.5 text-center font-medium">{day}</td>
                <td className="border-r border-b border-border p-1.5 text-center text-muted-foreground">
                  {dayOfWeekLabel(year, month, day)}
                </td>
                <td className="border-r border-b border-border p-0">
                  <Input
                    type="number"
                    step="0.1"
                    defaultValue={entry?.temperature ?? ''}
                    onBlur={(e) => handleBlur(day, 'temperature', e.target.value)}
                    className="h-8 rounded-none border-0 text-center shadow-none focus-visible:ring-0"
                  />
                </td>
                <td className="border-r border-b border-border p-0">
                  <Input
                    type="number"
                    step="0.1"
                    defaultValue={entry?.humidity ?? ''}
                    onBlur={(e) => handleBlur(day, 'humidity', e.target.value)}
                    className="h-8 rounded-none border-0 text-center shadow-none focus-visible:ring-0"
                  />
                </td>
                <td className="border-b border-border p-0">
                  <Input
                    defaultValue={entry?.checker ?? ''}
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
  )
}
