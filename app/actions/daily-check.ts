"use server"

import { revalidatePath } from "next/cache"
import { findOne, insertRow, removeWhere, selectWhere, updateById, updateWhere } from "@/lib/local-store"
import { isWeekend } from "@/lib/date-utils"

export async function getOrCreateDailyCheckSheet(equipmentId: number, year: number, month: number) {
  const existing = findOne(
    "dailyCheckSheets",
    (s: any) => s.equipmentId === equipmentId && s.year === year && s.month === month,
  )
  if (existing) return existing

  const equip = findOne("equipment", (e: any) => e.id === equipmentId)
  return insertRow("dailyCheckSheets", {
    equipmentId,
    year,
    month,
    department: (equip as any)?.department ?? null,
    manager: (equip as any)?.manager ?? null,
    writer: null,
    reviewer: null,
    approver: null,
    createdAt: new Date().toISOString(),
  })
}

export async function getDailyCheckEntries(sheetId: number) {
  return selectWhere("dailyCheckEntries", (e: any) => e.sheetId === sheetId)
}

export async function upsertDailyCheckEntry(sheetId: number, itemId: number, day: number, value: string) {
  const existing = findOne(
    "dailyCheckEntries",
    (e: any) => e.sheetId === sheetId && e.itemId === itemId && e.day === day,
  )

  if (existing) {
    updateById("dailyCheckEntries", (existing as any).id, { value })
  } else {
    insertRow("dailyCheckEntries", { sheetId, itemId, day, value })
  }
  revalidatePath("/checksheets/daily")
}

export async function bulkFillDailyCheckEntries(
  sheetId: number,
  year: number,
  month: number,
  uptoDay: number,
  symbol: string,
  itemIds: number[],
) {
  for (const itemId of itemIds) {
    for (let day = 1; day <= uptoDay; day++) {
      if (isWeekend(year, month, day)) continue
      const existing = findOne(
        "dailyCheckEntries",
        (e: any) => e.sheetId === sheetId && e.itemId === itemId && e.day === day,
      )
      if (!existing || !(existing as any).value) {
        if (existing) {
          updateById("dailyCheckEntries", (existing as any).id, { value: symbol })
        } else {
          insertRow("dailyCheckEntries", { sheetId, itemId, day, value: symbol })
        }
      }
    }
  }
  revalidatePath("/checksheets/daily")
}

export async function clearDailyCheckSheetEntries(sheetId: number) {
  removeWhere("dailyCheckEntries", (e: any) => e.sheetId === sheetId)
  revalidatePath("/checksheets/daily")
}

export async function updateDailyCheckSheetFields(
  sheetId: number,
  fields: { department?: string; manager?: string; writer?: string; reviewer?: string; approver?: string },
) {
  updateById("dailyCheckSheets", sheetId, fields)
  revalidatePath("/checksheets/daily")
}

export async function getDailyCheckIssues(sheetId: number) {
  return selectWhere("dailyCheckIssues", (i: any) => i.sheetId === sheetId).sort((a: any, b: any) => a.id - b.id)
}

export async function addDailyCheckIssue(sheetId: number) {
  insertRow("dailyCheckIssues", {
    sheetId,
    occurredDate: null,
    cause: null,
    action: null,
    processedDate: null,
    note: null,
    createdAt: new Date().toISOString(),
  })
  revalidatePath("/checksheets/daily")
}

export async function updateDailyCheckIssue(
  id: number,
  fields: { occurredDate?: string; cause?: string; action?: string; processedDate?: string; note?: string },
) {
  updateWhere("dailyCheckIssues", (i: any) => i.id === id, fields)
  revalidatePath("/checksheets/daily")
}

export async function deleteDailyCheckIssue(id: number) {
  removeWhere("dailyCheckIssues", (i: any) => i.id === id)
  revalidatePath("/checksheets/daily")
}
