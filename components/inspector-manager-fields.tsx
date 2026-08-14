'use client'

import { Input } from '@/components/ui/input'

export interface InspectorManagerValue {
  inspectorName: string
  inspectorDesc: string
  inspectorCycle: string
  managerName: string
  managerDesc: string
  managerCycle: string
}

export const EMPTY_INSPECTOR_MANAGER_VALUE: InspectorManagerValue = {
  inspectorName: '',
  inspectorDesc: '',
  inspectorCycle: '',
  managerName: '',
  managerDesc: '',
  managerCycle: '',
}

interface InspectorManagerFieldsProps {
  value: InspectorManagerValue
  onChange: (value: InspectorManagerValue) => void
  onCommit?: (field: keyof InspectorManagerValue, value: string) => void
}

const ROWS = [
  { prefix: 'inspector' as const, label: '점검자', namePlaceholder: '예: 우데스 과장', descPlaceholder: '예: 1일 점검', cyclePlaceholder: '1회/일' },
  { prefix: 'manager' as const, label: '관리자', namePlaceholder: '예: 문명선 차장', descPlaceholder: '예: 주간 점검 확인', cyclePlaceholder: '1회/주' },
]

export function InspectorManagerFields({ value, onChange, onCommit }: InspectorManagerFieldsProps) {
  function handleChange(field: keyof InspectorManagerValue, next: string) {
    onChange({ ...value, [field]: next })
  }

  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-20 border-r border-b border-border bg-muted p-2 text-center font-medium">구분</th>
            <th className="border-r border-b border-border bg-muted p-2 text-center font-medium">담당자</th>
            <th className="border-r border-b border-border bg-muted p-2 text-center font-medium">점검 내용</th>
            <th className="w-28 border-b border-border bg-muted p-2 text-center font-medium">주기</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const nameKey = `${row.prefix}Name` as const
            const descKey = `${row.prefix}Desc` as const
            const cycleKey = `${row.prefix}Cycle` as const
            return (
              <tr key={row.prefix}>
                <td className="border-r border-b border-border bg-muted/40 p-2 text-center font-medium">{row.label}</td>
                <td className="border-r border-b border-border p-0">
                  <Input
                    value={value[nameKey]}
                    onChange={(e) => handleChange(nameKey, e.target.value)}
                    onBlur={(e) => onCommit?.(nameKey, e.target.value)}
                    placeholder={row.namePlaceholder}
                    className="h-9 rounded-none border-0 text-center shadow-none focus-visible:ring-0"
                  />
                </td>
                <td className="border-r border-b border-border p-0">
                  <Input
                    value={value[descKey]}
                    onChange={(e) => handleChange(descKey, e.target.value)}
                    onBlur={(e) => onCommit?.(descKey, e.target.value)}
                    placeholder={row.descPlaceholder}
                    className="h-9 rounded-none border-0 text-center shadow-none focus-visible:ring-0"
                  />
                </td>
                <td className="border-b border-border p-0">
                  <Input
                    value={value[cycleKey]}
                    onChange={(e) => handleChange(cycleKey, e.target.value)}
                    onBlur={(e) => onCommit?.(cycleKey, e.target.value)}
                    placeholder={row.cyclePlaceholder}
                    className="h-9 rounded-none border-0 text-center shadow-none focus-visible:ring-0"
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
