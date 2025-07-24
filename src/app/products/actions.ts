"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// ฟังก์ชันสำหรับเพิ่มสินค้าใหม่
export async function addProduct(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return redirect("/login")

  const productData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    price: Number(formData.get("price")),
    // --- เพิ่มข้อมูลสต็อก ---
    stock_quantity: Number(formData.get("stock_quantity")),
  }

  const { error } = await supabase.from("products").insert(productData)

  if (error) {
    console.error("Supabase error adding product:", error)
    return redirect("/products?message=Error: Could not add product.")
  }

  await revalidatePath("/products")
  redirect("/products")
}

// --- เพิ่มฟังก์ชันนี้ ---
// ฟังก์ชันสำหรับแก้ไขข้อมูลสินค้า
export async function updateProduct(productId: number, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return redirect("/login")
  }

  const productData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    price: Number(formData.get("price")),
    // --- เพิ่มข้อมูลสต็อก ---
    stock_quantity: Number(formData.get("stock_quantity")),
  }

  const { error } = await supabase
    .from("products")
    .update(productData)
    .eq("id", productId)

  if (error) {
    console.error("Supabase error updating product:", error)
    return redirect(`/products/${productId}?message=Error updating product`)
  }

  await revalidatePath(`/products`)
  await revalidatePath(`/products/${productId}`)
  redirect(`/products`)
}

// --- เพิ่มฟังก์ชันนี้ ---
// ฟังก์ชันสำหรับลบข้อมูลสินค้า
export async function deleteProduct(productId: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return redirect("/login")
  }

  const { error } = await supabase.from("products").delete().eq("id", productId)

  if (error) {
    console.error("Supabase error deleting product:", error)
    return redirect(`/products?message=Error deleting product`)
  }

  await revalidatePath("/products")
  redirect("/products")
}
