import { notFound } from 'next/navigation'
import {
  getEquipmentById,
  getEquipmentPhotos,
  getDailyCheckItems,
  getEquipmentEmergencyGuides,
  getEquipmentEmergencyHistories,
  updateEquipment,
} from '@/app/actions/equipment'
import {
  getOrCreateDailyCheckSheet,
  getDailyCheckEntries,
  updateDailyCheckSheetFields,
  toggleDailyCheckHoliday,
} from '@/app/actions/daily-check'
import { SiteHeader } from '@/components/site-header'
import { YearMonthPicker } from '@/components/year-month-picker'
import { ApprovalBox } from '@/components/approval-box'
import { PrintButton } from '@/components/print-button'
import { DailyCheckGrid } from '@/components/daily-check-grid'
import { EmergencyActionCard } from '@/components/emergency-action-card'
import { currentYearMonth } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import { SheetHeaderEditor } from '@/components/sheet-header-editor'

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

  const [photos, items, sheet, guides, histories] = await Promise.all([
    getEquipmentPhotos(equipId),
    getDailyCheckItems(equipId),
    getOrCreateDailyCheckSheet(equipId, year, month),
    getEquipmentEmergencyGuides(equipId),
    getEquipmentEmergencyHistories(equipId),
  ])
  const entries = await getDailyCheckEntries(sheet.id)
  const holidays: number[] = (sheet as any).holidays ?? []

  async function saveApproval(fields: { writer?: string; reviewer?: string; approver?: string }) {
    'use server'
    await updateDailyCheckSheetFields(sheet.id, fields)
  }

  async function toggleHoliday(day: number) {
    'use server'
    await toggleDailyCheckHoliday(sheet.id, day)
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
          <div className="flex flex-1 items-start gap-3">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%ED%9A%8C%EC%82%AC%EB%A1%9C%EA%B3%A0_%ED%88%AC%EB%AA%85-kdSjzuFUF1A1rzO914B2j1jjYSWH4Z.png"
              alt="WOORI 로고"
              className="print-logo h-12 w-auto object-contain"
            />
            <div className="flex flex-col gap-1">
              <h1 className="text-balance text-xl font-semibold flex items-center">
                {year}년 {month}월 설비 일상점검 체크시트
                <SheetHeaderEditor
                  id={equipId}
                  name={equip.name}
                  department={equip.department || ''}
                  manager={equip.manager || ''}
                  updateAction={updateEquipment}
                />
              </h1>
              <p className="text-sm text-muted-foreground">
                점검부서: {equip.department || '-'} · 담당자: {equip.manager || '-'} · 설비명:{' '}
                {equip.name}
              </p>
            </div>
          </div>
          <ApprovalBox
            writer={sheet.writer}
            reviewer={sheet.reviewer}
            approver={sheet.approver}
            onSave={saveApproval}
          />
        </div>

        {photos.length > 0 && (
          <div className="print-photo-box flex flex-wrap items-start gap-3 border border-border bg-card p-4">
            {photos.map((photo) => {
              const isOverview = photo.label === '전체 전경'
              return (
                <figure key={photo.id} className={cn('flex flex-col gap-1', isOverview ? 'w-72' : 'w-32')}>
                  <img
                    src={photo.url || '/placeholder.svg'}
                    alt={photo.label || equip.name}
                    className={cn(
                      'w-full rounded-md border border-border object-cover',
                      isOverview ? 'aspect-[16/10]' : 'aspect-square',
                    )}
                  />
                  <figcaption className="text-center text-xs text-muted-foreground">{photo.label}</figcaption>
                </figure>
              )
            })}
          </div>
        )}

        <DailyCheckGrid
          sheetId={sheet.id}
          equipmentId={equipId}
          year={year}
          month={month}
          items={items}
          entries={entries}
          holidays={holidays}
          onToggleHoliday={toggleHoliday}
          inspector={{
            name: equip.inspectorName ?? '',
            desc: equip.inspectorDesc ?? '',
            cycle: equip.inspectorCycle ?? '',
          }}
          manager={{
            name: equip.managerName ?? '',
            desc: equip.managerDesc ?? '',
            cycle: equip.managerCycle ?? '',
          }}
          inspectorMarks={(sheet as any).inspectorMarks ?? []}
          managerMarks={(sheet as any).managerMarks ?? []}
        />

        <EmergencyActionCard equipmentId={equipId} equipment={equip} guides={guides} histories={histories} />
      </main>
    </div>
  )
}
