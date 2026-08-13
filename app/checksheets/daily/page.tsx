import Link from 'next/link'
import { ChevronRightIcon, WrenchIcon } from 'lucide-react'
import { getEquipmentList } from '@/app/actions/equipment'
import { SiteHeader } from '@/components/site-header'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { buttonVariants } from '@/components/ui/button'

export default async function DailyCheckIndexPage() {
  const equipmentList = await getEquipmentList()

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader active="/checksheets/daily" />
      <main className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-6 sm:px-6">
        <h1 className="text-xl font-semibold">설비 일상점검 체크시트</h1>
        <p className="text-sm text-muted-foreground">점검할 설비를 선택하세요.</p>

        {equipmentList.length === 0 ? (
          <Empty className="border border-dashed border-border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WrenchIcon />
              </EmptyMedia>
              <EmptyTitle>등록된 설비가 없습니다</EmptyTitle>
              <EmptyDescription>먼저 설비 관리 페이지에서 설비를 등록하세요.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link href="/equipment" className={buttonVariants()}>
                설비 관리로 이동
              </Link>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="flex flex-col divide-y divide-border border border-border">
            {equipmentList.map((item) => (
              <Link
                key={item.id}
                href={`/checksheets/daily/${item.id}`}
                className="flex items-center justify-between gap-3 bg-card p-4 transition-colors hover:bg-accent/20"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.department || '부서 미지정'} · {item.manager || '담당자 미지정'}
                  </span>
                </div>
                <ChevronRightIcon className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
