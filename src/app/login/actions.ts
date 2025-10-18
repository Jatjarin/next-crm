"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error);
    return redirect("/login?message=Could not authenticate user");
  }

  return redirect("/customers");
}

export async function signup(formData: FormData) {
  const origin = (await headers()).get("origin");
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Signup error:", error);
    return redirect("/login?message=Could not authenticate user");
  }

  // ในระบบจริง ควรจะแสดงข้อความให้ไปยืนยันอีเมล
  return redirect("/login?message=Check email to continue sign in process");
}

export async function signInWithGoogle() {
  const origin = (await headers()).get("origin");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
        hd: "sakww.com", // Google Workspace domain for SAK Woodworks
      },
    },
  });

  if (error) {
    console.error("Google sign-in error:", error);
    return redirect("/login?message=Could not authenticate with Google");
  }

  if (data.url) {
    redirect(data.url);
  }
}
