import type { ReactNode } from 'react'

export type FloorKey = '1층' | '2층' | '3층' | '층 미지정'

export function getFloor(name: string): FloorKey {
  const match = name.match(/([123])층/)
  return match ? (`${match[1]}층` as FloorKey) : '층 미지정'
}

export function groupByFloor<T extends { name: string }>(items: T[]) {
  const groups = new Map<FloorKey, T[]>()
  for (const floor of ['1층', '2층', '3층', '층 미지정'] as FloorKey[]) groups.set(floor, [])
  for (const item of items) groups.get(getFloor(item.name))!.push(item)
  return groups
}

export function FloorGroup({ floor, children }: { floor: FloorKey; children: ReactNode }) {
  return (
    <section aria-labelledby={`floor-${floor}`} className="flex flex-col gap-2">
      <h2 id={`floor-${floor}`} className="flex items-center gap-2 text-base font-semibold">
        <span className="h-5 w-1 rounded-full bg-primary" aria-hidden="true" />
        {floor}
      </h2>
      {children}
    </section>
  )
}
