'use client'

import { useState, useTransition } from 'react'
import { Edit2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Field, FieldLabel, FieldContent } from '@/components/ui/field'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface SheetHeaderEditorProps {
  id: number
  name: string
  department: string
  manager: string
  standard?: string
  updateAction: (id: number, data: any) => Promise<any>
  showStandard?: boolean
  standardLabel?: string
}

export function SheetHeaderEditor({
  id,
  name,
  department,
  manager,
  standard,
  updateAction,
  showStandard,
  standardLabel = "관리기준",
}: SheetHeaderEditorProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: any = {
      name: formData.get('name') as string,
      department: formData.get('department') as string,
      manager: formData.get('manager') as string,
    }
    if (showStandard) {
      data.standard = formData.get('standard') as string
    }

    startTransition(async () => {
      try {
        await updateAction(id, data)
        toast.success('수정되었습니다.')
        setOpen(false)
        router.refresh()
      } catch (err) {
        toast.error('오류가 발생했습니다.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="no-print ml-2 h-6 w-6 text-muted-foreground hover:text-foreground"
      >
        <Edit2Icon className="h-3 w-3" />
    </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>기본 정보 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="name">항목명 / 설비명</FieldLabel>
            <FieldContent>
              <Input id="name" name="name" defaultValue={name} required />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="department">점검부서</FieldLabel>
            <FieldContent>
              <Input id="department" name="department" defaultValue={department} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="manager">담당자</FieldLabel>
            <FieldContent>
              <Input id="manager" name="manager" defaultValue={manager} />
            </FieldContent>
          </Field>
          {showStandard && (
            <Field>
              <FieldLabel htmlFor="standard">{standardLabel}</FieldLabel>
              <FieldContent>
                <Input id="standard" name="standard" defaultValue={standard} />
              </FieldContent>
            </Field>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              저장
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
