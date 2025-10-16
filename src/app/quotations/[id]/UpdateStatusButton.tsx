/**
 * UpdateStatusButton Component - ปุ่มอัปเดตสถานะใบเสนอราคา
 *
 * คอมโพเนนต์สำหรับเปลี่ยนสถานะของใบเสนอราคาตามขั้นตอนการทำงาน:
 * - Draft (ฉบับร่าง) -> Sent (ส่งแล้ว) -> Accepted/Rejected (อนุมัติ/ไม่อนุมัติ)
 *
 * @param quotationId - รหัสใบเสนอราคาที่ต้องการอัปเดตสถานะ
 * @param currentStatus - สถานะปัจจุบันของใบเสนอราคา
 *
 * พฤติกรรมตามสถานะ:
 * - Draft: แสดงปุ่ม "ส่งให้ลูกค้า"
 * - Sent: แสดงปุ่ม "อนุมัติ" และ "ไม่อนุมัติ"
 * - Accepted/Rejected: แสดงข้อความสถานะสุดท้าย (ไม่มีปุ่ม)
 */
"use client"

import { updateQuotationStatus } from "../actions"
import { useTransition } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, Send, XCircle, Ban, Loader2 } from "lucide-react"

interface Props {
  quotationId: number
  currentStatus: string
}

export default function UpdateStatusButton({
  quotationId,
  currentStatus,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const t = useTranslations("UpdateStatusButton")

  /**
   * ฟังก์ชันจัดการการอัปเดตสถานะใบเสนอราคา
   *
   * @param newStatus - สถานะใหม่ที่ต้องการเปลี่ยน
   *
   * ขั้นตอนการทำงาน:
   * 1. เรียกใช้ Server Action updateQuotationStatus
   * 2. ตรวจสอบผลลัพธ์จากการอัปเดต
   * 3. ถ้าสำเร็จจะ refresh หน้าเพื่อแสดงข้อมูลใหม่
   * 4. ถ้าไม่สำเร็จจะแสดงข้อความ error
   */
  const handleUpdateStatus = (newStatus: string) => {
    startTransition(async () => {
      const result = await updateQuotationStatus(quotationId, newStatus)
      if (result?.message === "Success") {
        router.refresh()
      } else {
        alert(result?.message || "เกิดข้อผิดพลาด")
      }
    })
  }

  // ถ้าสถานะสิ้นสุดแล้ว (อนุมัติ/ไม่อนุมัติ) แสดงเฉพาะข้อความสถานะ
  // ไม่แสดงปุ่มเพราะไม่สามารถเปลี่ยนสถานะต่อได้
  if (currentStatus === "Accepted" || currentStatus === "Rejected") {
    return (
      <span
        className={`font-bold flex items-center h-10 px-4 ${
          currentStatus === "Accepted" ? "text-green-600" : "text-red-600"
        }`}
      >
        {currentStatus === "Accepted" ? (
          <CheckCircle size={20} className="mr-2" />
        ) : (
          <XCircle size={20} className="mr-2" />
        )}
        {currentStatus === "Accepted" ? t("accepted") : t("rejected")}
      </span>
    )
  }

  return (
    <div className="flex gap-2">
      {/* ถ้าสถานะเป็น "Draft" แสดงปุ่ม "ส่งให้ลูกค้า" เพื่อเปลี่ยนเป็นสถานะ "Sent" */}
      {currentStatus === "Draft" && (
        <Button onClick={() => handleUpdateStatus("Sent")} disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send size={16} className="mr-2" />
          )}
          {isPending ? "กำลังส่ง..." : "ส่งให้ลูกค้า"}
        </Button>
      )}
      {/* ถ้าสถานะเป็น "Sent" แสดงปุ่มให้เลือก "อนุมัติ" หรือ "ไม่อนุมัติ" */}
      {currentStatus === "Sent" && (
        <>
          {/* ปุ่มอนุมัติ - เปลี่ยนสถานะเป็น "Accepted" */}
          <Button
            variant="success"
            onClick={() => handleUpdateStatus("Accepted")}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle size={16} className="mr-2" />
            )}
            อนุมัติ
          </Button>
          {/* ปุ่มไม่อนุมัติ - เปลี่ยนสถานะเป็น "Rejected" */}
          <Button
            variant="destructive"
            onClick={() => handleUpdateStatus("Rejected")}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Ban size={16} className="mr-2" />
            )}
            ไม่อนุมัติ
          </Button>
        </>
      )}
    </div>
  )
}
