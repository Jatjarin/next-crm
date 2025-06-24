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
  if (!user) return redirect("/login")

  const customerId = formData.get("customerId")
  if (!customerId) {
    return redirect("/invoices/new?message=Error: Please select a customer.")
  }

  const itemsString = formData.get("items") as string
  let items: InvoiceItem[]
  try {
    items = JSON.parse(itemsString)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return redirect("/invoices/new?message=Error: Invalid items data.")
  }

  const invoiceData = {
    customer_id: Number(customerId),
    // --- เพิ่มข้อมูลผู้รับผิดชอบ ---
    responsible_person_id: Number(formData.get("responsiblePersonId")),
    invoice_number: formData.get("invoiceNumber") as string,
    issue_date: formData.get("issueDate") as string,
    due_date: formData.get("dueDate") as string,
    status: "Draft",
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
  await revalidatePath(`/customers/${invoiceData.customer_id}`)

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
  if (!user) return { message: "Authentication required" }

  const { data: invoice } = await supabase
    .from("invoices")
    .select("customer_id")
    .eq("id", invoiceId)
    .single()

  const { error } = await supabase
    .from("invoices")
    .update({ status: newStatus })
    .eq("id", invoiceId)
  if (error) return { message: "Error updating status." }

  await Promise.all([
    revalidatePath("/reports"),
    revalidatePath("/invoices"),
    revalidatePath(`/invoices/${invoiceId}`),
    revalidatePath("/dashboard"),
    invoice?.customer_id
      ? revalidatePath(`/customers/${invoice.customer_id}`)
      : Promise.resolve(),
  ])

  return { message: "Success" }
}

// --- เพิ่มฟังก์ชันนี้ ---
// ฟังก์ชันสำหรับ "แก้ไข" เนื้อหาใบแจ้งหนี้
export async function updateInvoice(invoiceId: number, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return redirect("/login")

  const itemsString = formData.get("items") as string
  let items: InvoiceItem[]
  try {
    items = JSON.parse(itemsString)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return redirect(
      `/invoices/${invoiceId}/edit?message=Error: Invalid items data.`
    )
  }

  const invoiceData = {
    customer_id: Number(formData.get("customerId")),
    // --- เพิ่มข้อมูลผู้รับผิดชอบ ---
    responsible_person_id: Number(formData.get("responsiblePersonId")),
    invoice_number: formData.get("invoiceNumber") as string,
    issue_date: formData.get("issueDate") as string,
    due_date: formData.get("dueDate") as string,
    items: items,
  }

  const { error } = await supabase
    .from("invoices")
    .update(invoiceData)
    .eq("id", invoiceId)

  if (error) {
    console.error("Error updating invoice:", error)
    return redirect(
      `/invoices/${invoiceId}/edit?message=Error: Could not update invoice.`
    )
  }

  await revalidatePath("/invoices")
  await revalidatePath(`/invoices/${invoiceId}`)
  await revalidatePath(`/customers/${invoiceData.customer_id}`)
  await revalidatePath("/dashboard")

  redirect(`/invoices/${invoiceId}`)
}

// --- เพิ่มฟังก์ชันนี้ ---
// ฟังก์ชันสำหรับ "ลบ" ใบแจ้งหนี้
export async function deleteInvoice(invoiceId: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return redirect("/login")

  const { error } = await supabase.from("invoices").delete().eq("id", invoiceId)

  if (error) {
    console.error("Error deleting invoice:", error)
    return redirect(`/invoices?message=Error: Could not delete invoice.`)
  }

  await revalidatePath("/invoices")
  await revalidatePath("/dashboard")

  redirect("/invoices")
}
