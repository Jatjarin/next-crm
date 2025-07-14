"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

type QuotationItem = {
  description: string
  quantity: number
  unitPrice: number
}
/// --- แก้ไขฟังก์ชันนี้ทั้งหมด ---
// ฟังก์ชันสำหรับหาเลขที่ใบเสนอราคาล่าสุดของปีปัจจุบันและคำนวณเลขถัดไป
export async function generateNextQuotationNumber() {
  const supabase = await createClient()
  // 1. ใช้ปี ค.ศ. 2 ตัวท้าย (เช่น 25 สำหรับปี 2025)
  const currentYear = new Date().getFullYear().toString().slice(-2)

  // 2. ค้นหาใบเสนอราคาล่าสุดที่ขึ้นต้นด้วย 'No' และปีปัจจุบัน (เช่น 'No25...')
  const { data, error } = await supabase
    .from("quotations")
    .select("quotation_number")
    .like("quotation_number", `No${currentYear}%`)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    // ถ้าไม่เจอ หรือมี Error (อาจจะเพราะเป็นใบแรกของปี) ให้เริ่มนับที่ 1
    return 1
  }

  try {
    // 3. ดึงเฉพาะตัวเลข Running Number 3 หลักออกมา
    // จาก "No25001PW..." -> จะได้ "001"
    const runningNumberStr = data.quotation_number.substring(4, 7)
    const nextNumber = parseInt(runningNumberStr, 10) + 1

    return isNaN(nextNumber) ? 1 : nextNumber
  } catch {
    return 1 // กรณีเกิดข้อผิดพลาดอื่นๆ ให้เริ่มที่ 1
  }
}

// ฟังก์ชันสำหรับเพิ่มใบเสนอราคา (รับ quotationNumber ที่สร้างจาก Client)
export async function addQuotation(
  quotationNumber: string,
  formData: FormData
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return redirect("/login")

  const customerId = formData.get("customerId")
  if (!customerId) {
    return redirect("/quotations/new?message=Error: Please select a customer.")
  }
  const itemsString = formData.get("items") as string
  let items: QuotationItem[]
  try {
    items = JSON.parse(itemsString)
  } catch (e) {
    console.error("Error parsing items data:", e)
    return redirect("/quotations/new?message=Error: Invalid items data.")
  }

  const quotationData = {
    customer_id: Number(customerId),
    responsible_person_id: Number(formData.get("responsiblePersonId")),
    price_tier: formData.get("priceTier") as string,
    quotation_number: quotationNumber, // ใช้เลขที่สร้างจาก Client
    issue_date: formData.get("issueDate") as string,
    expiry_date: formData.get("expiryDate") as string,
    status: "Draft",
    items: items,
  }

  const { data, error } = await supabase
    .from("quotations")
    .insert(quotationData)
    .select()
    .single()

  if (error) {
    console.error("Error adding quotation:", error)
    return redirect("/quotations/new?message=Error: Could not add quotation.")
  }

  await revalidatePath("/quotations")
  redirect(`/quotations/${data.id}`)
}

// --- เพิ่มฟังก์ชันนี้ ---
// ฟังก์ชันสำหรับ "แก้ไข" เนื้อหาใบเสนอราคา
export async function updateQuotation(quotationId: number, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return redirect("/login")

  const itemsString = formData.get("items") as string
  let items: QuotationItem[]
  try {
    items = JSON.parse(itemsString)
  } catch (e) {
    console.error("Error parsing items data:", e)
    return redirect(
      `/quotations/${quotationId}/edit?message=Error: Invalid items data.`
    )
  }

  const quotationData = {
    customer_id: Number(formData.get("customerId")),
    responsible_person_id: Number(formData.get("responsiblePersonId")),
    quotation_number: formData.get("quotationNumber") as string,
    issue_date: formData.get("issueDate") as string,
    expiry_date: formData.get("expiryDate") as string,
    items: items,
  }

  const { error } = await supabase
    .from("quotations")
    .update(quotationData)
    .eq("id", quotationId)

  if (error) {
    console.error("Error updating quotation:", error)
    return redirect(
      `/quotations/${quotationId}/edit?message=Error: Could not update quotation.`
    )
  }

  await revalidatePath("/quotations")
  await revalidatePath(`/quotations/${quotationId}`)

  redirect(`/quotations/${quotationId}`)
}

// --- เพิ่มฟังก์ชันนี้ ---
// ฟังก์ชันสำหรับ "ลบ" ใบเสนอราคา
export async function deleteQuotation(quotationId: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return redirect("/login")

  const { error } = await supabase
    .from("quotations")
    .delete()
    .eq("id", quotationId)

  if (error) {
    console.error("Error deleting quotation:", error)
    return redirect(`/quotations?message=Error: Could not delete quotation.`)
  }

  await revalidatePath("/quotations")
  redirect("/quotations")
}

// ฟังก์ชันสำหรับอัปเดตสถานะ (เช่น เปลี่ยนเป็น 'Sent', 'Accepted')
export async function updateQuotationStatus(
  quotationId: number,
  newStatus: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { message: "Authentication required" }

  const { error } = await supabase
    .from("quotations")
    .update({ status: newStatus })
    .eq("id", quotationId)
  if (error) return { message: "Error updating status." }

  await revalidatePath("/quotations")
  await revalidatePath(`/quotations/${quotationId}`)
  return { message: "Success" }
}
