"use server"

import fs from "node:fs"
import path from "node:path"
import { revalidatePath } from "next/cache"
import { findOne, insertRow, removeWhere, selectAll, selectWhere, updateById } from "@/lib/local-store"

function deleteLocalUpload(url: string) {
  if (!url || !url.startsWith("/uploads/")) return
  try {
    const filePath = path.join(process.cwd(), "public", url)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  } catch (error) {
    console.error("[v0] Failed to delete local upload file:", error)
  }
}

export async function getEquipmentList() {
  return selectAll("equipment").sort((a, b) => a.name.localeCompare(b.name))
}

export async function getEquipmentById(id: number) {
  return findOne("equipment", (e) => e.id === id)
}

export interface EquipmentInput {
  name: string
  department?: string
  manager?: string
  inspectorName?: string
  inspectorDesc?: string
  inspectorCycle?: string
  managerName?: string
  managerDesc?: string
  managerCycle?: string
  escalationNote?: string
}

export async function createEquipment(data: EquipmentInput) {
  const created = insertRow("equipment", {
    name: data.name,
    department: data.department || null,
    manager: data.manager || null,
    inspectorName: data.inspectorName || null,
    inspectorDesc: data.inspectorDesc || null,
    inspectorCycle: data.inspectorCycle || null,
    managerName: data.managerName || null,
    managerDesc: data.managerDesc || null,
    managerCycle: data.managerCycle || null,
    escalationNote: data.escalationNote || null,
    createdAt: new Date().toISOString(),
  })
  revalidatePath("/equipment")
  return created
}

export async function updateEquipment(id: number, data: Partial<EquipmentInput>) {
  updateById("equipment", id, {
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.department !== undefined ? { department: data.department || null } : {}),
    ...(data.manager !== undefined ? { manager: data.manager || null } : {}),
    ...(data.inspectorName !== undefined ? { inspectorName: data.inspectorName || null } : {}),
    ...(data.inspectorDesc !== undefined ? { inspectorDesc: data.inspectorDesc || null } : {}),
    ...(data.inspectorCycle !== undefined ? { inspectorCycle: data.inspectorCycle || null } : {}),
    ...(data.managerName !== undefined ? { managerName: data.managerName || null } : {}),
    ...(data.managerDesc !== undefined ? { managerDesc: data.managerDesc || null } : {}),
    ...(data.managerCycle !== undefined ? { managerCycle: data.managerCycle || null } : {}),
    ...(data.escalationNote !== undefined ? { escalationNote: data.escalationNote || null } : {}),
  })
  revalidatePath("/equipment")
  revalidatePath(`/equipment/${id}`)
}

export async function deleteEquipment(id: number) {
  const photos = selectWhere("equipmentPhotos", (p) => p.equipmentId === id)
  for (const photo of photos) {
    deleteLocalUpload(photo.url)
  }
  removeWhere("equipmentPhotos", (p) => p.equipmentId === id)
  removeWhere("dailyCheckItems", (i) => i.equipmentId === id)
  removeWhere("equipment", (e) => e.id === id)
  revalidatePath("/equipment")
}

export async function getEquipmentPhotos(equipmentId: number) {
  return selectWhere("equipmentPhotos", (p) => p.equipmentId === equipmentId).sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id - b.id,
  )
}

export async function addEquipmentPhoto(equipmentId: number, url: string, label?: string) {
  const created = insertRow("equipmentPhotos", {
    equipmentId,
    url,
    label: label || null,
    sortOrder: 0,
    createdAt: new Date().toISOString(),
  })
  revalidatePath(`/equipment/${equipmentId}`)
  return created
}

export async function deleteEquipmentPhoto(id: number, equipmentId: number, url: string) {
  removeWhere("equipmentPhotos", (p) => p.id === id && p.equipmentId === equipmentId)
  deleteLocalUpload(url)
  revalidatePath(`/equipment/${equipmentId}`)
}

export async function getDailyCheckItems(equipmentId: number) {
  return selectWhere("dailyCheckItems", (i) => i.equipmentId === equipmentId).sort(
    (a, b) => a.sortOrder - b.sortOrder || a.itemNo - b.itemNo,
  )
}

export async function createDailyCheckItem(
  equipmentId: number,
  data: { itemNo: number; content: string; method?: string; cycle?: string; sortOrder?: number },
) {
  const created = insertRow("dailyCheckItems", {
    equipmentId,
    itemNo: data.itemNo,
    content: data.content,
    method: data.method?.trim() || "육안",
    cycle: data.cycle?.trim() || "일",
    sortOrder: data.sortOrder ?? data.itemNo,
  })
  revalidatePath(`/equipment/${equipmentId}`)
  revalidatePath(`/checksheets/daily/${equipmentId}`)
  return created
}

export async function updateDailyCheckItem(
  id: number,
  equipmentId: number,
  data: { itemNo?: number; content?: string; method?: string; cycle?: string },
) {
  updateById("dailyCheckItems", id, {
    ...(data.itemNo !== undefined ? { itemNo: data.itemNo } : {}),
    ...(data.content !== undefined ? { content: data.content } : {}),
    ...(data.method !== undefined ? { method: data.method?.trim() || "육안" } : {}),
    ...(data.cycle !== undefined ? { cycle: data.cycle?.trim() || "일" } : {}),
  })
  revalidatePath(`/equipment/${equipmentId}`)
  revalidatePath(`/checksheets/daily/${equipmentId}`)
}

export async function deleteDailyCheckItem(id: number, equipmentId: number) {
  removeWhere("dailyCheckItems", (i) => i.id === id)
  revalidatePath(`/equipment/${equipmentId}`)
  revalidatePath(`/checksheets/daily/${equipmentId}`)
}

export async function getEquipmentEmergencyActions(equipmentId: number) {
  return selectWhere("equipmentEmergencyActions", (i) => i.equipmentId === equipmentId).sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id - b.id,
  )
}

export async function createEquipmentEmergencyAction(
  equipmentId: number,
  data: {
    emergencyType?: string
    emergencyAction?: string
    occurredDate?: string
    cause?: string
    action?: string
    processedDate?: string
    note?: string
    sortOrder?: number
  },
) {
  const created = insertRow("equipmentEmergencyActions", {
    equipmentId,
    emergencyType: data.emergencyType || null,
    emergencyAction: data.emergencyAction || null,
    occurredDate: data.occurredDate || null,
    cause: data.cause || null,
    action: data.action || null,
    processedDate: data.processedDate || null,
    note: data.note || null,
    sortOrder: data.sortOrder ?? 0,
  })
  revalidatePath(`/equipment/${equipmentId}`)
  return created
}

export async function updateEquipmentEmergencyAction(
  id: number,
  equipmentId: number,
  data: {
    emergencyType?: string
    emergencyAction?: string
    occurredDate?: string
    cause?: string
    action?: string
    processedDate?: string
    note?: string
  },
) {
  updateById("equipmentEmergencyActions", id, data)
  revalidatePath(`/equipment/${equipmentId}`)
}

export async function deleteEquipmentEmergencyAction(id: number, equipmentId: number) {
  removeWhere("equipmentEmergencyActions", (i) => i.id === id)
  revalidatePath(`/equipment/${equipmentId}`)
}
