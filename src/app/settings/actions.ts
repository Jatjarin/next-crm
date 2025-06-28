"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { SupabaseClient } from "@supabase/supabase-js"
import { revalidateTag } from "next/cache"

// ฟังก์ชันสำหรับอัปเดตข้อมูลการตั้งค่า
export async function updateSettings(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return redirect("/login")

  const settingsData = {
    company_name: formData.get("companyName") as string,
    company_address: formData.get("companyAddress") as string,
    logo_url: formData.get("logoUrl") as string,
  }

  // เราจะใช้ `upsert` เพื่ออัปเดตข้อมูลแถวที่มี id = 1 เสมอ
  // (ถ้าไม่มีข้อมูล มันจะสร้างให้ใหม่)
  const { error } = await supabase
    .from("settings")
    .update(settingsData)
    .eq("id", 1)

  if (error) {
    console.error("Error updating settings:", error)
    return { error: "Could not update settings." }
  }

  // ล้าง Cache ของทุกหน้าที่อาจจะใช้ข้อมูลนี้
  revalidatePath("/", "layout") // Revalidate all pages
  return { success: true }
}

// ฟังก์ชันสำหรับอัปโหลดโลโก้
// (นี่เป็นตัวอย่างเบื้องต้น ในระบบจริงอาจจะต้องจัดการเรื่อง permission และ storage ที่ซับซ้อนกว่า)
export async function uploadLogo(
  formData: FormData
): Promise<{ error?: string; filePath?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Authentication required" }

  const file = formData.get("logo") as File
  if (!file || file.size === 0) {
    return { error: "No file selected for upload." }
  }

  const fileExt = file.name.split(".").pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const filePath = `logos/${fileName}`

  const { error } = await supabase.storage
    .from("logos") // ต้องสร้าง Bucket ชื่อ 'logos' ใน Supabase Storage ก่อน
    .upload(filePath, file)

  if (error) {
    console.error("Error uploading logo:", error)
    return { error: "Failed to upload logo." }
  }

  return { filePath }
}
