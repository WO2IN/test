'use client'

import { useEffect, useMemo, useOptimistic, useRef, useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { getDayRange, isWeekend } from '@/lib/date-utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { bulkUpsertTempHumidityEntries, upsertTempHumidityEntry, clearTempHumidityEntries } from '@/app/actions/temp-humidity'
import { CalendarCheck2Icon, DicesIcon, Trash2Icon } from 'lucide-react'
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

type Field = 'temperature' | 'humidity'
type Cell = { day: number; field: Field }

function randomInRange(min: number, max: number): string {
  if (min > max) [min, max] = [max, min]
  return Math.round(min + Math.random() * (max - min)).toString()
}

export function TempHumidityTable({ sheetId, year, month, entries }: TempHumidityTableProps) {
  const days = getDayRange(year, month)
  const [, startTransition] = useTransition()
  const [adminOpen, setAdminOpen] = useState(false)
  const [selectionStart, setSelectionStart] = useState<Cell | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<Cell | null>(null)
  const [dragging, setDragging] = useState(false)
  const [tempMin, setTempMin] = useState('15')
  const [tempMax, setTempMax] = useState('25')
  const [humidityMin, setHumidityMin] = useState('40')
  const [humidityMax, setHumidityMax] = useState('60')
  const commandBuffer = useRef('')
  const commandTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  function handleBlur(day: number, field: 'temperature' | 'humidity' | 'checker', value: string) {
    if (isWeekend(year, month, day)) return
    startTransition(() => {
      setOptimisticEntry({ day, fields: { [field]: value || null } })
      upsertTempHumidityEntry(sheetId, day, { [field]: value || null })
    })
  }

  function selectCell(cell: Cell) {
    setSelectionStart((current) => current ?? cell)
    setSelectionEnd(cell)
  }

  function isSelected(day: number, field: Field) {
    if (!selectionStart || !selectionEnd) return false
    const dayMin = Math.min(selectionStart.day, selectionEnd.day)
    const dayMax = Math.max(selectionStart.day, selectionEnd.day)
    const fieldMin = Math.min(selectionStart.field === 'temperature' ? 0 : 1, selectionEnd.field === 'temperature' ? 0 : 1)
    const fieldMax = Math.max(selectionStart.field === 'temperature' ? 0 : 1, selectionEnd.field === 'temperature' ? 0 : 1)
    const fieldIndex = field === 'temperature' ? 0 : 1
    return day >= dayMin && day <= dayMax && fieldIndex >= fieldMin && fieldIndex <= fieldMax
  }

  function fillSelectedEmptyCells() {
    if (!selectionStart || !selectionEnd) return
    const selectedDays = days.filter((day) => !isWeekend(year, month, day) && (isSelected(day, 'temperature') || isSelected(day, 'humidity')))
    const min = Number(tempMin)
    const max = Number(tempMax)
    const hMin = Number(humidityMin)
    const hMax = Number(humidityMax)
    if (![min, max, hMin, hMax].every(Number.isFinite)) return

    const updates = selectedDays.map((day) => {
      const current = optimisticEntries.get(day)
      const temperature = isSelected(day, 'temperature') && !current?.temperature ? randomInRange(min, max) : null
      const humidity = isSelected(day, 'humidity') && !current?.humidity ? randomInRange(hMin, hMax) : null
      return { day, temperature, humidity }
    }).filter((item) => item.temperature !== null || item.humidity !== null)

    if (!updates.length) return
    startTransition(() => {
      updates.forEach(({ day, temperature, humidity }) => {
        const fields = { ...(temperature !== null ? { temperature } : {}), ...(humidity !== null ? { humidity } : {}) }
        setOptimisticEntry({ day, fields })
        upsertTempHumidityEntry(sheetId, day, fields)
      })
    })
  }

  function fillUpToToday() {
    const targetDays = days.filter((day) => day <= todayDay && !isWeekend(year, month, day))
    const min = Number(tempMin), max = Number(tempMax), hMin = Number(humidityMin), hMax = Number(humidityMax)
    const updates = targetDays.map((day) => {
      const current = optimisticEntries.get(day)
      return { day, temperature: current?.temperature || randomInRange(min, max), humidity: current?.humidity || randomInRange(hMin, hMax) }
    }).filter((item) => item.temperature !== (optimisticEntries.get(item.day)?.temperature ?? null) || item.humidity !== (optimisticEntries.get(item.day)?.humidity ?? null))
    startTransition(() => {
      updates.forEach(({ day, temperature, humidity }) => setOptimisticEntry({ day, fields: { temperature, humidity } }))
      bulkUpsertTempHumidityEntries(sheetId, updates)
    })
  }

  function handleClearAll() {
    startTransition(() => {
      days.forEach((day) => setOptimisticEntry({ day, fields: { temperature: null, humidity: null, checker: null } }))
      clearTempHumidityEntries(sheetId)
    })
  }

  return (
    <div className="temp-humidity-table-wrap flex flex-col gap-2">
      <div className="no-print flex flex-col gap-2 border border-border bg-card p-2">
        <div className="flex flex-wrap items-center gap-2">
          {isCurrentMonth && adminOpen && <Button type="button" size="sm" variant="outline" onClick={fillUpToToday} className="h-8 gap-1.5 px-2.5"><CalendarCheck2Icon data-icon="inline-start" />오늘({todayDay}일)까지 채우기</Button>}

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
                <AlertDialogTitle>이번 달 온/습도 내용을 모두 지울까요?</AlertDialogTitle>
                <AlertDialogDescription>
                  {year}년 {month}월 온/습도 체크시트에 입력된 온도, 습도, 점검자 값이 모두 삭제됩니다. 이 작업은 되돌릴 수 없습니다. 
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
        {adminOpen && <div className="flex flex-wrap items-center gap-3 border-t border-border pt-2">
          <span className="text-xs font-medium">난수 범위</span>
          <label className="flex items-center gap-1 text-xs">온도 <Input aria-label="온도 최솟값" type="number" step="1" value={tempMin} onChange={(e) => setTempMin(e.target.value)} className="h-8 w-16 text-center" />~<Input aria-label="온도 최댓값" type="number" step="1" value={tempMax} onChange={(e) => setTempMax(e.target.value)} className="h-8 w-16 text-center" /></label>
          <label className="flex items-center gap-1 text-xs">습도 <Input aria-label="습도 최솟값" type="number" step="1" value={humidityMin} onChange={(e) => setHumidityMin(e.target.value)} className="h-8 w-16 text-center" />~<Input aria-label="습도 최댓값" type="number" step="1" value={humidityMax} onChange={(e) => setHumidityMax(e.target.value)} className="h-8 w-16 text-center" /></label>
          <Button type="button" size="sm" onClick={fillSelectedEmptyCells} disabled={!selectionStart} className="h-8 gap-1.5"><DicesIcon data-icon="inline-start" />선택 범위 빈 셀 채우기</Button>
        </div>}
      </div>

      <div className="print-sheet overflow-x-auto border border-border" onPointerUp={() => setDragging(false)}>
        <table className="no-print min-w-[900px] w-full border-collapse text-xs select-none">
          <thead>
            <tr>
              <th className="w-20 border-r border-b border-border bg-muted p-1.5 text-left text-xs font-medium">구분</th>
              {days.map((day) => <th key={day} className={cn('min-w-7 border-r border-b border-border bg-muted p-1 text-center text-xs font-medium', isWeekend(year, month, day) && 'weekend-cell')}>{day}</th>)}
            </tr>
          </thead>
          <tbody>
            {(['temperature', 'humidity'] as Field[]).map((field) => (
              <tr key={field}>
                <th className="border-r border-b border-border bg-muted p-1.5 text-left text-xs font-medium">{field === 'temperature' ? '온도(℃)' : '습도(%)'}</th>
                {days.map((day) => {
                  const entry = optimisticEntries.get(day)
                  const weekend = isWeekend(year, month, day)
                  return <td key={day} className={cn('border-r border-b border-border p-0', weekend && 'weekend-cell bg-muted-foreground/10', !weekend && isSelected(day, field) && 'bg-primary/20 ring-2 ring-inset ring-primary')} onPointerDown={() => { if (weekend) return; setDragging(true); setSelectionStart({ day, field }); setSelectionEnd({ day, field }) }} onPointerEnter={() => !weekend && dragging && selectCell({ day, field })}>
                    <Input aria-label={`${day}일 ${field === 'temperature' ? '온도' : '습도'}`} type="number" step="1" disabled={weekend} defaultValue={entry?.[field] ?? ''} key={`${field}-${day}-${entry?.[field] ?? ''}`} onBlur={(e) => handleBlur(day, field, e.target.value)} className="h-8 rounded-none border-0 px-1 text-center text-xs shadow-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:bg-muted/50" />
                  </td>
                })}
              </tr>
            ))}
            <tr>
              <th className="border-r border-b border-border bg-muted p-1.5 text-left text-xs font-medium">점검자</th>
              {days.map((day) => { const weekend = isWeekend(year, month, day); return <td key={day} className={cn('border-r border-b border-border p-0', weekend && 'weekend-cell bg-muted-foreground/10')}><Input aria-label={`${day}일 점검자`} disabled={weekend} defaultValue={optimisticEntries.get(day)?.checker ?? ''} key={`checker-${day}-${optimisticEntries.get(day)?.checker ?? ''}`} onBlur={(e) => handleBlur(day, 'checker', e.target.value)} className="h-8 rounded-none border-0 px-1 text-center text-xs shadow-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:bg-muted/50" /></td> })}
            </tr>
          </tbody>
        </table>
        <table className="print-only w-full border-collapse text-[7px]">
          <thead><tr><th className="border border-border bg-muted px-1 py-0.5 text-left">구분</th>{days.map((day) => <th key={day} className="border border-border bg-muted px-0.5 py-0.5 text-center">{day}</th>)}</tr></thead>
          <tbody>
            {(['temperature', 'humidity'] as Field[]).map((field) => <tr key={field}><th className="border border-border bg-muted px-1 py-0.5 text-left font-medium">{field === 'temperature' ? '온도(℃)' : '습도(%)'}</th>{days.map((day) => <td key={day} className="border border-border px-0.5 py-0.5 text-center">{optimisticEntries.get(day)?.[field] ?? ''}</td>)}</tr>)}
            <tr><th className="border border-border bg-muted px-1 py-0.5 text-left font-medium">점검자</th>{days.map((day) => <td key={day} className="border border-border px-0.5 py-0.5 text-center">{optimisticEntries.get(day)?.checker ?? ''}</td>)}</tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
