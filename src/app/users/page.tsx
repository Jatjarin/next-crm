import { createClient } from "@/lib/supabase/server"
import { getUserRole } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import UserManagementClient from "./UserManagementClient"

export default async function UsersPage() {
  const supabase = await createClient()
  const t = await getTranslations("UsersPage")

  // Check if user is admin or director
  const userRole = await getUserRole()
  if (!userRole || !["director", "admin"].includes(userRole)) {
    redirect("/?message=Access denied")
  }

  // Fetch all user profiles
  const { data: users, error } = await supabase
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
    return <p className="p-8">Error loading users</p>
  }

  return <UserManagementClient initialUsers={users || []} currentUserRole={userRole} />
}
