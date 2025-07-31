"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Action to add a new warehouse
export async function addWarehouse(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return redirect("/login")

  const warehouseData = {
    name: formData.get("name") as string,
    address: formData.get("address") as string,
  }

  const { error } = await supabase.from("warehouses").insert(warehouseData)

  if (error) {
    console.error("Error adding warehouse:", error)
    // Redirect with an error message if something goes wrong
    return redirect("/warehouses?message=Error: Could not add warehouse.")
  }

  revalidatePath("/warehouses")
  redirect("/warehouses")
}

// Action to update an existing warehouse (to be used on the detail page later)
export async function updateWarehouse(warehouseId: number, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return redirect("/login")

  const warehouseData = {
    name: formData.get("name") as string,
    address: formData.get("address") as string,
  }

  const { error } = await supabase
    .from("warehouses")
    .update(warehouseData)
    .eq("id", warehouseId)

  if (error) {
    console.error("Error updating warehouse:", error)
  }

  revalidatePath("/warehouses")
  revalidatePath(`/warehouses/${warehouseId}`)
}

// Action to delete a warehouse
export async function deleteWarehouse(warehouseId: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return redirect("/login")

  const { error } = await supabase
    .from("warehouses")
    .delete()
    .eq("id", warehouseId)

  if (error) {
    console.error("Error deleting warehouse:", error)
  }

  revalidatePath("/warehouses")
  redirect("/warehouses")
}
