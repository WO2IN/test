'use server'

import { db } from '@/lib/db'
import { equipment, dailyCheckIssues, tempHumidityIssues, dailyCheckSheets } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'

export async function getDashboardSummary() {
  const [equipmentList, dailyIssuesRaw, tempIssuesRaw] = await Promise.all([
    db.select().from(equipment),
    db
      .select({
        id: dailyCheckIssues.id,
        occurredDate: dailyCheckIssues.occurredDate,
        cause: dailyCheckIssues.cause,
        action: dailyCheckIssues.action,
        createdAt: dailyCheckIssues.createdAt,
        equipmentId: dailyCheckSheets.equipmentId,
      })
      .from(dailyCheckIssues)
      .leftJoin(dailyCheckSheets, eq(dailyCheckIssues.sheetId, dailyCheckSheets.id))
      .orderBy(desc(dailyCheckIssues.createdAt))
      .limit(5),
    db.select().from(tempHumidityIssues).orderBy(desc(tempHumidityIssues.createdAt)).limit(5),
  ])

  const equipmentNameMap = new Map(equipmentList.map((e) => [e.id, e.name]))

  const dailyIssues = dailyIssuesRaw.map((issue) => ({
    id: issue.id,
    source: '설비 일상점검' as const,
    label: issue.equipmentId ? equipmentNameMap.get(issue.equipmentId) ?? '-' : '-',
    date: issue.occurredDate,
    detail: issue.cause,
    createdAt: issue.createdAt,
  }))

  const tempIssues = tempIssuesRaw.map((issue) => ({
    id: issue.id,
    source: '온/습도' as const,
    label: '온/습도',
    date: issue.occurredDate,
    detail: issue.content,
    createdAt: issue.createdAt,
  }))

  const recentIssues = [...dailyIssues, ...tempIssues]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)

  return {
    equipmentCount: equipmentList.length,
    recentIssues,
  }
}
