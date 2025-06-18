"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// ฟังก์ชันสำหรับเพิ่มลูกค้าใหม่
export async function addCustomer(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return redirect("/login")
  }

  const customerData = {
    name: formData.get("name") as string,
    tax_id: formData.get("taxId") as string,
    address: formData.get("address") as string,
    phone: formData.get("phone") as string,
    line_id: formData.get("lineId") as string,
    responsible_person: formData.get("responsiblePerson") as string,
  }

  const { error } = await supabase.from("customers").insert(customerData)

  if (error) {
    console.error("Supabase error adding customer:", error)
    return redirect("/customers?message=Error: Could not add customer.")
  }

  await revalidatePath("/customers")
  redirect("/customers")
}

// ฟังก์ชันสำหรับแก้ไขข้อมูลลูกค้า
export async function updateCustomer(customerId: number, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return redirect("/login?message=Authentication required")
  }

  const customerData = {
    name: formData.get("name") as string,
    tax_id: formData.get("taxId") as string,
    address: formData.get("address") as string,
    phone: formData.get("phone") as string,
    line_id: formData.get("lineId") as string,
    responsible_person: formData.get("responsiblePerson") as string,
  }

  const { error } = await supabase
    .from("customers")
    .update(customerData)
    .eq("id", customerId)

  if (error) {
    console.error("Supabase error updating customer:", error)
    return redirect(
      `/customers/${customerId}?message=Error: Could not update customer.`
    )
  }

  // Revalidate Paths เพื่อล้าง Cache
  await revalidatePath(`/customers`)
  await revalidatePath(`/customers/${customerId}`)

  // --- แก้ไขที่นี่ ---
  // Redirect กลับไปหน้ารายชื่อลูกค้าทั้งหมด
  redirect(`/customers`)
}

// ฟังก์ชันสำหรับลบข้อมูลลูกค้า
export async function deleteCustomer(customerId: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return redirect("/login")
  }

  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", customerId)

  if (error) {
    console.error("Supabase error deleting customer:", error)
    redirect(`/customers?message=Error deleting customer`)
  }

  await revalidatePath("/customers")
  redirect("/customers")
}
