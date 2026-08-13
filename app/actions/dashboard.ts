"use server"

import { selectAll } from "@/lib/local-store"

export async function getDashboardSummary() {
  const [equipmentList, dailyIssuesRaw, tempIssuesRaw, dailySheets] = await Promise.all([
    Promise.resolve(selectAll("equipment")),
    Promise.resolve(selectAll("dailyCheckIssues")),
    Promise.resolve(selectAll("tempHumidityIssues")),
    Promise.resolve(selectAll("dailyCheckSheets")),
  ])

  const equipmentNameMap = new Map(equipmentList.map((e: any) => [e.id, e.name]))
  const sheetEquipmentMap = new Map(dailySheets.map((s: any) => [s.id, s.equipmentId]))

  const dailyIssues = dailyIssuesRaw
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((issue: any) => {
      const equipmentId = sheetEquipmentMap.get(issue.sheetId)
      return {
        id: issue.id,
        source: "설비 일상점검" as const,
        label: equipmentId ? equipmentNameMap.get(equipmentId) ?? "-" : "-",
        date: issue.occurredDate,
        detail: issue.cause,
        createdAt: issue.createdAt,
      }
    })

  const tempIssues = tempIssuesRaw
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((issue: any) => ({
      id: issue.id,
      source: "온/습도" as const,
      label: "온/습도",
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
