"use client"

import { Button } from "@/components/ui/button"
import { Printer, Loader2 } from "lucide-react"
import { useState } from "react"

interface Props {
  invoiceNumber: string
}

export default function PrintButton({ invoiceNumber }: Props) {
  const [isGenerating, setIsGenerating] = useState(false)

  // ฟังก์ชันสำหรับแปลง DOM เป็น HTML ที่พิมพ์ได้
  const generateInvoiceHTML = (element: HTMLElement) => {
    // 1. ค้นหาและดึงข้อมูลจากองค์ประกอบต่างๆ
    const logoImg = element.querySelector("img")
    // เราจะได้ URL เต็มของรูปภาพ เช่น 'http://localhost:3000/logo512.png'
    const logoSrc = logoImg ? logoImg.src : ""

    const companyName =
      element.querySelector("h2")?.textContent || "บริษัท สัก วู้ดเวิร์ค จำกัด"
    const companyAddress =
      element.querySelector(".text-muted-foreground")?.textContent || ""
    const customerName =
      element.querySelector(".text-blue-600, .print-only-text")?.textContent ||
      ""
    const customerAddress =
      element.querySelector(".text-muted-foreground:nth-of-type(2)")
        ?.textContent || ""
    const invoiceTitle =
      element.querySelector(".text-5xl")?.textContent || "INVOICE"
    const invoiceNumberText =
      element.querySelector(".text-4xl + .text-muted-foreground")
        ?.textContent || `#${invoiceNumber}`

    // ดึงข้อมูลวันที่และสถานะ
    const dateElements = element.querySelectorAll(".text-right p")
    let issueDate = ""
    let dueDate = ""
    let statusText = ""
    dateElements.forEach((p) => {
      const text = p.textContent || ""
      if (text.includes("วันที่ออก:")) {
        issueDate = text.replace("วันที่ออก:", "").trim()
      } else if (text.includes("ครบกำหนดชำระ:")) {
        dueDate = text.replace("ครบกำหนดชำระ:", "").trim()
      } else if (text.includes("สถานะ:")) {
        // หา Badge ที่อยู่ภายใน p แล้วดึงข้อความออกมา
        statusText =
          p.querySelector('span[class*="badge"]')?.textContent || "N/A"
      }
    })

    // ดึงข้อมูลตาราง
    const tableRows = element.querySelectorAll("tbody tr")
    let itemsHTML = ""
    tableRows.forEach((row) => {
      const cells = row.querySelectorAll("td")
      if (cells.length >= 4) {
        itemsHTML += `
                <tr>
                    <td>${cells[0].textContent}</td>
                    <td class="qty-col">${cells[1].textContent}</td>
                    <td class="price-col">${cells[2].textContent}</td>
                    <td class="total-col">${cells[3].textContent}</td>
                </tr>`
      }
    })

    // ดึงข้อมูลยอดรวม
    const totalsSection = element.querySelectorAll(
      ".w-full.max-w-sm.space-y-2 > div"
    )
    let subtotal = ""
    let vat = ""
    let grandTotal = ""
    totalsSection.forEach((line) => {
      const text = line.textContent || ""
      const value = line.querySelector("span:last-child")?.textContent || ""
      if (text.includes("ยอดรวมก่อนภาษี")) subtotal = value
      if (text.includes("ภาษีมูลค่าเพิ่ม")) vat = value
      if (text.includes("ยอดรวมทั้งสิ้น")) grandTotal = value
    })

    // 2. สร้างโครงสร้าง HTML สำหรับหน้าพิมพ์ทั้งหมด
    return `
        <div class="header">
            <div class="company-info">
                ${
                  logoSrc
                    ? `<img src="${logoSrc}" alt="Company Logo" style="width: 100px; margin-bottom: 10px;" />`
                    : ""
                }
                <h2>${companyName}</h2>
                <p>${companyAddress}</p>
            </div>
            <div class="invoice-title">
                <h1>${invoiceTitle}</h1>
                <p>${invoiceNumberText}</p>
            </div>
        </div>
        <div class="invoice-details">
            <div class="customer-info">
                <p class="label">ลูกค้า:</p>
                <p class="customer-name">${customerName}</p>
                <p class="address">${customerAddress}</p>
            </div>
            <div class="dates-status">
                <p><strong>วันที่ออก:</strong> ${issueDate}</p>
                <p><strong>ครบกำหนดชำระ:</strong> ${dueDate}</p>
                <p><strong>สถานะ:</strong> ${statusText}</p>
            </div>
        </div>
        <table class="items-table">
            <thead>
                <tr>
                    <th>รายการ</th>
                    <th class="qty-col">จำนวน</th>
                    <th class="price-col">ราคา/หน่วย</th>
                    <th class="total-col">รวม</th>
                </tr>
            </thead>
            <tbody>${itemsHTML}</tbody>
        </table>
        <div class="totals">
            <table class="totals-table">
                <tr><td class="label">ยอดรวมก่อนภาษี</td><td class="amount">${subtotal}</td></tr>
                <tr><td class="label">ภาษีมูลค่าเพิ่ม (7%)</td><td class="amount">${vat}</td></tr>
                <tr class="grand-total"><td class="label">ยอดรวมทั้งสิ้น</td><td class="amount">${grandTotal}</td></tr>
            </table>
        </div>
    `
  }

  const handleExportPDF = async () => {
    setIsGenerating(true)

    try {
      const invoiceElement = document.getElementById("printable-area")
      if (!invoiceElement) {
        alert("ไม่พบส่วนของใบแจ้งหนี้ที่สามารถพิมพ์ได้")
        setIsGenerating(false)
        return
      }

      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        alert("กรุณาอนุญาตให้เปิด popup window")
        setIsGenerating(false)
        return
      }

      // สร้าง HTML สำหรับพิมพ์โดยใช้ inline styles
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: white; color: #000; line-height: 1.6; font-size: 14px; }
            .invoice-container { max-width: 800px; margin: 0 auto; padding: 40px; background: white; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .company-info h2 { font-size: 18px; font-weight: bold; margin-bottom: 8px; color: #000; }
            .company-info p { color: #666; font-size: 12px; }
            .invoice-title { text-align: right; }
            .invoice-title h1 { font-size: 48px; font-weight: bold; color: #000; margin-bottom: 8px; }
            .invoice-title p { color: #666; font-size: 16px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .customer-info p { margin-bottom: 4px; }
            .customer-info .label { font-weight: bold; color: #666; }
            .customer-info .customer-name { font-size: 16px; font-weight: bold; color: #000; margin: 8px 0; }
            .customer-info .address { color: #666; }
            .dates-status { text-align: right; }
            .dates-status p { margin-bottom: 8px; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; background: #f1f5f9; color: #334155; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th, .items-table td { border-bottom: 1px solid #eee; padding: 12px; text-align: left; }
            .items-table th { background: #f8fafc; font-weight: bold; color: #000; }
            .items-table .qty-col, .items-table .price-col, .items-table .total-col { text-align: right; }
            .totals { display: flex; justify-content: flex-end; margin-top: 20px; }
            .totals-table { width: 300px; }
            .totals-table tr { border-bottom: 1px solid #eee; }
            .totals-table td { padding: 8px 0; }
            .totals-table .label { text-align: left; }
            .totals-table .amount { text-align: right; font-weight: bold; }
            .grand-total { border-top: 2px solid #000; font-size: 18px; font-weight: bold; }
            @media print { .invoice-container { padding: 20px; } body { font-size: 12px; } }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${generateInvoiceHTML(invoiceElement)}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
        </html>
      `

      printWindow.document.write(printContent)
      printWindow.document.close()
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error generating print content:", error)
        alert(`เกิดข้อผิดพลาด: ${error.message}`)
      }
    } finally {
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
      {isGenerating ? "กำลังเตรียมการพิมพ์..." : "พิมพ์ / Export PDF"}
    </Button>
  )
}
