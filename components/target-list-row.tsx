'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronRightIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface TargetListRowProps {
  href: string
  name: string
  department?: string | null
  manager?: string | null
  deleteTitle: string
  deleteDescription: string
  deleteAction: (id: number) => Promise<void>
  id: number
}

export function TargetListRow({
  href,
  name,
  department,
  manager,
  deleteTitle,
  deleteDescription,
  deleteAction,
  id,
}: TargetListRowProps) {
  const [pending, setPending] = useState(false)

  async function handleDelete() {
    setPending(true)
    try {
      await deleteAction(id)
      toast.success('삭제되었습니다.')
    } catch (error) {
      console.error('[v0] delete target error:', error)
      toast.error('삭제에 실패했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex items-center gap-2 bg-card transition-colors hover:bg-accent/20">
      <Link href={href} className="flex min-w-0 flex-1 items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-medium">{name}</span>
          <span className="truncate text-sm text-muted-foreground">
            {department || '부서 미지정'} · {manager || '담당자 미지정'}
          </span>
        </div>
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
      </Link>
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="mr-3 shrink-0 text-muted-foreground hover:text-destructive"
            />
          }
        >
          <Trash2Icon />
          <span className="sr-only">{name} 삭제</span>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{deleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={pending}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
