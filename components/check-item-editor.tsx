'use client'

import { useState } from 'react'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CellSelect } from '@/components/cell-select'
import { CHECK_METHODS, ITEM_CYCLES } from '@/lib/constants/check-catalog'

export interface DraftCheckItem {
  id: number
  content: string
  method: string
  cycle: string
}

interface CheckItemEditorProps {
  items: DraftCheckItem[]
  onChange: (items: DraftCheckItem[]) => void
}

export function CheckItemEditor({ items, onChange }: CheckItemEditorProps) {
  const [draft, setDraft] = useState({ content: '', method: '육안', cycle: '일' })

  function handleAdd() {
    if (!draft.content.trim()) return
    onChange([...items, { id: Date.now(), content: draft.content, method: draft.method || '육안', cycle: draft.cycle || '일' }])
    setDraft({ content: '', method: '육안', cycle: '일' })
  }

  function handleDraftContentBlur() {
    if (draft.content.trim()) handleAdd()
  }

  function handleUpdate(id: number, field: 'content' | 'method' | 'cycle', value: string) {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  function handleDelete(id: number) {
    onChange(items.filter((item) => item.id !== id))
  }

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">항목</TableHead>
            <TableHead>점검 내용</TableHead>
            <TableHead className="w-32">점검방법</TableHead>
            <TableHead className="w-24">주기</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell className="text-muted-foreground">{index + 1}</TableCell>
              <TableCell>
                <Input
                  value={item.content}
                  onChange={(e) => handleUpdate(item.id, 'content', e.target.value)}
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <CellSelect
                  value={item.method}
                  options={CHECK_METHODS}
                  onChange={(value) => handleUpdate(item.id, 'method', value)}
                  className="h-8 rounded-md border border-input"
                />
              </TableCell>
              <TableCell>
                <CellSelect
                  value={item.cycle}
                  options={ITEM_CYCLES}
                  onChange={(value) => handleUpdate(item.id, 'cycle', value)}
                  className="h-8 rounded-md border border-input"
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
                onBlur={handleDraftContentBlur}
                placeholder="새 점검 항목 내용"
                className="h-8"
              />
            </TableCell>
            <TableCell>
              <CellSelect
                value={draft.method}
                options={CHECK_METHODS}
                onChange={(value) => setDraft((d) => ({ ...d, method: value }))}
                className="h-8 rounded-md border border-input"
              />
            </TableCell>
            <TableCell>
              <CellSelect
                value={draft.cycle}
                options={ITEM_CYCLES}
                onChange={(value) => setDraft((d) => ({ ...d, cycle: value }))}
                className="h-8 rounded-md border border-input"
              />
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon-sm" onClick={handleAdd}>
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
