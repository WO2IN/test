'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { EmergencyFlowTable } from '@/components/emergency-flow-table'
import {
  createEquipmentEmergencyAction,
  updateEquipmentEmergencyAction,
  deleteEquipmentEmergencyAction,
  updateEquipment,
} from '@/app/actions/equipment'

interface EmergencyActionCardProps {
  equipmentId: number
  equipment: { escalationNote?: string | null }
  rows: Array<Record<string, any>>
}

export function EmergencyActionCard({ equipmentId, equipment, rows }: EmergencyActionCardProps) {
  const [escalationNote, setEscalationNote] = useState(equipment.escalationNote ?? '')

  async function handleAdd() {
    try {
      await createEquipmentEmergencyAction(equipmentId, { sortOrder: rows.length })
    } catch (error) {
      console.error('[v0] add emergency action error:', error)
      toast.error('추가에 실패했습니다.')
    }
  }

  async function handleUpdate(id: number, fields: Record<string, string>) {
    await updateEquipmentEmergencyAction(id, equipmentId, fields)
  }

  async function handleDelete(id: number) {
    await deleteEquipmentEmergencyAction(id, equipmentId)
  }

  return (
    <EmergencyFlowTable
      rows={rows}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      escalationNote={escalationNote}
      onEscalationChange={setEscalationNote}
      onEscalationCommit={(value) => updateEquipment(equipmentId, { escalationNote: value })}
    />
  )
}
