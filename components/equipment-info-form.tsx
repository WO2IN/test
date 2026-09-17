'use client'

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
        <Select defaultValue={equipment.floor ? String(equipment.floor).replace(/층$/, '') : undefined} onValueChange={(value) => handleBlur('floor', value ?? '')}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="층을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1층</SelectItem>
            <SelectItem value="2">2층</SelectItem>
            <SelectItem value="3">3층</SelectItem>
          </SelectContent>
        </Select>
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
