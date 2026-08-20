'use client'

import { CalendarDaysIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDayRange, isWeekend } from '@/lib/date-utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

interface HolidayPickerPopoverProps {
  year: number
  month: number
  holidays: number[]
  onToggle: (day: number) => void
}

export function HolidayPickerPopover({ year, month, holidays, onToggle }: HolidayPickerPopoverProps) {
  const days = getDayRange(year, month)

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            size="sm"
            variant={holidays.length > 0 ? 'secondary' : 'outline'}
            className="h-8 gap-1.5 px-2.5"
          />
        }
      >
        <CalendarDaysIcon className="size-3.5" />
        휴무일
        {holidays.length > 0 && <span className="text-xs text-muted-foreground">({holidays.length})</span>}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 gap-3 p-3">
        <PopoverHeader>
          <PopoverTitle>휴무일 지정</PopoverTitle>
          <PopoverDescription>
            평일 날짜를 클릭해 휴무일을 지정하거나 해제합니다. 주말은 자동으로 휴무 처리됩니다.
          </PopoverDescription>
        </PopoverHeader>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const weekend = isWeekend(year, month, day)
            const holiday = holidays.includes(day)
            return (
              <button
                key={day}
                type="button"
                disabled={weekend}
                onClick={() => onToggle(day)}
                className={cn(
                  'h-8 rounded-md border text-xs font-medium transition-colors',
                  weekend && 'cursor-not-allowed border-transparent bg-muted/40 text-muted-foreground/50',
                  !weekend && !holiday && 'border-border bg-background hover:bg-accent/40',
                  !weekend && holiday && 'border-primary bg-primary/15 text-primary hover:bg-primary/25',
                )}
                aria-pressed={holiday}
                aria-label={`${day}일${holiday ? ' 휴무' : ''}`}
              >
                {day}
              </button>
            )
          })}
        </div>
        {holidays.length > 0 && (
          <p className="text-xs text-muted-foreground">지정된 휴무일: {holidays.join(', ')}일</p>
        )}
      </PopoverContent>
    </Popover>
  )
}
