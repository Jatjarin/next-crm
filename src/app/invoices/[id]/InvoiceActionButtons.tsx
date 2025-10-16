/**
 * InvoiceActionButtons Component - กลุ่มปุ่มดำเนินการใบแจ้งหนี้
 *
 * คอมโพเนนต์รวมปุ่มดำเนินการต่างๆ สำหรับใบแจ้งหนี้:
 * 1. ปุ่มพิมพ์/ส่งออก PDF
 * 2. ปุ่มอัปเดตสถานะ (ส่งแล้ว/ชำระแล้ว)
 *
 * @param invoiceId - รหัสใบแจ้งหนี้
 * @param currentStatus - สถานะปัจจุบันของใบแจ้งหนี้
 *
 * พฤติกรรมตามสถานะ:
 * - Draft: แสดงปุ่ม "พิมพ์" + "ส่งแล้ว"
 * - Sent: แสดงปุ่ม "พิมพ์" + "ชำระแล้ว"
 * - Paid: แสดงปุ่ม "พิมพ์" + ข้อความยืนยันการชำระเงิน
 */
"use client"

import { updateInvoiceStatus } from "../actions"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, Send, Loader2, Printer } from "lucide-react"

interface Props {
  invoiceId: number
  currentStatus: string
}

export default function InvoiceActionButtons({
  invoiceId,
  currentStatus,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  /**
   * ฟังก์ชันจัดการการอัปเดตสถานะใบแจ้งหนี้
   *
   * @param newStatus - สถานะใหม่ที่ต้องการเปลี่ยน
   */
  const handleUpdateStatus = (newStatus: string) => {
    startTransition(async () => {
      const result = await updateInvoiceStatus(invoiceId, newStatus)
      if (result?.message === "Success") {
        router.refresh()
      } else {
        alert(result?.message || "เกิดข้อผิดพลาด")
      }
    })
  }

  /**
   * ฟังก์ชันเรียกใช้การพิมพ์หน้าปัจจุบัน
   * ใช้ window.print() ของเบราว์เซอร์
   */
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex items-center gap-2">
      {/* ปุ่มพิมพ์/ส่งออก PDF - แสดงตลอดเวลาไม่ว่าสถานะใด */}
      <Button variant="outline" onClick={handlePrint}>
        <Printer size={16} className="mr-2" />
        พิมพ์ / Export PDF
      </Button>

      {/* แสดงข้อความหรือปุ่มตามสถานะปัจจุบัน */}
      {currentStatus === "Paid" ? (
        /* ถ้าสถานะเป็น "Paid" แสดงข้อความยืนยันการชำระเงิน */
        <span className="text-green-600 font-bold flex items-center h-10 px-4">
          <CheckCircle size={20} className="mr-2" /> ชำระเงินเรียบร้อยแล้ว
        </span>
      ) : (
        <>
          {/* ถ้าสถานะเป็น "Draft" แสดงปุ่ม "ส่งแล้ว" */}
          {currentStatus === "Draft" && (
            <Button
              onClick={() => handleUpdateStatus("Sent")}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send size={16} className="mr-2" />
              )}
              {isPending ? "กำลังบันทึก..." : "ส่งแล้ว"}
            </Button>
          )}
          {/* ถ้าสถานะไม่ใช่ "Draft" แสดงปุ่ม "ชำระแล้ว" */}
          {currentStatus !== "Draft" && (
            <Button
              onClick={() => handleUpdateStatus("Paid")}
              disabled={isPending}
              variant="success"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle size={16} className="mr-2" />
              )}
              {isPending ? "กำลังบันทึก..." : "ชำระแล้ว"}
            </Button>
          )}
        </>
      )}
    </div>
  )
}
