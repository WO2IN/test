'use server'

import { db } from '@/lib/db'
import { tempHumiditySheets, tempHumidityEntries, tempHumidityIssues } from '@/lib/db/schema'
import { and, asc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getOrCreateTempHumiditySheet(year: number, month: number) {
  const [existing] = await db
    .select()
    .from(tempHumiditySheets)
    .where(and(eq(tempHumiditySheets.year, year), eq(tempHumiditySheets.month, month)))
  if (existing) return existing

  const [created] = await db.insert(tempHumiditySheets).values({ year, month }).returning()
  return created
}

export async function getTempHumidityEntries(sheetId: number) {
  return db
    .select()
    .from(tempHumidityEntries)
    .where(eq(tempHumidityEntries.sheetId, sheetId))
    .orderBy(asc(tempHumidityEntries.day))
}

export async function upsertTempHumidityEntry(
  sheetId: number,
  day: number,
  fields: { temperature?: string | null; humidity?: string | null; checker?: string | null },
) {
  const [existing] = await db
    .select()
    .from(tempHumidityEntries)
    .where(and(eq(tempHumidityEntries.sheetId, sheetId), eq(tempHumidityEntries.day, day)))

  if (existing) {
    await db.update(tempHumidityEntries).set(fields).where(eq(tempHumidityEntries.id, existing.id))
  } else {
    await db.insert(tempHumidityEntries).values({ sheetId, day, ...fields })
  }
  revalidatePath('/checksheets/temp-humidity')
}

export async function updateTempHumiditySheetFields(
  sheetId: number,
  fields: { writer?: string; reviewer?: string; approver?: string },
) {
  await db.update(tempHumiditySheets).set(fields).where(eq(tempHumiditySheets.id, sheetId))
  revalidatePath('/checksheets/temp-humidity')
}

export async function getTempHumidityIssues(sheetId: number) {
  return db
    .select()
    .from(tempHumidityIssues)
    .where(eq(tempHumidityIssues.sheetId, sheetId))
    .orderBy(asc(tempHumidityIssues.id))
}

export async function addTempHumidityIssue(sheetId: number) {
  await db.insert(tempHumidityIssues).values({ sheetId })
  revalidatePath('/checksheets/temp-humidity')
}

export async function updateTempHumidityIssue(
  id: number,
  fields: { occurredDate?: string; content?: string; action?: string; note?: string },
) {
  await db.update(tempHumidityIssues).set(fields).where(eq(tempHumidityIssues.id, id))
  revalidatePath('/checksheets/temp-humidity')
}

export async function deleteTempHumidityIssue(id: number) {
  await db.delete(tempHumidityIssues).where(eq(tempHumidityIssues.id, id))
  revalidatePath('/checksheets/temp-humidity')
}
