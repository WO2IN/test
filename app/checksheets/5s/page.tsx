import Link from 'next/link'
import { ChevronRightIcon, WrenchIcon } from 'lucide-react'
import { getFiveSTargets, createFiveSTarget } from '@/app/actions/five-s'
import { SiteHeader } from '@/components/site-header'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { TargetCreateDialog } from '@/components/target-create-dialog'

export default async function FiveSIndexPage() {
  const targetList = await getFiveSTargets()

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader active="/checksheets/5s" />
      <main className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">3정 5S Check Sheet</h1>
            <p className="text-sm text-muted-foreground">점검할 항목을 선택하세요.</p>
          </div>
          <TargetCreateDialog 
            title="3정 5S 대상 추가"
            triggerText="3정 5S 추가"
            createAction={createFiveSTarget}
            redirectPathPrefix="/checksheets/5s"
          />
        </div>

        {targetList.length === 0 ? (
          <Empty className="border border-dashed border-border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WrenchIcon />
              </EmptyMedia>
              <EmptyTitle>등록된 항목이 없습니다</EmptyTitle>
              <EmptyDescription>먼저 새로운 항목을 등록하세요.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <TargetCreateDialog 
                title="3정 5S 대상 추가"
                triggerText="3정 5S 추가"
                createAction={createFiveSTarget}
                redirectPathPrefix="/checksheets/5s"
              />
            </EmptyContent>
          </Empty>
        ) : (
          <div className="flex flex-col divide-y divide-border border border-border">
            {targetList.map((item) => (
              <Link
                key={item.id}
                href={`/checksheets/5s/${item.id}`}
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
