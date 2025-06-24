"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function addResponsiblePerson(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return redirect("/login")

  const personData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
  }

  const { error } = await supabase
    .from("responsible_persons")
    .insert(personData)
  if (error) {
    console.error("Error adding responsible person:", error)
    return redirect("/responsible-persons?message=Error")
  }

  await revalidatePath("/responsible-persons")
  redirect("/responsible-persons")
}

export async function updateResponsiblePerson(
  personId: number,
  formData: FormData
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return redirect("/login")

  const personData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
  }

  const { error } = await supabase
    .from("responsible_persons")
    .update(personData)
    .eq("id", personId)
  if (error) {
    console.error("Error updating responsible person:", error)
    return redirect(`/responsible-persons/${personId}?message=Error`)
  }

  await revalidatePath("/responsible-persons")
  await revalidatePath(`/responsible-persons/${personId}`)
  redirect("/responsible-persons")
}

export async function deleteResponsiblePerson(personId: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return redirect("/login")

  const { error } = await supabase
    .from("responsible_persons")
    .delete()
    .eq("id", personId)
  if (error) {
    console.error("Error deleting responsible person:", error)
    return redirect("/responsible-persons?message=Error")
  }

  await revalidatePath("/responsible-persons")
  redirect("/responsible-persons")
}
