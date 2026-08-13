'use client'

import { useState } from 'react'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { createDailyCheckItem, deleteDailyCheckItem, updateDailyCheckItem } from '@/app/actions/equipment'

export interface CheckItem {
  id: number
  itemNo: number
  content: string
  method: string | null
  cycle: string | null
}

interface CheckItemManagerProps {
  equipmentId: number
  items: CheckItem[]
}

export function CheckItemManager({ equipmentId, items }: CheckItemManagerProps) {
  const [draft, setDraft] = useState({ content: '', method: '', cycle: '일' })
  const [pending, setPending] = useState(false)

  async function handleAdd() {
    if (!draft.content.trim()) {
      toast.error('점검 내용을 입력해주세요.')
      return
    }
    setPending(true)
    try {
      const nextNo = items.length > 0 ? Math.max(...items.map((i) => i.itemNo)) + 1 : 1
      await createDailyCheckItem(equipmentId, { itemNo: nextNo, ...draft })
      setDraft({ content: '', method: '', cycle: '일' })
    } catch (error) {
      console.error('[v0] add check item error:', error)
      toast.error('추가에 실패했습니다.')
    } finally {
      setPending(false)
    }
  }

  async function handleUpdate(id: number, field: 'content' | 'method' | 'cycle', value: string) {
    await updateDailyCheckItem(id, equipmentId, { [field]: value })
  }

  async function handleDelete(id: number) {
    await deleteDailyCheckItem(id, equipmentId)
  }

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">항목</TableHead>
            <TableHead>점검 내용</TableHead>
            <TableHead className="w-28">점검방법</TableHead>
            <TableHead className="w-20">주기</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="text-muted-foreground">{item.itemNo}</TableCell>
              <TableCell>
                <Input
                  defaultValue={item.content}
                  onBlur={(e) => handleUpdate(item.id, 'content', e.target.value)}
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Input
                  defaultValue={item.method ?? ''}
                  onBlur={(e) => handleUpdate(item.id, 'method', e.target.value)}
                  className="h-8"
                  placeholder="육안"
                />
              </TableCell>
              <TableCell>
                <Input
                  defaultValue={item.cycle ?? ''}
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
            <TableCell className="text-muted-foreground">{items.length + 1}</TableCell>
            <TableCell>
              <Input
                value={draft.content}
                onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                placeholder="새 점검 항목 내용"
                className="h-8"
              />
            </TableCell>
            <TableCell>
              <Input
                value={draft.method}
                onChange={(e) => setDraft((d) => ({ ...d, method: e.target.value }))}
                placeholder="육안"
                className="h-8"
              />
            </TableCell>
            <TableCell>
              <Input
                value={draft.cycle}
                onChange={(e) => setDraft((d) => ({ ...d, cycle: e.target.value }))}
                placeholder="일"
                className="h-8"
              />
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon-sm" onClick={handleAdd} disabled={pending}>
                <PlusIcon />
                <span className="sr-only">추가</span>
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
