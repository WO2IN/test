'use server'

import { db } from '@/lib/db'
import { fiveSSheets, fiveSEntries } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getOrCreateFiveSSheet(year: number, month: number) {
  const [existing] = await db
    .select()
    .from(fiveSSheets)
    .where(and(eq(fiveSSheets.year, year), eq(fiveSSheets.month, month)))
  if (existing) return existing

  const [created] = await db.insert(fiveSSheets).values({ year, month }).returning()
  return created
}

export async function getFiveSEntries(sheetId: number) {
  return db.select().from(fiveSEntries).where(eq(fiveSEntries.sheetId, sheetId))
}

export async function upsertFiveSEntry(sheetId: number, itemCode: string, day: number, value: string) {
  const [existing] = await db
    .select()
    .from(fiveSEntries)
    .where(and(eq(fiveSEntries.sheetId, sheetId), eq(fiveSEntries.itemCode, itemCode), eq(fiveSEntries.day, day)))

  if (existing) {
    await db.update(fiveSEntries).set({ value }).where(eq(fiveSEntries.id, existing.id))
  } else {
    await db.insert(fiveSEntries).values({ sheetId, itemCode, day, value })
  }
  revalidatePath('/checksheets/5s')
}

export async function updateFiveSSheetFields(
  sheetId: number,
  fields: { remarks?: string; writer?: string; reviewer?: string; approver?: string },
) {
  await db.update(fiveSSheets).set(fields).where(eq(fiveSSheets.id, sheetId))
  revalidatePath('/checksheets/5s')
}
