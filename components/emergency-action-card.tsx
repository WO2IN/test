'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { IssueLogTable } from '@/components/issue-log-table'
import { EscalationNoteField } from '@/components/escalation-note-field'
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
    <div className="flex flex-col gap-3">
      <IssueLogTable
        title="이상발생시 조치사항 (FLOW)"
        columns={[
          { key: 'emergencyType', label: '이상 유형', width: '16%' },
          { key: 'emergencyAction', label: '응급조치사항', width: '18%' },
          { key: 'occurredDate', label: '발생 일자', width: '11%' },
          { key: 'cause', label: '고장 원인', width: '20%' },
          { key: 'action', label: '조치 내용', width: '20%' },
          { key: 'processedDate', label: '처리 일자', width: '10%' },
          { key: 'note', label: '비고', width: '5%' },
        ]}
        rows={rows}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
      <EscalationNoteField
        value={escalationNote}
        onChange={setEscalationNote}
        onCommit={(value) => updateEquipment(equipmentId, { escalationNote: value })}
      />
    </div>
  )
}
