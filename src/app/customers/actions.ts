"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import ExcelJS from "exceljs" // Import exceljs library (secure alternative to xlsx)

/**
 * ฟังก์ชันสำหรับเพิ่มลูกค้าใหม่เข้าระบบ
 * Function to add a new customer to the system
 *
 * @param {FormData} formData - ข้อมูลฟอร์มที่ส่งมาจาก client ประกอบด้วย:
 *                              Form data from client containing:
 *   - name: ชื่อลูกค้า (Customer name)
 *   - taxId: เลขผู้เสียภาษี (Tax ID number)
 *   - address: ที่อยู่ (Address)
 *   - phone: เบอร์โทรศัพท์ (Phone number)
 *   - lineId: LINE ID
 *   - responsiblePerson: ชื่อผู้รับผิดชอบ (Responsible person name)
 *
 * @returns {Promise<void>} redirect ไปยังหน้ารายชื่อลูกค้า หรือ หน้า login หากไม่มีการ authenticate
 *                          Redirects to customers list page or login page if not authenticated
 *
 * ขั้นตอนการทำงาน (Process):
 * 1. ตรวจสอบ authentication ของผู้ใช้
 * 2. รวบรวมข้อมูลจาก FormData
 * 3. บันทึกข้อมูลลูกค้าใหม่ลงฐานข้อมูล
 * 4. จัดการ error หากเกิดปัญหา
 * 5. ล้าง cache และ redirect ไปหน้ารายชื่อลูกค้า
 */
export async function addCustomer(formData: FormData) {
  // สร้าง Supabase client สำหรับติดต่อกับฐานข้อมูล
  // Create Supabase client for database communication
  const supabase = await createClient()

  // ตรวจสอบ authentication - ดึงข้อมูลผู้ใช้ที่ login อยู่
  // Check authentication - get current logged in user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    // ถ้าไม่มีผู้ใช้ login อยู่ ให้ redirect ไปหน้า login
    // If no user is logged in, redirect to login page
    return redirect("/login")
  }

  // รวบรวมข้อมูลลูกค้าจาก FormData
  // Collect customer data from FormData
  const customerData = {
    name: formData.get("name") as string,
    tax_id: formData.get("taxId") as string,
    address: formData.get("address") as string,
    phone: formData.get("phone") as string,
    line_id: formData.get("lineId") as string,
    responsible_person: formData.get("responsiblePerson") as string,
  }

  // บันทึกข้อมูลลูกค้าใหม่ลงตาราง customers ในฐานข้อมูล
  // Insert new customer data into customers table
  const { error } = await supabase.from("customers").insert(customerData)

  // จัดการ error กรณีบันทึกไม่สำเร็จ
  // Handle error if insert fails
  if (error) {
    console.error("Supabase error adding customer:", error)
    return redirect("/customers?message=Error: Could not add customer.")
  }

  // ล้าง cache ของหน้า /customers เพื่อให้แสดงข้อมูลล่าสุด
  // Revalidate /customers page cache to show latest data
  await revalidatePath("/customers")

  // Redirect กลับไปหน้ารายชื่อลูกค้า
  // Redirect back to customers list page
  redirect("/customers")
}

/**
 * ฟังก์ชันสำหรับแก้ไขข้อมูลลูกค้าที่มีอยู่แล้ว
 * Function to update existing customer information
 *
 * @param {number} customerId - รหัสลูกค้าที่ต้องการแก้ไข (Customer ID to update)
 * @param {FormData} formData - ข้อมูลใหม่ที่ต้องการอัปเดต (New data to update)
 *
 * @returns {Promise<void>} redirect ไปยังหน้ารายชื่อลูกค้า หรือ หน้า login
 *                          Redirects to customers list page or login page
 *
 * ขั้นตอนการทำงาน (Process):
 * 1. ตรวจสอบ authentication
 * 2. รวบรวมข้อมูลที่แก้ไขจาก FormData
 * 3. อัปเดตข้อมูลในฐานข้อมูล
 * 4. ล้าง cache ที่เกี่ยวข้อง
 * 5. Redirect กลับไปหน้ารายชื่อลูกค้า
 */
export async function updateCustomer(customerId: number, formData: FormData) {
  const supabase = await createClient()

  // ตรวจสอบ authentication
  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return redirect("/login?message=Authentication required")
  }

  // รวบรวมข้อมูลที่แก้ไขจาก FormData
  // Collect updated data from FormData
  const customerData = {
    name: formData.get("name") as string,
    tax_id: formData.get("taxId") as string,
    address: formData.get("address") as string,
    phone: formData.get("phone") as string,
    line_id: formData.get("lineId") as string,
    responsible_person: formData.get("responsiblePerson") as string,
  }

  // อัปเดตข้อมูลลูกค้าในฐานข้อมูล โดยใช้ customerId เป็นเงื่อนไข
  // Update customer data in database where id matches customerId
  const { error } = await supabase
    .from("customers")
    .update(customerData)
    .eq("id", customerId)

  // จัดการ error หากอัปเดตไม่สำเร็จ
  // Handle error if update fails
  if (error) {
    console.error("Supabase error updating customer:", error)
    return redirect(
      `/customers/${customerId}?message=Error: Could not update customer.`
    )
  }

  // ล้าง Cache ของหน้าที่เกี่ยวข้องเพื่อให้แสดงข้อมูลล่าสุด
  // Revalidate cache for related pages to show latest data
  await revalidatePath(`/customers`)
  await revalidatePath(`/customers/${customerId}`)

  // Redirect กลับไปหน้ารายชื่อลูกค้าทั้งหมด
  // Redirect back to customers list page
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
interface CustomerData {
  name: string
  tax_id: string
  address: string
  phone: string
  line_id: string
  responsible_person: string
}
// 2. Add the new import function
export async function importCustomers(fileBase64: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Authentication required" }

  try {
    // Decode the base64 string to a buffer
    const buffer = Buffer.from(fileBase64, "base64")

    // Read the workbook from the buffer using ExcelJS (secure)
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    const worksheet = workbook.worksheets[0]
    if (!worksheet) {
      return { error: "File is empty or has no worksheets." }
    }

    // Convert sheet to JSON. Assumes first row is headers.
    // Headers should be: name, tax_id, phone, line_id, address
    const data: CustomerData[] = []
    const headers: string[] = []

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        // First row contains headers
        row.eachCell((cell) => {
          headers.push(String(cell.value).toLowerCase().trim())
        })
      } else {
        // Data rows
        const rowData: any = {}
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1]
          rowData[header] = cell.value
        })
        data.push(rowData as CustomerData)
      }
    })

    if (data.length === 0) {
      return { error: "File is empty or has incorrect format." }
    }

    // Map JSON data to the format expected by Supabase
    const customersToInsert = data.map((row) => ({
      name: row.name,
      tax_id: row.tax_id || null,
      phone: row.phone ? String(row.phone) : null,
      line_id: row.line_id || null,
      address: row.address || null,
      // You might want to set a default responsible person or leave it null
      // responsible_person_id: 1
    }))

    // Insert data into the database
    const { error, count } = await supabase
      .from("customers")
      .insert(customersToInsert)
    //.select("*", { count: "exact" })

    if (error) {
      console.error("Error inserting customers:", error)
      return { error: "Failed to import customers to the database." }
    }

    revalidatePath("/customers")
    return { success: true, count: count ?? 0 }
  } catch (e) {
    console.error("Error processing file:", e)
    return { error: "Invalid file format or data." }
  }
}
