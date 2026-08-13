'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { PlusIcon, XIcon, Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { addEquipmentPhoto, deleteEquipmentPhoto } from '@/app/actions/equipment'

export interface EquipmentPhoto {
  id: number
  url: string
  label: string | null
}

interface PhotoUploaderProps {
  equipmentId: number
  photos: EquipmentPhoto[]
  label: string
}

export function PhotoUploader({ equipmentId, photos, label }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('upload failed')
      const { url } = await res.json()
      await addEquipmentPhoto(equipmentId, url, label)
    } catch (error) {
      console.error('[v0] photo upload error:', error)
      toast.error('사진 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: number, url: string) {
    await deleteEquipmentPhoto(id, equipmentId, url)
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative size-24 overflow-hidden rounded-md border border-border">
            <Image src={photo.url || '/placeholder.svg'} alt={label} fill className="object-cover" />
            <button
              type="button"
              onClick={() => handleDelete(photo.id, photo.url)}
              className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
            >
              <XIcon className="size-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex size-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-muted-foreground hover:bg-accent/30"
        >
          {uploading ? <Loader2Icon className="size-4 animate-spin" /> : <PlusIcon className="size-4" />}
          <span className="text-xs">사진 추가</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
