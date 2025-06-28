"use client"

import { createInvoiceFromQuotation } from "@/app/invoices/actions"
import { Button } from "@/components/ui/button"
import { FilePlus2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

interface Props {
  quotationId: number
}

export default function ConvertToInvoiceButton({ quotationId }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleConvert = () => {
    if (!confirm("คุณต้องการแปลงใบเสนอราคานี้เป็นใบแจ้งหนี้ใช่หรือไม่?")) {
      return
    }

    startTransition(async () => {
      const result = await createInvoiceFromQuotation(quotationId)
      if (result.success && result.newInvoiceId) {
        // ถ้าสำเร็จ ให้พาไปยังหน้าของ Invoice ที่เพิ่งสร้าง
        router.push(`/invoices/${result.newInvoiceId}`)
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.error}`)
      }
    })
  }

  return (
    <Button onClick={handleConvert} disabled={isPending} variant="success">
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FilePlus2 className="mr-2 h-4 w-4" />
      )}
      {isPending ? "กำลังแปลง..." : "แปลงเป็นใบแจ้งหนี้"}
    </Button>
  )
}
