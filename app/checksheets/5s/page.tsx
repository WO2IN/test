import { getOrCreateFiveSSheet, getFiveSEntries, updateFiveSSheetFields } from '@/app/actions/five-s'
import { SiteHeader } from '@/components/site-header'
import { YearMonthPicker } from '@/components/year-month-picker'
import { ApprovalBox } from '@/components/approval-box'
import { RemarksField } from '@/components/remarks-field'
import { PrintButton } from '@/components/print-button'
import { FiveSGrid } from '@/components/five-s-grid'
import { currentYearMonth } from '@/lib/date-utils'

export default async function FiveSPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>
}) {
  const params = await searchParams
  const { year: curYear, month: curMonth } = currentYearMonth()
  const year = params.year ? Number(params.year) : curYear
  const month = params.month ? Number(params.month) : curMonth

  const sheet = await getOrCreateFiveSSheet(year, month)
  const entries = await getFiveSEntries(sheet.id)

  async function saveApproval(fields: { writer?: string; reviewer?: string; approver?: string }) {
    'use server'
    await updateFiveSSheetFields(sheet.id, fields)
  }

  async function saveRemarks(value: string) {
    'use server'
    await updateFiveSSheetFields(sheet.id, { remarks: value })
  }

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader active="/checksheets/5s" />
      <main className="print-page mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-6 sm:px-6">
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <YearMonthPicker year={year} month={month} />
          <PrintButton />
        </div>

        <div className="print-compact-box flex flex-wrap items-start justify-between gap-4 border border-border bg-card p-4">
          <div className="flex flex-1 flex-col gap-1">
            <h1 className="text-balance text-xl font-semibold">
              {year}년 {month}월 3정 5S Check Sheet
            </h1>
            <p className="text-sm text-muted-foreground">
              표시: ◎(매우잘함) / ○(잘함) / △(보통수준) / V(미흡함) / ×(대단히 미흡함) / N/A(해당사항 없음)
            </p>
          </div>
          <ApprovalBox
            writer={sheet.writer}
            reviewer={sheet.reviewer}
            approver={sheet.approver}
            onSave={saveApproval}
          />
        </div>

        <FiveSGrid sheetId={sheet.id} year={year} month={month} entries={entries} />

        <div className="print-compact-box border border-border bg-card p-4">
          <RemarksField defaultValue={sheet.remarks ?? ''} onSave={saveRemarks} />
        </div>
      </main>
    </div>
  )
}
