'use client'

import { cn } from '@/lib/utils'

interface CycleCellProps {
  value: string | null | undefined
  symbols: readonly string[]
  onChange: (next: string) => void
  disabled?: boolean
  highlighted?: boolean
  className?: string
}

export function CycleCell({ value, symbols, onChange, disabled, highlighted, className }: CycleCellProps) {
  function handleClick() {
    if (disabled) return
    const idx = symbols.indexOf(value ?? '')
    const next = symbols[(idx + 1) % symbols.length]
    onChange(next)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'flex h-8 w-8 items-center justify-center border-r border-border text-xs font-medium last:border-r-0',
        disabled ? 'bg-muted/60 text-muted-foreground cursor-not-allowed' : 'cursor-pointer hover:bg-accent/40',
        highlighted && !disabled && 'bg-accent/70 text-accent-foreground',
        className,
      )}
    >
      {value || ''}
    </button>
  )
}
