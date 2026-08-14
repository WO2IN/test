import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, CalendarIcon } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { PhotoUploader } from '@/components/photo-uploader'
import { EquipmentInfoForm } from '@/components/equipment-info-form'
import { CheckItemManager } from '@/components/check-item-manager'
import { InspectorManagerCard } from '@/components/inspector-manager-card'
import { EmergencyActionCard } from '@/components/emergency-action-card'
import {
  getEquipmentById,
  getEquipmentPhotos,
  getDailyCheckItems,
  getEquipmentEmergencyActions,
} from '@/app/actions/equipment'

const OVERVIEW_LABEL = '전체 전경'
const PART_LABELS = ['1', '2', '3', '4', '5', '6', '7']

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const equipmentId = Number(id)
  const equipment = await getEquipmentById(equipmentId)
  if (!equipment) notFound()

  const [photos, items, emergencyActions] = await Promise.all([
    getEquipmentPhotos(equipmentId),
    getDailyCheckItems(equipmentId),
    getEquipmentEmergencyActions(equipmentId),
  ])

  const overviewPhotos = photos.filter((p) => p.label === OVERVIEW_LABEL)

  return (
    <div className="min-h-screen">
      <SiteHeader active="/equipment" />
      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        <Link href="/equipment" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeftIcon className="size-3.5" />
          설비 목록
        </Link>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">{equipment.name}</h1>
          <Link
            href={`/checksheets/daily/${equipment.id}`}
            className={buttonVariants({ variant: 'outline' })}
          >
            <CalendarIcon data-icon="inline-start" />
            일상점검 체크시트로 이동
          </Link>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <EquipmentInfoForm equipment={equipment} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>설비 사진</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <PhotoUploader equipmentId={equipmentId} photos={overviewPhotos} label={OVERVIEW_LABEL} size="large" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
                {PART_LABELS.map((label) => (
                  <PhotoUploader
                    key={label}
                    equipmentId={equipmentId}
                    photos={photos.filter((p) => p.label === label)}
                    label={label}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>일상점검 항목 템플릿</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <CheckItemManager equipmentId={equipmentId} items={items} />
              <InspectorManagerCard equipment={equipment} />
              <EmergencyActionCard equipment={equipment} equipmentId={equipmentId} rows={emergencyActions} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
