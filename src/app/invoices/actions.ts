"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

type InvoiceItem = {
  description: string
  quantity: number
  unitPrice: number
}

export async function addInvoice(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return redirect("/login")
  }

  const itemsString = formData.get("items") as string
  let items: InvoiceItem[]
  try {
    items = JSON.parse(itemsString)
  } catch (e) {
    console.error("Error parsing items JSON:", e)
    return redirect("/invoices/new?message=Error: Invalid items data.")
  }

  const invoiceData = {
    customer_id: Number(formData.get("customerId")),
    invoice_number: formData.get("invoiceNumber") as string,
    issue_date: formData.get("issueDate") as string,
    due_date: formData.get("dueDate") as string,
    status: formData.get("status") as string,
    items: items,
  }

  const { data, error } = await supabase
    .from("invoices")
    .insert(invoiceData)
    .select()
    .single()

  if (error) {
    console.error("Error adding invoice:", error)
    return redirect("/invoices/new?message=Error: Could not add invoice.")
  }

  await revalidatePath("/invoices")
  await revalidatePath("/dashboard")
  if (invoiceData.customer_id) {
    await revalidatePath(`/customers/${invoiceData.customer_id}`)
  }
  await revalidatePath("/reports")
  redirect(`/invoices/${data.id}`)
}

export async function updateInvoiceStatus(
  invoiceId: number,
  newStatus: string
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { message: "Authentication required" }
  }

  const { data: invoice, error: fetchError } = await supabase
    .from("invoices")
    .select("customer_id")
    .eq("id", invoiceId)
    .single()

  if (fetchError || !invoice) {
    console.error("Error fetching invoice for revalidation:", fetchError)
    return { message: "Error: Invoice not found." }
  }

  const { error } = await supabase
    .from("invoices")
    .update({ status: newStatus })
    .eq("id", invoiceId)

  if (error) {
    console.error("Error updating invoice status:", error)
    return { message: "Error: Could not update status." }
  }

  // Revalidate path ที่เกี่ยวข้องทั้งหมด
  await revalidatePath("/reports")
  await revalidatePath("/invoices")
  await revalidatePath(`/invoices/${invoiceId}`)
  if (invoice.customer_id) {
    await revalidatePath(`/customers/${invoice.customer_id}`)
  }
  await revalidatePath("/dashboard")

  // --- แก้ไขที่นี่: เอา redirect ออก ---
  // และ return ข้อความกลับไปให้ Client จัดการต่อ
  return { message: "Success" }
}
