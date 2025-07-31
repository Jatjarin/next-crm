"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { addWarehouse } from "./actions"
import { Plus, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Warehouse = {
  id: number
  name: string
  address: string | null
}

interface Props {
  initialWarehouses: Warehouse[]
}

export default function WarehouseClientPage({ initialWarehouses }: Props) {
  const [warehouses, setWarehouses] = useState(initialWarehouses)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    setWarehouses(initialWarehouses)
  }, [initialWarehouses])

  const handleFormSubmit = (formData: FormData) => {
    startTransition(async () => {
      await addWarehouse(formData)
      setIsDialogOpen(false)
    })
  }

  // We will build the detail page later
  const handleRowClick = (warehouseId: number) => {
    router.push(`/warehouses/${warehouseId}`)
    //alert(`Navigating to warehouse ID: ${warehouseId} (page not yet created)`)
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">จัดการคลังสินค้า</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={20} className="mr-2" /> เพิ่มคลังสินค้าใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>เพิ่มคลังสินค้าใหม่</DialogTitle>
              <DialogDescription>
                กรอกข้อมูลเพื่อเพิ่มคลังสินค้าลงในระบบ
              </DialogDescription>
            </DialogHeader>
            <form action={handleFormSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อคลังสินค้า</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="เช่น คลังหลัก, คลังสาขาเชียงใหม่"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">ที่อยู่</Label>
                  <Textarea
                    id="address"
                    name="address"
                    placeholder="ที่อยู่ของคลังสินค้า (ถ้ามี)"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  บันทึก
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการคลังสินค้าทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อคลังสินค้า</TableHead>
                <TableHead>ที่อยู่</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.map((warehouse) => (
                <TableRow
                  key={warehouse.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(warehouse.id)}
                >
                  <TableCell className="font-medium">
                    {warehouse.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {warehouse.address || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
