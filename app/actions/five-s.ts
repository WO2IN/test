"use server"

import { revalidatePath } from "next/cache"
import { findOne, insertRow, removeWhere, selectWhere, updateById } from "@/lib/local-store"
import { FIVE_S_CATALOG } from "@/lib/constants/five-s-catalog"
import { isWeekend } from "@/lib/date-utils"

export async function getOrCreateFiveSSheet(year: number, month: number) {
  const existing = findOne("fiveSSheets", (s: any) => s.year === year && s.month === month)
  if (existing) return existing

  return insertRow("fiveSSheets", {
    year,
    month,
    remarks: null,
    writer: null,
    reviewer: null,
    approver: null,
    createdAt: new Date().toISOString(),
  })
}

export async function getFiveSEntries(sheetId: number) {
  return selectWhere("fiveSEntries", (e: any) => e.sheetId === sheetId)
}

export async function upsertFiveSEntry(sheetId: number, itemCode: string, day: number, value: string) {
  const existing = findOne(
    "fiveSEntries",
    (e: any) => e.sheetId === sheetId && e.itemCode === itemCode && e.day === day,
  )

  if (existing) {
    updateById("fiveSEntries", (existing as any).id, { value })
  } else {
    insertRow("fiveSEntries", { sheetId, itemCode, day, value })
  }
  revalidatePath("/checksheets/5s")
}

export async function bulkFillFiveSEntries(
  sheetId: number,
  year: number,
  month: number,
  uptoDay: number,
  symbol: string,
) {
  for (const item of FIVE_S_CATALOG) {
    for (let day = 1; day <= uptoDay; day++) {
      if (isWeekend(year, month, day)) continue
      const scheduled = item.cycle === '일'
        || (item.cycle === '주' && new Date(year, month - 1, day).getDay() === 1)
        || (item.cycle === '월' && day === Array.from({ length: day }, (_, index) => index + 1).find((candidate) => !isWeekend(year, month, candidate)))
      if (!scheduled) continue
      const existing = findOne(
        "fiveSEntries",
        (e: any) => e.sheetId === sheetId && e.itemCode === item.code && e.day === day,
      )
      if (!existing || !(existing as any).value) {
        if (existing) {
          updateById("fiveSEntries", (existing as any).id, { value: symbol })
        } else {
          insertRow("fiveSEntries", { sheetId, itemCode: item.code, day, value: symbol })
        }
      }
    }
  }
  revalidatePath("/checksheets/5s")
}

export async function clearFiveSSheetEntries(sheetId: number) {
  removeWhere("fiveSEntries", (e: any) => e.sheetId === sheetId)
  revalidatePath("/checksheets/5s")
}

export async function updateFiveSSheetFields(
  sheetId: number,
  fields: { remarks?: string; writer?: string; reviewer?: string; approver?: string },
) {
  updateById("fiveSSheets", sheetId, fields)
  revalidatePath("/checksheets/5s")
}
