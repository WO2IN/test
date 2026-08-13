import { cn } from '@/lib/utils'
import { getDayRange, isWeekend } from '@/lib/date-utils'

interface DayHeaderRowProps {
  year: number
  month: number
}

export function DayHeaderRow({ year, month }: DayHeaderRowProps) {
  const days = getDayRange(year, month)
  return (
    <div className="flex">
      {days.map((day) => (
        <div
          key={day}
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center border-r border-b border-border text-xs font-medium last:border-r-0',
            isWeekend(year, month, day) && 'bg-muted text-muted-foreground',
          )}
        >
          {day}
        </div>
      ))}
    </div>
  )
}

export function useDayColumns(year: number, month: number) {
  return getDayRange(year, month)
}
