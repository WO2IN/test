import Link from 'next/link'
import { WrenchIcon, PlusIcon } from 'lucide-react'
import { getEquipmentList, deleteEquipment } from '@/app/actions/equipment'
import { SiteHeader } from '@/components/site-header'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { buttonVariants } from '@/components/ui/button'
import { TargetListRow } from '@/components/target-list-row'

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
          <div className="flex flex-col divide-y divide-border border border-border">
            {equipmentList.map((item) => (
              <TargetListRow
                key={item.id}
                href={`/checksheets/daily/${item.id}`}
                name={item.name}
                department={item.department}
                manager={item.manager}
                deleteTitle="이 설비를 삭제할까요?"
                deleteDescription={`${item.name} 설비와 연관된 사진, 점검항목, 일상점검 내용이 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`}
                deleteAction={deleteEquipment}
                id={item.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
