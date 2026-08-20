'use client'

import { useState } from 'react'
import { PlusIcon, Trash2Icon, SettingsIcon } from 'lucide-react'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { FIVE_S_CATEGORIES } from '@/lib/constants/five-s-catalog'
import { createFiveSCheckItem, deleteFiveSCheckItem, updateFiveSCheckItem } from '@/app/actions/five-s'

export interface FiveSCheckItemRow {
  id: number
  category: string
  no: number
  content: string
  cycle: string
}

interface FiveSItemManagerProps {
  targetId: number
  items: FiveSCheckItemRow[]
}

export function FiveSItemManager({ targetId, items }: FiveSItemManagerProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, { content: string; cycle: string }>>(
    Object.fromEntries(FIVE_S_CATEGORIES.map((c) => [c, { content: '', cycle: '일' }])),
  )

  async function handleAdd(category: string) {
    const draft = drafts[category]
    if (!draft.content.trim()) {
      toast.error('점검 내용을 입력해주세요.')
      return
    }
    setPending(true)
    try {
      await createFiveSCheckItem(targetId, { category, content: draft.content, cycle: draft.cycle })
      setDrafts((d) => ({ ...d, [category]: { content: '', cycle: '일' } }))
    } catch (error) {
      console.error('[v0] add 5s item error:', error)
      toast.error('추가에 실패했습니다.')
    } finally {
      setPending(false)
    }
  }

  async function handleUpdate(id: number, field: 'content' | 'cycle', value: string) {
    await updateFiveSCheckItem(id, targetId, { [field]: value })
  }

  async function handleDelete(id: number) {
    await deleteFiveSCheckItem(id, targetId)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="no-print inline-flex h-8 items-center gap-1.5 border border-border bg-card px-2.5 text-xs font-medium hover:bg-accent/30"
      >
        <SettingsIcon className="size-3.5" />
        점검항목 관리
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>3정 5S 점검항목 관리</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          {FIVE_S_CATEGORIES.map((category) => {
            const rows = items.filter((item) => item.category === category).sort((a, b) => a.no - b.no)
            const draft = drafts[category]
            return (
              <div key={category} className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">{category}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>점검 내용</TableHead>
                      <TableHead className="w-20">주기</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-muted-foreground">{item.no}</TableCell>
                        <TableCell>
                          <Input
                            defaultValue={item.content}
                            onBlur={(e) => handleUpdate(item.id, 'content', e.target.value)}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            defaultValue={item.cycle}
                            onBlur={(e) => handleUpdate(item.id, 'cycle', e.target.value)}
                            className="h-8"
                            placeholder="일"
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(item.id)}>
                            <Trash2Icon />
                            <span className="sr-only">삭제</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="text-muted-foreground">{rows.length + 1}</TableCell>
                      <TableCell>
                        <Input
                          value={draft.content}
                          onChange={(e) =>
                            setDrafts((d) => ({ ...d, [category]: { ...d[category], content: e.target.value } }))
                          }
                          placeholder="새 점검 항목 내용"
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={draft.cycle}
                          onChange={(e) =>
                            setDrafts((d) => ({ ...d, [category]: { ...d[category], cycle: e.target.value } }))
                          }
                          placeholder="일"
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleAdd(category)} disabled={pending}>
                          <PlusIcon />
                          <span className="sr-only">추가</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )
          })}
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => setOpen(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
