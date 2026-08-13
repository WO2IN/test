import { notFound } from 'next/navigation'
import { getEquipmentById, getEquipmentPhotos, getDailyCheckItems } from '@/app/actions/equipment'
import {
  getOrCreateDailyCheckSheet,
  getDailyCheckEntries,
  updateDailyCheckSheetFields,
  getDailyCheckIssues,
  addDailyCheckIssue,
  updateDailyCheckIssue,
  deleteDailyCheckIssue,
} from '@/app/actions/daily-check'
import { SiteHeader } from '@/components/site-header'
import { YearMonthPicker } from '@/components/year-month-picker'
import { ApprovalBox } from '@/components/approval-box'
import { PrintButton } from '@/components/print-button'
import { DailyCheckGrid } from '@/components/daily-check-grid'
import { IssueLogTable } from '@/components/issue-log-table'
import { currentYearMonth } from '@/lib/date-utils'

export default async function DailyCheckDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ equipmentId: string }>
  searchParams: Promise<{ year?: string; month?: string }>
}) {
  const { equipmentId } = await params
  const sp = await searchParams
  const equipId = Number(equipmentId)
  const equip = await getEquipmentById(equipId)
  if (!equip) notFound()

  const { year: curYear, month: curMonth } = currentYearMonth()
  const year = sp.year ? Number(sp.year) : curYear
  const month = sp.month ? Number(sp.month) : curMonth

  const [photos, items, sheet] = await Promise.all([
    getEquipmentPhotos(equipId),
    getDailyCheckItems(equipId),
    getOrCreateDailyCheckSheet(equipId, year, month),
  ])
  const [entries, issues] = await Promise.all([getDailyCheckEntries(sheet.id), getDailyCheckIssues(sheet.id)])

  async function saveApproval(fields: { writer?: string; reviewer?: string; approver?: string }) {
    'use server'
    await updateDailyCheckSheetFields(sheet.id, fields)
  }

  async function handleAddIssue() {
    'use server'
    await addDailyCheckIssue(sheet.id)
  }

  async function handleUpdateIssue(id: number, fields: Record<string, string>) {
    'use server'
    await updateDailyCheckIssue(id, fields)
  }

  async function handleDeleteIssue(id: number) {
    'use server'
    await deleteDailyCheckIssue(id)
  }

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader active="/checksheets/daily" />
      <main className="print-page mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-6 sm:px-6">
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <YearMonthPicker year={year} month={month} />
          <PrintButton />
        </div>

        <div className="print-compact-box flex flex-wrap items-start justify-between gap-4 border border-border bg-card p-4">
          <div className="flex flex-1 flex-col gap-1">
            <h1 className="text-balance text-xl font-semibold">
              {year}년 {month}월 설비 일상점검 체크시트
            </h1>
            <p className="text-sm text-muted-foreground">
              점검부서: {sheet.department || equip.department || '-'} · 담당자: {sheet.manager || equip.manager || '-'} · 설비명:{' '}
              {equip.name}
            </p>
          </div>
          <ApprovalBox
            writer={sheet.writer}
            reviewer={sheet.reviewer}
            approver={sheet.approver}
            onSave={saveApproval}
          />
        </div>

        {photos.length > 0 && (
          <div className="no-print print-sheet flex flex-wrap gap-3 border border-border bg-card p-4">
            {photos.map((photo) => (
              <figure key={photo.id} className="flex w-32 flex-col gap-1">
                <img
                  src={photo.url || '/placeholder.svg'}
                  alt={photo.label || equip.name}
                  className="aspect-square w-full rounded-md border border-border object-cover"
                />
                <figcaption className="text-center text-xs text-muted-foreground">{photo.label}</figcaption>
              </figure>
            ))}
          </div>
        )}

        <DailyCheckGrid sheetId={sheet.id} year={year} month={month} items={items} entries={entries} />

        <IssueLogTable
          columns={[
            { key: 'occurredDate', label: '발생 일자', width: '12%' },
            { key: 'cause', label: '고장 원인', width: '30%' },
            { key: 'action', label: '조치 내용', width: '38%' },
            { key: 'processedDate', label: '처리 일자', width: '12%' },
            { key: 'note', label: '비고', width: '8%' },
          ]}
          rows={issues}
          onAdd={handleAddIssue}
          onUpdate={handleUpdateIssue}
          onDelete={handleDeleteIssue}
        />
      </main>
    </div>
  )
}
