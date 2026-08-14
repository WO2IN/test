'use client'

import { Input } from '@/components/ui/input'

interface EscalationNoteFieldProps {
  value: string
  onChange: (value: string) => void
  onCommit?: (value: string) => void
}

export function EscalationNoteField({ value, onChange, onCommit }: EscalationNoteFieldProps) {
  return (
    <div className="flex items-center gap-2 border border-border bg-muted/40 p-2">
      <span className="shrink-0 text-xs font-medium text-muted-foreground">이상 발생시 전달 경로</span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onCommit?.(e.target.value)}
        placeholder="예: 이상 발생시 (작업자 → 과장 → 부장) 즉시 전달"
        className="h-8 flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
    </div>
  )
}
