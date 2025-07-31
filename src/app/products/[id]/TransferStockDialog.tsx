"use client"

import { useState, useTransition } from "react"
import { transferStock } from "../actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowRightLeft } from "lucide-react"

type Warehouse = {
  id: number
  name: string
}

interface Props {
  productId: number
  warehouses: Warehouse[]
}

export default function TransferStockDialog({ productId, warehouses }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [fromWarehouseId, setFromWarehouseId] = useState<string>("")
  const [toWarehouseId, setToWarehouseId] = useState<string>("")
  const [quantity, setQuantity] = useState("")
  const [notes, setNotes] = useState("")

  const handleFormSubmit = () => {
    // Basic validation
    if (!fromWarehouseId || !toWarehouseId || !quantity) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }
    if (fromWarehouseId === toWarehouseId) {
      alert("คลังสินค้าต้นทางและปลายทางต้องแตกต่างกัน")
      return
    }
    if (Number(quantity) <= 0) {
      alert("จำนวนต้องมากกว่า 0")
      return
    }

    const formData = new FormData()
    formData.append("productId", String(productId))
    formData.append("fromWarehouseId", fromWarehouseId)
    formData.append("toWarehouseId", toWarehouseId)
    formData.append("quantity", quantity)
    formData.append("notes", notes)

    startTransition(async () => {
      const result = await transferStock(formData)
      if (result.success) {
        alert("ย้ายสินค้าสำเร็จ!")
        setIsOpen(false)
        // Reset form
        setFromWarehouseId("")
        setToWarehouseId("")
        setQuantity("")
        setNotes("")
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.error}`)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          ย้ายสินค้า
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ย้ายสินค้าระหว่างคลัง</DialogTitle>
          <DialogDescription>
            เลือกคลังต้นทาง, ปลายทาง, และจำนวนที่ต้องการย้าย
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fromWarehouse">จากคลังสินค้า</Label>
            <Select required value={fromWarehouseId} onValueChange={setFromWarehouseId}>
              <SelectTrigger id="fromWarehouse">
                <SelectValue placeholder="-- เลือกคลังต้นทาง --" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((wh) => (
                  <SelectItem key={wh.id} value={String(wh.id)}>
                    {wh.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="toWarehouse">ไปยังคลังสินค้า</Label>
            <Select required value={toWarehouseId} onValueChange={setToWarehouseId}>
              <SelectTrigger id="toWarehouse">
                <SelectValue placeholder="-- เลือกคลังปลายทาง --" />
              </SelectTrigger>
              <SelectContent>
                {warehouses
                  .filter((wh) => String(wh.id) !== fromWarehouseId) // Filter out the source warehouse
                  .map((wh) => (
                    <SelectItem key={wh.id} value={String(wh.id)}>
                      {wh.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="quantity">จำนวนที่ย้าย</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              placeholder="จำนวน"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">หมายเหตุ</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="เหตุผลในการย้าย (ถ้ามี)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>ยกเลิก</Button>
          <Button onClick={handleFormSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            ยืนยันการย้าย
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
