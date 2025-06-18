"use client"

import { Button } from "@/components/ui/button"
import { Printer, Loader2 } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useState } from "react"

interface Props {
  invoiceNumber: string
}

export default function PrintButton({ invoiceNumber }: Props) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleExportPDF = () => {
    setIsGenerating(true)

    const invoiceElement = document.getElementById("printable-area")

    if (invoiceElement) {
      // แก้ไข: เพิ่ม options สำหรับ html2canvas
      // allowTaint และ useCORS ช่วยแก้ปัญหาเรื่องการโหลดรูปภาพจากแหล่งอื่น
      html2canvas(invoiceElement, {
        scale: 2,
        allowTaint: true,
        useCORS: true,
        backgroundColor: "#ffffff", // <-- เพิ่มบรรทัดนี้
      })
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png")

          const pdf = new jsPDF("p", "mm", "a4")
          const pdfWidth = pdf.internal.pageSize.getWidth()
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width

          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
          pdf.save(`invoice-${invoiceNumber}.pdf`)
          setIsGenerating(false)
        })
        .catch((err) => {
          // แก้ไข: แสดง Error ที่ละเอียดขึ้นใน Console
          console.error("Error generating PDF:", err)
          alert("เกิดข้อผิดพลาดในการสร้าง PDF (ดูรายละเอียดใน Console)")
          setIsGenerating(false)
        })
    } else {
      alert("ไม่พบส่วนของใบแจ้งหนี้ที่สามารถพิมพ์ได้")
      setIsGenerating(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleExportPDF} disabled={isGenerating}>
      {isGenerating ? (
        <Loader2 size={16} className="mr-2 animate-spin" />
      ) : (
        <Printer size={16} className="mr-2" />
      )}
      {isGenerating ? "กำลังสร้าง PDF..." : "พิมพ์ / Export PDF"}
    </Button>
  )
}
