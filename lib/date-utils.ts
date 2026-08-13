export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function isWeekend(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day)
  const dow = date.getDay()
  return dow === 0 || dow === 6
}

export function dayOfWeekLabel(year: number, month: number, day: number): string {
  const labels = ["일", "월", "화", "수", "목", "금", "토"]
  const date = new Date(year, month - 1, day)
  return labels[date.getDay()]
}

export function getDayRange(year: number, month: number): number[] {
  const count = daysInMonth(year, month)
  return Array.from({ length: count }, (_, i) => i + 1)
}

export function currentYearMonth(): { year: number; month: number } {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}
