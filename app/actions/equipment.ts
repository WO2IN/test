'use server'

import { db } from '@/lib/db'
import { equipment, equipmentPhotos, dailyCheckItems } from '@/lib/db/schema'
import { and, asc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { del } from '@vercel/blob'

export async function getEquipmentList() {
  return db.select().from(equipment).orderBy(asc(equipment.name))
}

export async function getEquipmentById(id: number) {
  const [item] = await db.select().from(equipment).where(eq(equipment.id, id))
  return item ?? null
}

export async function createEquipment(data: {
  name: string
  department?: string
  manager?: string
  location?: string
}) {
  const [created] = await db
    .insert(equipment)
    .values({
      name: data.name,
      department: data.department || null,
      manager: data.manager || null,
      location: data.location || null,
    })
    .returning()
  revalidatePath('/equipment')
  return created
}

export async function updateEquipment(
  id: number,
  data: { name?: string; department?: string; manager?: string; location?: string },
) {
  await db
    .update(equipment)
    .set({
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.department !== undefined ? { department: data.department || null } : {}),
      ...(data.manager !== undefined ? { manager: data.manager || null } : {}),
      ...(data.location !== undefined ? { location: data.location || null } : {}),
    })
    .where(eq(equipment.id, id))
  revalidatePath('/equipment')
  revalidatePath(`/equipment/${id}`)
}

export async function deleteEquipment(id: number) {
  const photos = await db.select().from(equipmentPhotos).where(eq(equipmentPhotos.equipmentId, id))
  await Promise.all(
    photos.map((photo) =>
      del(photo.url).catch((error) => console.error('[v0] Failed to delete blob:', error)),
    ),
  )
  await db.delete(equipmentPhotos).where(eq(equipmentPhotos.equipmentId, id))
  await db.delete(dailyCheckItems).where(eq(dailyCheckItems.equipmentId, id))
  await db.delete(equipment).where(eq(equipment.id, id))
  revalidatePath('/equipment')
}

export async function getEquipmentPhotos(equipmentId: number) {
  return db
    .select()
    .from(equipmentPhotos)
    .where(eq(equipmentPhotos.equipmentId, equipmentId))
    .orderBy(asc(equipmentPhotos.sortOrder), asc(equipmentPhotos.id))
}

export async function addEquipmentPhoto(equipmentId: number, url: string, label?: string) {
  const [created] = await db
    .insert(equipmentPhotos)
    .values({ equipmentId, url, label: label || null })
    .returning()
  revalidatePath(`/equipment/${equipmentId}`)
  return created
}

export async function deleteEquipmentPhoto(id: number, equipmentId: number, url: string) {
  await db.delete(equipmentPhotos).where(and(eq(equipmentPhotos.id, id), eq(equipmentPhotos.equipmentId, equipmentId)))
  try {
    await del(url)
  } catch (error) {
    console.error('[v0] Failed to delete blob:', error)
  }
  revalidatePath(`/equipment/${equipmentId}`)
}

export async function getDailyCheckItems(equipmentId: number) {
  return db
    .select()
    .from(dailyCheckItems)
    .where(eq(dailyCheckItems.equipmentId, equipmentId))
    .orderBy(asc(dailyCheckItems.sortOrder), asc(dailyCheckItems.itemNo))
}

export async function createDailyCheckItem(
  equipmentId: number,
  data: { itemNo: number; content: string; method?: string; cycle?: string; sortOrder?: number },
) {
  const [created] = await db
    .insert(dailyCheckItems)
    .values({
      equipmentId,
      itemNo: data.itemNo,
      content: data.content,
      method: data.method || null,
      cycle: data.cycle || null,
      sortOrder: data.sortOrder ?? data.itemNo,
    })
    .returning()
  revalidatePath(`/equipment/${equipmentId}`)
  revalidatePath(`/checksheets/daily/${equipmentId}`)
  return created
}

export async function updateDailyCheckItem(
  id: number,
  equipmentId: number,
  data: { itemNo?: number; content?: string; method?: string; cycle?: string },
) {
  await db
    .update(dailyCheckItems)
    .set({
      ...(data.itemNo !== undefined ? { itemNo: data.itemNo } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.method !== undefined ? { method: data.method || null } : {}),
      ...(data.cycle !== undefined ? { cycle: data.cycle || null } : {}),
    })
    .where(eq(dailyCheckItems.id, id))
  revalidatePath(`/equipment/${equipmentId}`)
  revalidatePath(`/checksheets/daily/${equipmentId}`)
}

export async function deleteDailyCheckItem(id: number, equipmentId: number) {
  await db.delete(dailyCheckItems).where(eq(dailyCheckItems.id, id))
  revalidatePath(`/equipment/${equipmentId}`)
  revalidatePath(`/checksheets/daily/${equipmentId}`)
}
