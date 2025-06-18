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

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={handlePrint}>
        <Printer size={16} className="mr-2" />
        พิมพ์ / Export PDF
      </Button>

      {currentStatus === "Paid" ? (
        <span className="text-green-600 font-bold flex items-center h-10 px-4">
          <CheckCircle size={20} className="mr-2" /> ชำระเงินเรียบร้อยแล้ว
        </span>
      ) : (
        <>
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
