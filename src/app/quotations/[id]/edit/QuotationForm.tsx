"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updateQuotation } from "../../actions"
import { Plus, Trash2, Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

// Type Definitions
type Customer = { id: number; name: string }
type Product = { id: number; name: string; price: number }
type ResponsiblePerson = { id: number; name: string }
type QuotationItem = {
  description: string
  quantity: number
  unitPrice: number
}
type Quotation = {
  id: number
  customer_id: number
  responsible_person_id: number | null
  quotation_number: string
  issue_date: string
  expiry_date: string
  items: QuotationItem[]
}

interface Props {
  customers: Customer[]
  responsiblePersons: ResponsiblePerson[]
  quotation: Quotation
}

export default function QuotationForm({
  customers,
  responsiblePersons,
  quotation,
}: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [items, setItems] = useState<QuotationItem[]>(
    quotation.items || [{ description: "", quantity: 1, unitPrice: 0 }]
  )
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    String(quotation.customer_id)
  )
  const [selectedResponsiblePersonId, setSelectedResponsiblePersonId] =
    useState<string>(String(quotation.responsible_person_id || ""))

  const [openCustomerCombobox, setOpenCustomerCombobox] = useState(false)
  const [openResponsiblePersonCombobox, setOpenResponsiblePersonCombobox] =
    useState(false)
  const [isPending, startTransition] = React.useTransition()

  const updateQuotationWithId = updateQuotation.bind(null, quotation.id)

  useEffect(() => {
    const fetchProducts = async () => {
      const { data: productData } = await supabase
        .from("products")
        .select("id, name, price")
        .order("name")
      if (productData) setProducts(productData)
    }
    fetchProducts()
  }, [supabase])

  const handleItemChange = (
    index: number,
    field: keyof QuotationItem,
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
  const handleProductSelect = (index: number, product: Product) => {
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      description: product.name,
      unitPrice: product.price,
    }
    setItems(newItems)
  }

  const grandTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )
  const subTotal = grandTotal / 1.07
  const vat = grandTotal - subTotal

  return (
    <form
      action={(formData) =>
        startTransition(() => updateQuotationWithId(formData))
      }
    >
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <input type="hidden" name="customerId" value={selectedCustomerId} />
      <input
        type="hidden"
        name="responsiblePersonId"
        value={selectedResponsiblePersonId}
      />

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลใบเสนอราคา</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ลูกค้า</Label>
              <Popover
                open={openCustomerCombobox}
                onOpenChange={setOpenCustomerCombobox}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {selectedCustomerId
                      ? customers.find(
                          (c) => String(c.id) === selectedCustomerId
                        )?.name
                      : "-- เลือกลูกค้า --"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="ค้นหาลูกค้า..." />
                    <CommandList>
                      <CommandEmpty>ไม่พบลูกค้า</CommandEmpty>
                      <CommandGroup>
                        {customers.map((c) => (
                          <CommandItem
                            key={c.id}
                            value={c.name}
                            onSelect={() => {
                              setSelectedCustomerId(String(c.id))
                              setOpenCustomerCombobox(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCustomerId === String(c.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {c.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>ผู้รับผิดชอบ</Label>
              <Popover
                open={openResponsiblePersonCombobox}
                onOpenChange={setOpenResponsiblePersonCombobox}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {selectedResponsiblePersonId
                      ? responsiblePersons.find(
                          (p) => String(p.id) === selectedResponsiblePersonId
                        )?.name
                      : "-- เลือกผู้รับผิดชอบ --"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="ค้นหาผู้รับผิดชอบ..." />
                    <CommandList>
                      <CommandEmpty>ไม่พบข้อมูล</CommandEmpty>
                      <CommandGroup>
                        {responsiblePersons.map((p) => (
                          <CommandItem
                            key={p.id}
                            value={p.name}
                            onSelect={() => {
                              setSelectedResponsiblePersonId(String(p.id))
                              setOpenResponsiblePersonCombobox(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedResponsiblePersonId === String(p.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {p.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quotationNumber">เลขที่ใบเสนอราคา</Label>
              <Input
                id="quotationNumber"
                name="quotationNumber"
                required
                defaultValue={quotation.quotation_number}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueDate">วันที่ออก</Label>
              <Input
                id="issueDate"
                name="issueDate"
                type="date"
                required
                defaultValue={quotation.issue_date}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">วันที่หมดอายุ</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                type="date"
                required
                defaultValue={quotation.expiry_date}
              />
            </div>
          </div>
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">รายการ</h3>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row items-center gap-2"
                >
                  <div className="w-full md:w-1/3">
                    <Select
                      onValueChange={(productId) => {
                        const selectedProduct = products.find(
                          (p) => p.id === Number(productId)
                        )
                        if (selectedProduct)
                          handleProductSelect(index, selectedProduct)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="-- เลือกสินค้า --" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="text"
                    placeholder="หรือพิมพ์คำอธิบายเอง"
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
                    className="w-full md:w-24"
                  />
                  <Input
                    type="number"
                    placeholder="ราคา/หน่วย (รวม VAT)"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleItemChange(index, "unitPrice", e.target.value)
                    }
                    className="w-full md:w-32"
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
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between">
                <span>ยอดรวมก่อนภาษี</span>
                <span>
                  ฿
                  {subTotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ภาษีมูลค่าเพิ่ม (7%)</span>
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
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            บันทึกการเปลี่ยนแปลง
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
