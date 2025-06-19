"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { addInvoice } from "../actions"
import { Plus, Trash2 } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Customer = { id: number; name: string }
type InvoiceItem = { description: string; quantity: number; unitPrice: number }

export default function NewInvoicePage() {
  const router = useRouter()
  const supabase = createClient()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ])
  const [selectedCustomerId, setSelectedCustomerId] = useState("")

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data } = await supabase.from("customers").select("id, name")
      if (data) setCustomers(data)
    }
    fetchCustomers()
  }, [supabase])

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...items]
    const numValue = Number(value)
    newItems[index] = {
      ...newItems[index],
      [field]: field === "description" ? value : isNaN(numValue) ? 0 : numValue,
    }
    setItems(newItems)
  }

  const addItem = () =>
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }])
  const removeItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index))

  const subTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )
  const vat = subTotal * 0.07
  const grandTotal = subTotal + vat

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">สร้างใบแจ้งหนี้ใหม่</h1>
      <form action={addInvoice}>
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลใบแจ้งหนี้</CardTitle>
            <CardDescription>
              กรอกข้อมูลลูกค้าและรายละเอียดของใบแจ้งหนี้
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerId">ลูกค้า</Label>
                <Select
                  name="customerId"
                  required
                  value={selectedCustomerId}
                  onValueChange={setSelectedCustomerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-- เลือกลูกค้า --" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">เลขที่ Invoice</Label>
                <Input
                  type="text"
                  id="invoiceNumber"
                  name="invoiceNumber"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issueDate">วันที่ออก</Label>
                <Input
                  type="date"
                  id="issueDate"
                  name="issueDate"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">วันครบกำหนด</Label>
                <Input type="date" id="dueDate" name="dueDate" required />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">
                รายการสินค้า/บริการ
              </h3>
              <input type="hidden" name="items" value={JSON.stringify(items)} />

              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="คำอธิบาย"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                      className="flex-grow"
                    />
                    <Input
                      type="number"
                      placeholder="จำนวน"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      className="w-24"
                    />
                    <Input
                      type="number"
                      placeholder="ราคา/หน่วย"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(index, "unitPrice", e.target.value)
                      }
                      className="w-32"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="mt-2"
              >
                <Plus size={16} className="mr-2" />
                เพิ่มรายการ
              </Button>
            </div>

            <div className="flex justify-end mt-4">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between">
                  <span>ยอดรวม</span>
                  <span>
                    ฿
                    {subTotal.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (7%)</span>
                  <span>
                    ฿{vat.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>ยอดรวมทั้งสิ้น</span>
                  <span>
                    ฿
                    {grandTotal.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <input type="hidden" name="status" value="Draft" />
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              ยกเลิก
            </Button>
            <Button type="submit">บันทึกฉบับร่าง</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
