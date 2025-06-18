"use client"

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
  const updateCustomerWithId = updateCustomer.bind(null, customer.id)

  return (
    <form action={updateCustomerWithId}>
      <Card>
        <CardHeader>
          <CardTitle>แก้ไขข้อมูลลูกค้า</CardTitle>
          <CardDescription>
            ปรับปรุงข้อมูลของลูกค้าให้เป็นปัจจุบัน
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="name">ชื่อลูกค้า/บริษัท</Label>
              <Input
                id="name"
                name="name"
                defaultValue={customer.name}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="taxId">เลขประจำตัวผู้เสียภาษี</Label>
              <Input
                id="taxId"
                name="taxId"
                defaultValue={customer.tax_id ?? ""}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="address">ที่อยู่</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={customer.address ?? ""}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="phone">เบอร์โทร</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={customer.phone ?? ""}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lineId">LINE ID</Label>
              <Input
                id="lineId"
                name="lineId"
                defaultValue={customer.line_id ?? ""}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="responsiblePerson">ผู้รับผิดชอบ</Label>
            <Input
              id="responsiblePerson"
              name="responsiblePerson"
              defaultValue={customer.responsible_person ?? ""}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit">บันทึกการเปลี่ยนแปลง</Button>
        </CardFooter>
      </Card>
    </form>
  )
}
