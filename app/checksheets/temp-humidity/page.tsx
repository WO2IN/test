import {
  getOrCreateTempHumiditySheet,
  getTempHumidityEntries,
  updateTempHumiditySheetFields,
} from '@/app/actions/temp-humidity'
import { SiteHeader } from '@/components/site-header'
import { YearMonthPicker } from '@/components/year-month-picker'
import { ApprovalBox } from '@/components/approval-box'
import { RemarksField } from '@/components/remarks-field'
import { PrintButton } from '@/components/print-button'
import { TempHumidityTable } from '@/components/temp-humidity-table'
import { TempHumidityChart } from '@/components/temp-humidity-chart'
import { currentYearMonth } from '@/lib/date-utils'

export default async function TempHumidityPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>
}) {
  const params = await searchParams
  const { year: curYear, month: curMonth } = currentYearMonth()
  const year = params.year ? Number(params.year) : curYear
  const month = params.month ? Number(params.month) : curMonth

  const sheet = await getOrCreateTempHumiditySheet(year, month)
  const entries = await getTempHumidityEntries(sheet.id)

  async function saveApproval(fields: { writer?: string; reviewer?: string; approver?: string }) {
    'use server'
    await updateTempHumiditySheetFields(sheet.id, fields)
  }

  async function saveRemarks(value: string) {
    'use server'
    await updateTempHumiditySheetFields(sheet.id, { remarks: value })
  }

  return (
    <div className="temp-humidity-page min-h-dvh bg-background">
      <SiteHeader active="/checksheets/temp-humidity" />
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
              <h1 className="text-balance text-xl font-semibold">
                {year}년 {month}월 온/습도 체크시트
              </h1>
              <p className="text-sm text-muted-foreground">관리기준: 온도 20±10℃ · 습도 60% 이하</p>
            </div>
          </div>
          <ApprovalBox
            writer={sheet.writer}
            reviewer={sheet.reviewer}
            approver={sheet.approver}
            onSave={saveApproval}
          />
        </div>

        <div className="temp-humidity-body flex min-h-0 flex-1 flex-col gap-4">
          <TempHumidityChart year={year} month={month} entries={entries} />
          <TempHumidityTable sheetId={sheet.id} year={year} month={month} entries={entries} />
        </div>

        <div className="print-compact-box border border-border bg-card p-4">
          <RemarksField defaultValue={sheet.remarks ?? ''} onSave={saveRemarks} />
        </div>
      </main>
    </div>
  )
}
