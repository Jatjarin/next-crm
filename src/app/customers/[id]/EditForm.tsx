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

// กำหนด Type ของข้อมูลลูกค้า
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
  // 1. เพิ่ม State เพื่อจัดการโหมดการแก้ไข
  const [isEditing, setIsEditing] = useState(false)
  const updateCustomerWithId = updateCustomer.bind(null, customer.id)

  // 2. ถ้ายังไม่ได้อยู่ในโหมดแก้ไข ให้แสดงแค่ปุ่ม
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

  // 3. ถ้าอยู่ในโหมดแก้ไข ให้แสดงฟอร์มเต็มรูปแบบ
  return (
    <form action={updateCustomerWithId}>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("dialogTitle")}</CardTitle>
          <CardDescription>{t("dialogDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="name">{t("customerNameLabel")}</Label>
              <Input
                id="name"
                name="name"
                defaultValue={customer.name}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="taxId">{t("taxId")}</Label>
              <Input
                id="taxId"
                name="taxId"
                defaultValue={customer.tax_id ?? ""}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="address">{t("address")}</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={customer.address ?? ""}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={customer.phone ?? ""}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lineId">{t("lineId")}</Label>
              <Input
                id="lineId"
                name="lineId"
                defaultValue={customer.line_id ?? ""}
              />
            </div>
          </div>
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
          {/* ปุ่มยกเลิกจะเปลี่ยน State กลับไปเป็น false */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsEditing(false)}
          >
            {t("buttonCancel")}
          </Button>
          <Button type="submit">{t("buttonSave")}</Button>
        </CardFooter>
      </Card>
    </form>
  )
}
