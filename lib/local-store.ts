import fs from "node:fs"
import path from "node:path"

// Simple server-local JSON file storage. No external database is used.
// All data lives in a single JSON file on the server's filesystem.
// Note: on ephemeral/serverless hosting this file may reset on redeploy —
// this is expected for a "local file" storage mode.

const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "db.json")

export interface Store {
  equipment: any[]
  equipmentPhotos: any[]
  fiveSTargets: any[]
  fiveSCheckItems: any[]
  fiveSSheets: any[]
  fiveSEntries: any[]
  dailyCheckItems: any[]
  dailyCheckSheets: any[]
  dailyCheckEntries: any[]
  dailyCheckIssues: any[]
  equipmentEmergencyGuides: any[]
  equipmentEmergencyHistories: any[]
  tempHumidityTargets: any[]
  tempHumiditySheets: any[]
  tempHumidityEntries: any[]
  tempHumidityIssues: any[]
  _seq: Record<string, number>
}

type TableName = Exclude<keyof Store, "_seq">

function emptyStore(): Store {
  return {
    equipment: [],
    equipmentPhotos: [],
    fiveSTargets: [],
    fiveSCheckItems: [],
    fiveSSheets: [],
    fiveSEntries: [],
    dailyCheckItems: [],
    dailyCheckSheets: [],
    dailyCheckEntries: [],
    dailyCheckIssues: [],
    equipmentEmergencyGuides: [],
    equipmentEmergencyHistories: [],
    tempHumidityTargets: [],
    tempHumiditySheets: [],
    tempHumidityEntries: [],
    tempHumidityIssues: [],
    _seq: {},
  }
}

let cache: Store | null = null

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify(emptyStore(), null, 2))
}

function load(): Store {
  if (cache) return cache
  ensureFile()
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8")
    const parsed = JSON.parse(raw)
    cache = { ...emptyStore(), ...parsed }
  } catch (error) {
    console.error("[v0] Failed to read local store, starting fresh:", error)
    cache = emptyStore()
  }
  return cache!
}

function persist() {
  ensureFile()
  fs.writeFileSync(DATA_FILE, JSON.stringify(cache, null, 2))
}

function nextId(table: TableName): number {
  const store = load()
  store._seq[table] = (store._seq[table] || 0) + 1
  return store._seq[table]
}

export function selectAll<T = any>(table: TableName): T[] {
  return [...(load()[table] as T[])]
}

export function selectWhere<T = any>(table: TableName, predicate: (row: T) => boolean): T[] {
  return selectAll<T>(table).filter(predicate)
}

export function findOne<T = any>(table: TableName, predicate: (row: T) => boolean): T | null {
  return selectWhere<T>(table, predicate)[0] ?? null
}

export function insertRow<T extends Record<string, any>>(table: TableName, data: T) {
  const store = load()
  const id = nextId(table)
  const row = { id, ...data }
  ;(store[table] as any[]).push(row)
  persist()
  return row
}

export function updateById(table: TableName, id: number, patch: Record<string, any>) {
  const store = load()
  const arr = store[table] as any[]
  const idx = arr.findIndex((r) => r.id === id)
  if (idx === -1) return null
  arr[idx] = { ...arr[idx], ...patch }
  persist()
  return arr[idx]
}

export function updateWhere(table: TableName, predicate: (row: any) => boolean, patch: Record<string, any>) {
  const store = load()
  const arr = store[table] as any[]
  let updated: any = null
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i])) {
      arr[i] = { ...arr[i], ...patch }
      updated = arr[i]
    }
  }
  persist()
  return updated
}

export function removeWhere(table: TableName, predicate: (row: any) => boolean) {
  const store = load()
  const arr = store[table] as any[]
  const before = arr.length
  store[table] = arr.filter((r) => !predicate(r))
  persist()
  return before - (store[table] as any[]).length
}
