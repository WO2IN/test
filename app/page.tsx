import Link from 'next/link'
import { ClipboardListIcon, ThermometerIcon, WrenchIcon, ArrowRightIcon, AlertTriangleIcon } from 'lucide-react'
import { getDashboardSummary } from '@/app/actions/dashboard'
import { SiteHeader } from '@/components/site-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { currentYearMonth } from '@/lib/date-utils'

export default async function DashboardPage() {
  const { year, month } = currentYearMonth()
  const { equipmentCount, recentIssues } = await getDashboardSummary()

  const sheetCards = [
    {
      href: '/checksheets/5s',
      icon: ClipboardListIcon,
      title: '3정 5S Check Sheet',
      description: '정리 · 정돈 · 청소청결 · 표준화 월간 점검표',
    },
    {
      href: '/checksheets/daily',
      icon: WrenchIcon,
      title: '설비 일상점검 체크시트',
      description: '설비별 일상점검 항목과 이상발생 조치 이력',
    },
    {
      href: '/checksheets/temp-humidity',
      icon: ThermometerIcon,
      title: '온/습도 체크시트',
      description: '일별 온도·습도 기록과 관리기준 추이 차트',
    },
  ]

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader active="/" />
      <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">설비/품질 점검 관리시스템</h1>
          <p className="text-sm text-muted-foreground">
            {year}년 {month}월 · 등록된 설비 {equipmentCount}대
          </p>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sheetCards.map((card) => (
            <Link key={card.href} href={card.href} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/40">
                <CardHeader>
                  <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <card.icon className="size-4.5" />
                  </div>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {month}월 시트 열기
                    <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">최근 이상발생 이력</h2>
          {recentIssues.length === 0 ? (
            <Empty className="border border-dashed border-border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <AlertTriangleIcon />
                </EmptyMedia>
                <EmptyTitle>등록된 이상발생 이력이 없습니다</EmptyTitle>
                <EmptyDescription>각 체크시트에서 이상발생 조치사항을 기록하면 여기에 표시됩니다.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="flex flex-col divide-y divide-border border border-border bg-card">
              {recentIssues.map((issue) => (
                <div key={`${issue.source}-${issue.id}`} className="flex flex-wrap items-start justify-between gap-3 p-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                        {issue.source}
                      </span>
                      <span className="text-sm font-medium">{issue.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{issue.detail || '내용 없음'}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{issue.date || '-'}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
