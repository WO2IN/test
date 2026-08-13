'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { createEquipment } from '@/app/actions/equipment'

export function EquipmentFormDialog() {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [form, setForm] = useState({ name: '', department: '', manager: '', location: '' })
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('설비명을 입력해주세요.')
      return
    }
    setPending(true)
    try {
      const created = await createEquipment(form)
      setOpen(false)
      setForm({ name: '', department: '', manager: '', location: '' })
      toast.success('설비가 등록되었습니다.')
      if (created) router.push(`/equipment/${created.id}`)
    } catch (error) {
      console.error('[v0] create equipment error:', error)
      toast.error('설비 등록에 실패했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        설비 등록
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>신규 설비 등록</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">설비명</FieldLabel>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="예: 3층 도금라인 도금조"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="department">점검부서</FieldLabel>
              <Input
                id="department"
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                placeholder="예: 생산팀"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="manager">담당자</FieldLabel>
              <Input
                id="manager"
                value={form.manager}
                onChange={(e) => setForm((f) => ({ ...f, manager: e.target.value }))}
                placeholder="예: 우데스 과장"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="location">위치</FieldLabel>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="예: 3층 생산라인"
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? '등록 중...' : '등록'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
