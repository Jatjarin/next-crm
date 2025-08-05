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

  // ถ้าสถานะสิ้นสุดแล้ว (อนุมัติ/ไม่อนุมัติ) ให้แสดงแค่สถานะ
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
      {currentStatus === "Sent" && (
        <>
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
