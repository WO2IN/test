"use server"

import { revalidatePath } from "next/cache"
import { findOne, insertRow, removeWhere, selectWhere, updateById } from "@/lib/local-store"

export async function getOrCreateTempHumiditySheet(year: number, month: number) {
  const existing = findOne("tempHumiditySheets", (s: any) => s.year === year && s.month === month)
  if (existing) return existing

  return insertRow("tempHumiditySheets", {
    year,
    month,
    remarks: null,
    writer: null,
    reviewer: null,
    approver: null,
    createdAt: new Date().toISOString(),
  })
}

export async function getTempHumidityEntries(sheetId: number) {
  return selectWhere("tempHumidityEntries", (e: any) => e.sheetId === sheetId).sort(
    (a: any, b: any) => a.day - b.day,
  )
}

export async function upsertTempHumidityEntry(
  sheetId: number,
  day: number,
  fields: { temperature?: string | null; humidity?: string | null; checker?: string | null },
) {
  const existing = findOne("tempHumidityEntries", (e: any) => e.sheetId === sheetId && e.day === day)

  if (existing) {
    updateById("tempHumidityEntries", (existing as any).id, fields)
  } else {
    insertRow("tempHumidityEntries", { sheetId, day, ...fields })
  }
  revalidatePath("/checksheets/temp-humidity")
}

export async function bulkUpsertTempHumidityEntries(
  sheetId: number,
  entries: { day: number; temperature: string; humidity: string }[],
) {
  for (const { day, temperature, humidity } of entries) {
    const existing = findOne("tempHumidityEntries", (e: any) => e.sheetId === sheetId && e.day === day)
    if (existing) {
      const patch: Record<string, string> = {}
      if (!(existing as any).temperature) patch.temperature = temperature
      if (!(existing as any).humidity) patch.humidity = humidity
      if (Object.keys(patch).length > 0) {
        updateById("tempHumidityEntries", (existing as any).id, patch)
      }
    } else {
      insertRow("tempHumidityEntries", { sheetId, day, temperature, humidity, checker: null })
    }
  }
  revalidatePath("/checksheets/temp-humidity")
}

export async function clearTempHumidityEntries(sheetId: number) {
  removeWhere("tempHumidityEntries", (e: any) => e.sheetId === sheetId)
  revalidatePath("/checksheets/temp-humidity")
}

export async function updateTempHumiditySheetFields(
  sheetId: number,
  fields: { remarks?: string; writer?: string; reviewer?: string; approver?: string },
) {
  updateById("tempHumiditySheets", sheetId, fields)
  revalidatePath("/checksheets/temp-humidity")
}
