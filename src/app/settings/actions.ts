"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ฟังก์ชันสำหรับอัปเดตข้อมูลการตั้งค่า
export async function updateSettings(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Authentication required" }

  const settingsData = {
    company_name: formData.get("companyName") as string,
    company_address: formData.get("companyAddress") as string,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("settings")
    .update(settingsData)
    .eq("id", 1)

  if (error) {
    console.error("Error updating settings:", error)
    return { error: "Could not update settings." }
  }

  // ล้าง Cache ของทุกหน้าที่อาจจะใช้ข้อมูลนี้
  revalidatePath("/", "layout")
  return { success: true }
}
