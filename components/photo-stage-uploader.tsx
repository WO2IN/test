'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { PlusIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoStageUploaderProps {
  label: string
  file: File | null
  onChange: (file: File | null) => void
  size?: 'default' | 'large'
}

export function PhotoStageUploader({ label, file, onChange, size = 'default' }: PhotoStageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const boxClass = size === 'large' ? 'h-40 w-64' : 'size-24'

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {previewUrl ? (
        <div className={cn('group relative overflow-hidden rounded-md border border-border', boxClass)}>
          <Image src={previewUrl || '/placeholder.svg'} alt={label} fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
          >
            <XIcon className="size-3" />
            <span className="sr-only">제거</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-muted-foreground hover:bg-accent/30',
            boxClass,
          )}
        >
          <PlusIcon className="size-4" />
          <span className="text-xs">사진 추가</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0]
          if (selected) onChange(selected)
          e.target.value = ''
        }}
      />
    </div>
  )
}
