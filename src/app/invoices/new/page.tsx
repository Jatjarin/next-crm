"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { addInvoice } from "../actions"
import { Plus, Trash2, Check, ChevronsUpDown } from "lucide-react"

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

import { cn } from "@/lib/utils"

type Product = { id: number; name: string; price: number }
type Customer = { id: number; name: string }
type InvoiceItem = { description: string; quantity: number; unitPrice: number }

export default function NewInvoicePage() {
  const router = useRouter()
  const supabase = createClient()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([]) // State สำหรับเก็บรายการสินค้า
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ])
  const [selectedCustomerId, setSelectedCustomerId] = useState("")

  // State สำหรับ Combobox
  const [openCustomerCombobox, setOpenCustomerCombobox] = useState(false)
  const [openProductComboboxes, setOpenProductComboboxes] = useState<{
    [key: number]: boolean
  }>({})

  useEffect(() => {
    // 2. ดึงข้อมูลทั้งลูกค้าและสินค้าพร้อมกัน
    const fetchData = async () => {
      const { data: customerData } = await supabase
        .from("customers")
        .select("id, name")
      if (customerData) setCustomers(customerData)

      const { data: productData } = await supabase
        .from("products")
        .select("id, name, price")
      if (productData) setProducts(productData)
    }
    fetchData()
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

  // 3. ฟังก์ชันใหม่สำหรับจัดการเมื่อมีการเลือกสินค้า
  const handleProductSelect = (index: number, productId: string) => {
    const selectedProduct = products.find((p) => p.id === Number(productId))
    if (selectedProduct) {
      const newItems = [...items]
      newItems[index] = {
        ...newItems[index],
        description: selectedProduct.name,
        unitPrice: selectedProduct.price,
      }
      setItems(newItems)
    }
  }

  const addItem = () =>
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }])
  const removeItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index))

  // Logic การคำนวณราคา (ราคาที่ใส่คือราคารวม VAT แล้ว)
  const grandTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )
  const subTotal = grandTotal / 1.07
  const vat = grandTotal - subTotal

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">สร้างใบแจ้งหนี้ใหม่</h1>
      <form action={addInvoice}>
        {/* Input ที่ซ่อนไว้เพื่อส่ง ID ของลูกค้าไปกับฟอร์ม */}
        <input type="hidden" name="customerId" value={selectedCustomerId} />
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
                {/* --- เปลี่ยนมาใช้ Combobox ที่นี่ --- */}
                <Popover
                  open={openCustomerCombobox}
                  onOpenChange={setOpenCustomerCombobox}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCustomerCombobox}
                      className="w-full justify-between"
                    >
                      {selectedCustomerId
                        ? customers.find(
                            (customer) =>
                              String(customer.id) === selectedCustomerId
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
                          {customers.map((customer) => (
                            <CommandItem
                              key={customer.id}
                              value={customer.name}
                              onSelect={() => {
                                setSelectedCustomerId(String(customer.id))
                                setOpenCustomerCombobox(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCustomerId === String(customer.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {customer.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              {/* ... Input fields อื่นๆ ... */}
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
                  <div
                    key={index}
                    className="flex flex-col md:flex-row items-center gap-2"
                  >
                    {/* --- 4. เพิ่มเมนูเลือกสินค้าที่นี่ --- */}
                    <Popover
                      open={openProductComboboxes[index] || false}
                      onOpenChange={(open) =>
                        setOpenProductComboboxes((prev) => ({
                          ...prev,
                          [index]: open,
                        }))
                      }
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full md:w-1/3 justify-between"
                        >
                          {item.description || "-- เลือกสินค้า --"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="ค้นหาสินค้า..." />
                          <CommandList>
                            <CommandEmpty>ไม่พบสินค้า</CommandEmpty>
                            <CommandGroup>
                              {products.map((product) => (
                                <CommandItem
                                  key={product.id}
                                  value={product.name}
                                  onSelect={() =>
                                    handleProductSelect(
                                      index,
                                      String(product.id)
                                    )
                                  }
                                >
                                  {product.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {/* Input นี้สำหรับแก้ไขคำอธิบายได้เอง */}
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
                      placeholder="ราคา/หน่วย"
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
              <div className="w-full max-w-xs space-y-2">
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
