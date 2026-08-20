'use client'

import { useState } from 'react'
import { InspectorManagerFields, type InspectorManagerValue } from '@/components/inspector-manager-fields'
import { updateEquipment } from '@/app/actions/equipment'

interface InspectorManagerCardProps {
  equipment: {
    id: number
    inspectorName?: string | null
    inspectorDesc?: string | null
    inspectorCycle?: string | null
    managerName?: string | null
    managerDesc?: string | null
    managerCycle?: string | null
  }
}

export function InspectorManagerCard({ equipment }: InspectorManagerCardProps) {
  const [value, setValue] = useState<InspectorManagerValue>({
    inspectorName: equipment.inspectorName ?? '',
    inspectorDesc: equipment.inspectorDesc ?? '',
    inspectorCycle: equipment.inspectorCycle || '1회/일',
    managerName: equipment.managerName ?? '',
    managerDesc: equipment.managerDesc ?? '',
    managerCycle: equipment.managerCycle || '1회/주',
  })

  return (
    <InspectorManagerFields
      value={value}
      onChange={setValue}
      onCommit={(field, fieldValue) => {
        updateEquipment(equipment.id, { [field]: fieldValue })
      }}
    />
  )
}
