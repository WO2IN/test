'use client'

import Link from 'next/link'
import { useState } from 'react'
import { BuildingIcon, UserIcon, Trash2Icon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { deleteEquipment } from '@/app/actions/equipment'

interface EquipmentCardProps {
  equipment: {
    id: number
    name: string
    department: string | null
    manager: string | null
  }
}

export function EquipmentCard({ equipment }: EquipmentCardProps) {
  const [pending, setPending] = useState(false)

  async function handleDelete() {
    setPending(true)
    try {
      await deleteEquipment(equipment.id)
      toast.success('설비가 삭제되었습니다.')
    } catch (error) {
      console.error('[v0] delete equipment error:', error)
      toast.error('삭제에 실패했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="group relative">
      <CardHeader>
        <CardTitle>
          <Link href={`/equipment/${equipment.id}`} className="hover:text-primary">
            {equipment.name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        {equipment.department && (
          <div className="flex items-center gap-2">
            <BuildingIcon className="size-3.5" />
            {equipment.department}
          </div>
        )}
        {equipment.manager && (
          <div className="flex items-center gap-2">
            <UserIcon className="size-3.5" />
            {equipment.manager}
          </div>
        )}
      </CardContent>
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-3 right-3 text-muted-foreground opacity-0 group-hover:opacity-100"
            />
          }
        >
          <Trash2Icon />
          <span className="sr-only">삭제</span>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>설비를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              {equipment.name} 설비와 연관된 사진, 점검항목이 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={pending}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
