import {
  pgTable,
  serial,
  integer,
  text,
  numeric,
  timestamp,
  unique,
} from "drizzle-orm/pg-core"

export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  department: text("department"),
  manager: text("manager"),
  location: text("location"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const equipmentPhotos = pgTable("equipment_photos", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull(),
  url: text("url").notNull(),
  label: text("label"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const fiveSSheets = pgTable(
  "five_s_sheets",
  {
    id: serial("id").primaryKey(),
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    remarks: text("remarks"),
    writer: text("writer"),
    reviewer: text("reviewer"),
    approver: text("approver"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    yearMonthUnique: unique().on(table.year, table.month),
  }),
)

export const fiveSEntries = pgTable(
  "five_s_entries",
  {
    id: serial("id").primaryKey(),
    sheetId: integer("sheet_id").notNull(),
    itemCode: text("item_code").notNull(),
    day: integer("day").notNull(),
    value: text("value"),
  },
  (table) => ({
    entryUnique: unique().on(table.sheetId, table.itemCode, table.day),
  }),
)

export const dailyCheckItems = pgTable("daily_check_items", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull(),
  itemNo: integer("item_no").notNull(),
  content: text("content").notNull(),
  method: text("method"),
  cycle: text("cycle"),
  sortOrder: integer("sort_order").notNull().default(0),
})

export const dailyCheckSheets = pgTable(
  "daily_check_sheets",
  {
    id: serial("id").primaryKey(),
    equipmentId: integer("equipment_id").notNull(),
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    department: text("department"),
    manager: text("manager"),
    writer: text("writer"),
    reviewer: text("reviewer"),
    approver: text("approver"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    equipYearMonthUnique: unique().on(table.equipmentId, table.year, table.month),
  }),
)

export const dailyCheckEntries = pgTable(
  "daily_check_entries",
  {
    id: serial("id").primaryKey(),
    itemId: integer("item_id").notNull(),
    sheetId: integer("sheet_id").notNull(),
    day: integer("day").notNull(),
    value: text("value"),
  },
  (table) => ({
    entryUnique: unique().on(table.itemId, table.sheetId, table.day),
  }),
)

export const dailyCheckIssues = pgTable("daily_check_issues", {
  id: serial("id").primaryKey(),
  sheetId: integer("sheet_id").notNull(),
  occurredDate: text("occurred_date"),
  cause: text("cause"),
  action: text("action"),
  processedDate: text("processed_date"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const tempHumiditySheets = pgTable(
  "temp_humidity_sheets",
  {
    id: serial("id").primaryKey(),
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    writer: text("writer"),
    reviewer: text("reviewer"),
    approver: text("approver"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    yearMonthUnique: unique().on(table.year, table.month),
  }),
)

export const tempHumidityEntries = pgTable(
  "temp_humidity_entries",
  {
    id: serial("id").primaryKey(),
    sheetId: integer("sheet_id").notNull(),
    day: integer("day").notNull(),
    temperature: numeric("temperature"),
    humidity: numeric("humidity"),
    checker: text("checker"),
  },
  (table) => ({
    entryUnique: unique().on(table.sheetId, table.day),
  }),
)

export const tempHumidityIssues = pgTable("temp_humidity_issues", {
  id: serial("id").primaryKey(),
  sheetId: integer("sheet_id").notNull(),
  occurredDate: text("occurred_date"),
  content: text("content"),
  action: text("action"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})
