'use server'

import { db } from '@/lib/db'
import { dailyCheckSheets, dailyCheckEntries, dailyCheckIssues, equipment } from '@/lib/db/schema'
import { and, asc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getOrCreateDailyCheckSheet(equipmentId: number, year: number, month: number) {
  const [existing] = await db
    .select()
    .from(dailyCheckSheets)
    .where(
      and(
        eq(dailyCheckSheets.equipmentId, equipmentId),
        eq(dailyCheckSheets.year, year),
        eq(dailyCheckSheets.month, month),
      ),
    )
  if (existing) return existing

  const [equip] = await db.select().from(equipment).where(eq(equipment.id, equipmentId))
  const [created] = await db
    .insert(dailyCheckSheets)
    .values({
      equipmentId,
      year,
      month,
      department: equip?.department ?? null,
      manager: equip?.manager ?? null,
    })
    .returning()
  return created
}

export async function getDailyCheckEntries(sheetId: number) {
  return db.select().from(dailyCheckEntries).where(eq(dailyCheckEntries.sheetId, sheetId))
}

export async function upsertDailyCheckEntry(sheetId: number, itemId: number, day: number, value: string) {
  const [existing] = await db
    .select()
    .from(dailyCheckEntries)
    .where(
      and(eq(dailyCheckEntries.sheetId, sheetId), eq(dailyCheckEntries.itemId, itemId), eq(dailyCheckEntries.day, day)),
    )

  if (existing) {
    await db.update(dailyCheckEntries).set({ value }).where(eq(dailyCheckEntries.id, existing.id))
  } else {
    await db.insert(dailyCheckEntries).values({ sheetId, itemId, day, value })
  }
  revalidatePath('/checksheets/daily')
}

export async function updateDailyCheckSheetFields(
  sheetId: number,
  fields: { department?: string; manager?: string; writer?: string; reviewer?: string; approver?: string },
) {
  await db.update(dailyCheckSheets).set(fields).where(eq(dailyCheckSheets.id, sheetId))
  revalidatePath('/checksheets/daily')
}

export async function getDailyCheckIssues(sheetId: number) {
  return db
    .select()
    .from(dailyCheckIssues)
    .where(eq(dailyCheckIssues.sheetId, sheetId))
    .orderBy(asc(dailyCheckIssues.id))
}

export async function addDailyCheckIssue(sheetId: number) {
  await db.insert(dailyCheckIssues).values({ sheetId })
  revalidatePath('/checksheets/daily')
}

export async function updateDailyCheckIssue(
  id: number,
  fields: { occurredDate?: string; cause?: string; action?: string; processedDate?: string; note?: string },
) {
  await db.update(dailyCheckIssues).set(fields).where(eq(dailyCheckIssues.id, id))
  revalidatePath('/checksheets/daily')
}

export async function deleteDailyCheckIssue(id: number) {
  await db.delete(dailyCheckIssues).where(eq(dailyCheckIssues.id, id))
  revalidatePath('/checksheets/daily')
}
