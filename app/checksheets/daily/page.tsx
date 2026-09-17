import Link from 'next/link'
import { WrenchIcon, PlusIcon } from 'lucide-react'
import { getEquipmentList, deleteEquipment } from '@/app/actions/equipment'
import { SiteHeader } from '@/components/site-header'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { buttonVariants } from '@/components/ui/button'
import { TargetListRow } from '@/components/target-list-row'
import { Layers3Icon } from 'lucide-react'

export default async function DailyCheckIndexPage() {
  const equipmentList = await getEquipmentList()

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader active="/checksheets/daily" />
      <main className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">설비 일상점검 체크시트</h1>
            <p className="text-sm text-muted-foreground">점검할 설비를 선택하세요.</p>
          </div>
          <Link href="/equipment/new" className={buttonVariants({ variant: 'default' })}>
            <PlusIcon data-icon="inline-start" />
            설비 추가
          </Link>
        </div>

        {equipmentList.length === 0 ? (
          <Empty className="border border-dashed border-border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WrenchIcon />
              </EmptyMedia>
              <EmptyTitle>등록된 설비가 없습니다</EmptyTitle>
              <EmptyDescription>먼저 새로운 설비를 등록하세요.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link href="/equipment/new" className={buttonVariants()}>
                설비 추가하기
              </Link>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="space-y-6">
            {(() => {
              const floors = new Map<string, typeof equipmentList>()
              for (const item of equipmentList) {
                const floor = item.floor
      ? String(item.floor).replace(/층$/, '')
      : item.name.match(/(\d+)층/)?.[1] || '미지정'
                floors.set(floor, [...(floors.get(floor) ?? []), item])
              }
              const entries = ['1', '2', '3', ...floors.keys()].filter((floor, index, all) => all.indexOf(floor) === index)
              return entries.map((floor) => (
                <section key={floor} aria-labelledby={`daily-floor-${floor}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <Layers3Icon className="size-5 text-primary" aria-hidden="true" />
                    <h2 id={`daily-floor-${floor}`} className="font-semibold">{floor === '미지정' ? '층 미지정' : `${floor.replace('층', '')}층`}</h2>
                    <span className="text-sm text-muted-foreground">{floors.get(floor)?.length ?? 0}개</span>
                  </div>
                  <div className="flex flex-col divide-y divide-border border border-border">
                    {floors.get(floor)?.map((item) => <TargetListRow key={item.id} href={`/checksheets/daily/${item.id}`} name={item.name} floor={item.floor || item.name.match(/(\d+)층/)?.[0]} department={item.department} manager={item.manager} deleteTitle="이 설비를 삭제할까요?" deleteDescription={`${item.name} 설비와 연관된 사진, 점검항목, 일상점검 내용이 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`} deleteAction={deleteEquipment} id={item.id} />)}
                  </div>
                </section>
              ))
            })()}
          </div>
        )}
      </main>
    </div>
  )
}
