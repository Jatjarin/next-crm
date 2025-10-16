"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { updateProduct } from "../actions"
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
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Loader2 } from "lucide-react"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox" // Import Checkbox
//import { cn } from "@/lib/utils"

/**
 * EditForm Component - Product Edit Form / คอมโพเนนต์ฟอร์มแก้ไขสินค้า
 *
 * Form Purpose / วัตถุประสงค์ของฟอร์ม:
 * - Edit product information / แก้ไขข้อมูลสินค้า
 * - Configure E-commerce settings / ตั้งค่าการขายออนไลน์
 * - Manage product dimensions and pricing / จัดการขนาดและราคาสินค้า
 * - Toggle between view and edit mode / สลับระหว่างโหมดดูและแก้ไข
 *
 * Form Fields / ฟิลด์ของฟอร์ม:
 * - name: ชื่อสินค้า (required / จำเป็น)
 * - description: รายละเอียดสินค้า (optional / ไม่บังคับ)
 * - thickness: ความหนา (optional / ไม่บังคับ)
 * - width: ความกว้าง (optional / ไม่บังคับ)
 * - length: ความยาว (optional / ไม่บังคับ)
 * - price: ราคา (required / จำเป็น)
 * - low_stock_threshold: จุดแจ้งเตือนสต็อกต่ำ (required / จำเป็น)
 * - is_ecommerce_product: สำหรับขาย E-commerce (checkbox / เช็คบ็อกซ์)
 * - ecommerce_sizes: ขนาดสำหรับขายออนไลน์ (array of numbers / อาร์เรย์ตัวเลข)
 *
 * Validation / การตรวจสอบความถูกต้อง:
 * - name: Required field / ฟิลด์จำเป็น
 * - price: Required, must be positive number / จำเป็น ต้องเป็นตัวเลขบวก
 * - low_stock_threshold: Required field / ฟิลด์จำเป็น
 * - ecommerce_sizes: Required when is_ecommerce_product is true / จำเป็นเมื่อเลือกขาย E-commerce
 *
 * State Management / การจัดการ State:
 * - isEditing: สถานะการแก้ไข (true = แสดงฟอร์ม, false = แสดงปุ่มแก้ไข)
 * - isPending: สถานะกำลังส่งข้อมูล (shows loading spinner / แสดงสัญลักษณ์กำลังโหลด)
 * - isEcommerce: สถานะการขาย E-commerce (controls visibility of size selector / ควบคุมการแสดงตัวเลือกขนาด)
 * - selectedSizes: ขนาดที่เลือกสำหรับ E-commerce (array of selected sizes / อาร์เรย์ขนาดที่เลือก)
 *
 * Submit Logic / ตรรกะการส่งฟอร์ม:
 * - Appends E-commerce data to FormData / เพิ่มข้อมูล E-commerce เข้าไปใน FormData
 * - Uses useTransition for pending state / ใช้ useTransition เพื่อจัดการสถานะ pending
 * - Calls updateProduct Server Action / เรียก Server Action updateProduct
 * - Closes edit mode on success / ปิดโหมดแก้ไขเมื่อสำเร็จ
 */

// Product type definition / กำหนดประเภทข้อมูลสินค้า
type Product = {
  id: number
  name: string
  description: string | null
  price: number
  stock_quantity: number // เพิ่ม field สต็อก
  low_stock_threshold: number // Add new field to type
  width: number | null
  length: number | null
  thickness: number | null
  barcode: string | null // เพิ่ม barcode field
  // New fields for linear stock
  is_master_product: boolean
  //stock_unit: string
  // เพิ่ม field ใหม่สำหรับ E-commerce
  is_ecommerce_product: boolean
  ecommerce_sizes: number[] | null
}

interface Props {
  product: Product
}

// Available sizes for E-commerce products (in cm) / ขนาดมาตรฐานที่จะมีให้เลือกสำหรับขายบน E-commerce
// กำหนดขนาดมาตรฐานที่จะมีให้เลือกสำหรับขายบน E-commerce
const AVAILABLE_SIZES = [
  30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190,
  200,
]

export default function EditForm({ product }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const updateProductWithId = updateProduct.bind(null, product.id)
  const t = useTranslations("ProductEditForm")

  // E-commerce State Management / การจัดการ State สำหรับ E-commerce
  // --- State ใหม่สำหรับจัดการข้อมูล E-commerce ---
  // State สำหรับเก็บสถานะของ Checkbox "สำหรับขาย E-commerce"
  // Controls whether the product is available for E-commerce sales
  // ควบคุมว่าสินค้านี้จะขายบน E-commerce หรือไม่
  const [isEcommerce, setIsEcommerce] = useState(product.is_ecommerce_product)

  // State สำหรับเก็บขนาดที่ถูกเลือก (เป็น Array ของตัวเลข)
  // Stores the selected sizes for E-commerce sales (array of numbers)
  // เก็บขนาดที่เลือกสำหรับการขายออนไลน์ (อาร์เรย์ของตัวเลข)
  const [selectedSizes, setSelectedSizes] = useState<number[]>(
    product.ecommerce_sizes || []
  )

  // Size Selection Handler / ฟังก์ชันจัดการการเลือกขนาด
  // ฟังก์ชันสำหรับจัดการการเลือก/ยกเลิกขนาด
  // Toggles size selection (add if not selected, remove if already selected)
  // สลับการเลือกขนาด (เพิ่มถ้ายังไม่เลือก, ลบถ้าเลือกอยู่แล้ว)
  const handleSizeChange = (size: number) => {
    setSelectedSizes((prev) =>
      // ถ้าขนาดนั้นถูกเลือกอยู่แล้ว ให้เอาออก, ถ้ายังไม่ถูกเลือก ให้เพิ่มเข้าไป
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  // Form Submit Handler / ฟังก์ชันจัดการการส่งฟอร์ม
  // ฟังก์ชันที่ทำงานเมื่อกดปุ่ม "บันทึก"
  // Handles form submission by appending E-commerce data to FormData
  // จัดการการส่งฟอร์มโดยเพิ่มข้อมูล E-commerce เข้าไปใน FormData
  const handleFormSubmit = (formData: FormData) => {
    // เพิ่มข้อมูลจาก State ของ E-commerce เข้าไปใน FormData ก่อนส่งไปให้ Server Action
    // Append E-commerce state to FormData before sending to Server Action
    // เพิ่มสถานะ E-commerce เข้าไปใน FormData ก่อนส่งไปยัง Server Action
    formData.append("is_ecommerce_product", String(isEcommerce))
    formData.append("ecommerce_sizes", JSON.stringify(selectedSizes))

    startTransition(async () => {
      await updateProductWithId(formData)
      setIsEditing(false) // ปิดโหมดแก้ไขเมื่อบันทึกสำเร็จ
    })
  }

  // const handleFormSubmit = (formData: FormData) => {
  //   // Append state values to formData before submitting
  //   formData.append("is_master_product", String(isMaster))
  //   formData.append("stock_unit", isMaster ? stockUnit : "pcs") // Child is always pcs
  //   formData.append("parent_product_id", isMaster ? "" : parentId) // Only child has parent

  //   startTransition(async () => {
  //     await updateProductWithId(formData)
  //     setIsEditing(false) // Exit editing mode on success
  //   })
  // }

  // View Mode Render / การแสดงผลในโหมดดู
  // ถ้าไม่ได้อยู่ในโหมดแก้ไข ให้แสดงแค่ปุ่ม
  // If not in edit mode, show only the edit button
  // ถ้าไม่อยู่ในโหมดแก้ไข จะแสดงเฉพาะปุ่มแก้ไข
  if (!isEditing) {
    return (
      <div className="mt-6">
        <Button onClick={() => setIsEditing(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          {t("editFormButton")}
        </Button>
      </div>
    )
  }

  // Edit Mode Render / การแสดงผลในโหมดแก้ไข
  // ถ้าอยู่ในโหมดแก้ไข ให้แสดงฟอร์มทั้งหมด
  // When in edit mode, render the full form with all fields
  // เมื่ออยู่ในโหมดแก้ไข แสดงฟอร์มเต็มรูปแบบพร้อมฟิลด์ทั้งหมด
  return (
    <form action={handleFormSubmit}>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("editFormTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* --- ส่วนข้อมูลสินค้ามาตรฐาน (เหมือนเดิม) --- */}
          {/* Standard Product Information Section / ส่วนข้อมูลสินค้าพื้นฐาน */}
          {/* Product Name Field / ฟิลด์ชื่อสินค้า (Required / จำเป็น) */}
          <div className="space-y-1">
            <Label htmlFor="name">{t("editFormName")}</Label>
            <Input id="name" name="name" defaultValue={product.name} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">{t("editFormDescription")}</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product.description ?? ""}
            />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="thickness">{t("editFormThickness")}</Label>
              <Input
                id="thickness"
                name="thickness"
                type="number"
                step="0.01"
                defaultValue={product.thickness ?? 0}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="width">{t("editFormWidth")}</Label>
              <Input
                id="width"
                name="width"
                type="number"
                step="0.01"
                defaultValue={product.width ?? 0}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="length">{t("editFormLength")}</Label>
              <Input
                id="length"
                name="length"
                type="number"
                step="0.01"
                defaultValue={product.length ?? 0}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="price">{t("editFormPrice")}</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                defaultValue={product.price}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="low_stock_threshold">
                {t("editFormLowStockThreshold")}
              </Label>
              <Input
                id="low_stock_threshold"
                name="low_stock_threshold"
                type="number"
                defaultValue={product.low_stock_threshold}
                required
              />
            </div>
          </div>

          {/* --- ส่วนตั้งค่า E-commerce ที่เพิ่มเข้ามาใหม่ --- */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-md font-semibold">E-commerce Settings</h3>
            {/* Checkbox สำหรับเปิด/ปิดการขายบน E-commerce */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_ecommerce_product"
                checked={isEcommerce}
                onCheckedChange={(checked) => setIsEcommerce(Boolean(checked))}
              />
              <Label htmlFor="is_ecommerce_product">
                สำหรับขาย E-commerce (ตัดแบ่งขาย)
              </Label>
            </div>

            {/* ส่วนนี้จะแสดงก็ต่อเมื่อ Checkbox ด้านบนถูกติ๊ก */}
            {isEcommerce && (
              <div className="space-y-2">
                <Label>ขนาดที่วางขายบน E-commerce (cm)</Label>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-4 p-4 border rounded-md">
                  {/* วนลูปสร้าง Checkbox ของแต่ละขนาด */}
                  {AVAILABLE_SIZES.map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox
                        id={`size-${size}`}
                        checked={selectedSizes.includes(size)}
                        onCheckedChange={() => handleSizeChange(size)}
                      />
                      <Label htmlFor={`size-${size}`}>{size} cm</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsEditing(false)}
          >
            {t("editFormCancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("editFormSaveButton")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
