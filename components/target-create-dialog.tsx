'use client'

import { useState, useTransition } from 'react'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Field, FieldLabel, FieldError, FieldContent } from '@/components/ui/field'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface TargetCreateDialogProps {
  title: string
  triggerText: string
  createAction: (data: { name: string; department?: string; manager?: string; standard?: string }) => Promise<{ id: number }>
  redirectPathPrefix: string
}

export function TargetCreateDialog({ title, triggerText, createAction, redirectPathPrefix }: TargetCreateDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      department: formData.get('department') as string,
      manager: formData.get('manager') as string,
      standard: formData.get('standard') as string,
    }

    if (!data.name) {
      toast.error('이름을 입력해주세요.')
      return
    }

    startTransition(async () => {
      try {
        const result = await createAction(data)
        toast.success('추가되었습니다.')
        setOpen(false)
        router.push(`${redirectPathPrefix}/${result.id}`)
      } catch (err) {
        toast.error('오류가 발생했습니다.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <PlusIcon data-icon="inline-start" />
        {triggerText}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="name">항목명 / 구역명</FieldLabel>
            <FieldContent>
              <Input id="name" name="name" placeholder="예: 3층 도금라인" required />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="department">점검부서</FieldLabel>
            <FieldContent>
              <Input id="department" name="department" placeholder="예: 생산팀" />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="manager">담당자</FieldLabel>
            <FieldContent>
              <Input id="manager" name="manager" placeholder="담당자 이름" />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="standard">관리기준 (옵션)</FieldLabel>
            <FieldContent>
              <Input id="standard" name="standard" placeholder="기본적으로 적용할 기준 문구" />
            </FieldContent>
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              추가
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
