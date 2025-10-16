"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { updateCustomer } from "../actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pencil } from "lucide-react"

/**
 * EditForm Component - Customer Edit Form / คอมโพเนนต์ฟอร์มแก้ไขลูกค้า
 *
 * Form Purpose / วัตถุประสงค์ของฟอร์ม:
 * - Edit customer information / แก้ไขข้อมูลลูกค้า
 * - Toggle between view and edit mode / สลับระหว่างโหมดดูและแก้ไข
 * - Update customer details in database / อัปเดตรายละเอียดลูกค้าในฐานข้อมูล
 *
 * Form Fields / ฟิลด์ของฟอร์ม:
 * - name: ชื่อลูกค้า (required / จำเป็น)
 * - tax_id: เลขประจำตัวผู้เสียภาษี (optional / ไม่บังคับ)
 * - address: ที่อยู่ (optional / ไม่บังคับ)
 * - phone: เบอร์โทรศัพท์ (optional / ไม่บังคับ)
 * - line_id: ไลน์ไอดี (optional / ไม่บังคับ)
 * - responsible_person: ผู้ติดต่อ (optional / ไม่บังคับ)
 *
 * State Management / การจัดการ State:
 * - isEditing: สถานะการแก้ไข (true = แสดงฟอร์ม, false = แสดงปุ่มแก้ไข)
 *
 * Submit Logic / ตรรกะการส่งฟอร์ม:
 * - Uses Server Actions (updateCustomer) / ใช้ Server Actions
 * - Automatic form submission via action prop / ส่งฟอร์มอัตโนมัติผ่าน action prop
 */

// กำหนด Type ของข้อมูลลูกค้า
// Customer type definition / กำหนดประเภทข้อมูลลูกค้า
type Customer = {
  id: number
  name: string
  tax_id: string | null
  address: string | null
  phone: string | null
  line_id: string | null
  responsible_person: string | null
}

interface Props {
  customer: Customer
}

export default function EditForm({ customer }: Props) {
  const t = useTranslations("EditCustomerForm")

  // State Management / การจัดการ State
  // 1. เพิ่ม State เพื่อจัดการโหมดการแก้ไข
  // isEditing controls whether form is shown or just the edit button
  // isEditing ควบคุมว่าจะแสดงฟอร์มหรือแค่ปุ่มแก้ไข
  const [isEditing, setIsEditing] = useState(false)

  // Bind customer ID to updateCustomer Server Action
  // ผูก customer ID เข้ากับ Server Action updateCustomer
  const updateCustomerWithId = updateCustomer.bind(null, customer.id)

  // View Mode Render / การแสดงผลในโหมดดู
  // 2. ถ้ายังไม่ได้อยู่ในโหมดแก้ไข ให้แสดงแค่ปุ่ม
  // If not in edit mode, show only the edit button
  // ถ้าไม่อยู่ในโหมดแก้ไข จะแสดงเฉพาะปุ่มแก้ไข
  if (!isEditing) {
    return (
      <div className="mt-6">
        <Button onClick={() => setIsEditing(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          {t("buttonTitle")}
        </Button>
      </div>
    )
  }

  // Edit Mode Render / การแสดงผลในโหมดแก้ไข
  // 3. ถ้าอยู่ในโหมดแก้ไข ให้แสดงฟอร์มเต็มรูปแบบ
  // When in edit mode, render the full form with all fields
  // เมื่ออยู่ในโหมดแก้ไข แสดงฟอร์มเต็มรูปแบบพร้อมฟิลด์ทั้งหมด
  return (
    <form action={updateCustomerWithId}>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("dialogTitle")}</CardTitle>
          <CardDescription>{t("dialogDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Form Fields Grid / กริดฟิลด์ฟอร์ม */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Customer Name Field / ฟิลด์ชื่อลูกค้า (Required / จำเป็น) */}
            <div className="space-y-1">
              <Label htmlFor="name">{t("customerNameLabel")}</Label>
              <Input
                id="name"
                name="name"
                defaultValue={customer.name}
                required
              />
            </div>
            {/* Tax ID Field / ฟิลด์เลขประจำตัวผู้เสียภาษี (Optional / ไม่บังคับ) */}
            <div className="space-y-1">
              <Label htmlFor="taxId">{t("taxId")}</Label>
              <Input
                id="taxId"
                name="taxId"
                defaultValue={customer.tax_id ?? ""}
              />
            </div>
          </div>
          {/* Address Field / ฟิลด์ที่อยู่ (Optional / ไม่บังคับ) */}
          <div className="space-y-1">
            <Label htmlFor="address">{t("address")}</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={customer.address ?? ""}
            />
          </div>
          {/* Contact Information Fields / ฟิลด์ข้อมูลติดต่อ */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Phone Field / ฟิลด์เบอร์โทรศัพท์ (Optional / ไม่บังคับ) */}
            <div className="space-y-1">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={customer.phone ?? ""}
              />
            </div>
            {/* Line ID Field / ฟิลด์ไลน์ไอดี (Optional / ไม่บังคับ) */}
            <div className="space-y-1">
              <Label htmlFor="lineId">{t("lineId")}</Label>
              <Input
                id="lineId"
                name="lineId"
                defaultValue={customer.line_id ?? ""}
              />
            </div>
          </div>
          {/* Responsible Person Field / ฟิลด์ผู้ติดต่อ (Optional / ไม่บังคับ) */}
          <div className="space-y-1">
            <Label htmlFor="responsiblePerson">{t("dialogResponsible")}</Label>
            <Input
              id="responsiblePerson"
              name="responsiblePerson"
              defaultValue={customer.responsible_person ?? ""}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {/* Form Action Buttons / ปุ่มควบคุมฟอร์ม */}
          {/* Cancel button resets the state back to view mode */}
          {/* ปุ่มยกเลิกจะเปลี่ยน State กลับไปเป็น false (โหมดดู) */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsEditing(false)}
          >
            {t("buttonCancel")}
          </Button>
          {/* Submit button triggers Server Action */}
          {/* ปุ่มบันทึกจะเรียก Server Action */}
          <Button type="submit">{t("buttonSave")}</Button>
        </CardFooter>
      </Card>
    </form>
  )
}
