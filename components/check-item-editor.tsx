'use client'

import { useState } from 'react'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

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

  function handleBlurDefault(id: number, field: 'method' | 'cycle', value: string, fallback: string) {
    if (!value.trim()) {
      onChange(items.map((item) => (item.id === id ? { ...item, [field]: fallback } : item)))
    }
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
            <TableHead className="w-28">점검방법</TableHead>
            <TableHead className="w-20">주기</TableHead>
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
                <Input
                  value={item.method}
                  onChange={(e) => handleUpdate(item.id, 'method', e.target.value)}
                  onBlur={(e) => handleBlurDefault(item.id, 'method', e.target.value, '육안')}
                  className="h-8"
                  placeholder="육안"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={item.cycle}
                  onChange={(e) => handleUpdate(item.id, 'cycle', e.target.value)}
                  onBlur={(e) => handleBlurDefault(item.id, 'cycle', e.target.value, '일')}
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
                onBlur={handleDraftContentBlur}
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
