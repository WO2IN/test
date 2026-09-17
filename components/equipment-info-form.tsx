'use client'

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { updateEquipment } from '@/app/actions/equipment'

interface EquipmentInfoFormProps {
  equipment: {
    id: number
    name: string
    floor?: string | null
    department: string | null
    manager: string | null
  }
}

export function EquipmentInfoForm({ equipment }: EquipmentInfoFormProps) {
  function handleBlur(field: 'name' | 'floor' | 'department' | 'manager', value: string) {
    updateEquipment(equipment.id, { [field]: value })
  }

  return (
    <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-4">
      <Field>
        <FieldLabel>설비명</FieldLabel>
        <Input defaultValue={equipment.name} onBlur={(e) => handleBlur('name', e.target.value)} />
      </Field>
      <Field>
        <FieldLabel>층</FieldLabel>
        <Input
          defaultValue={equipment.floor ?? ''}
          onBlur={(e) => handleBlur('floor', e.target.value.replace(/[^0-9]/g, ''))}
          inputMode="numeric"
        />
      </Field>
      <Field>
        <FieldLabel>점검부서</FieldLabel>
        <Input defaultValue={equipment.department ?? ''} onBlur={(e) => handleBlur('department', e.target.value)} />
      </Field>
      <Field>
        <FieldLabel>담당자</FieldLabel>
        <Input defaultValue={equipment.manager ?? ''} onBlur={(e) => handleBlur('manager', e.target.value)} />
      </Field>
    </FieldGroup>
  )
}
