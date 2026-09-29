"use server"

import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type AccessActionState = { message?: string }

function safeDestination(value: FormDataEntryValue | null): "/cuenta" | "/crm" {
  return value === "/crm" ? "/crm" : "/cuenta"
}

export async function signIn(
  _state: AccessActionState,
  formData: FormData
): Promise<AccessActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  const next = safeDestination(formData.get("next"))
  if (!email || !password) return { message: "Escribe tu correo y contraseña." }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { message: "No pudimos validar esos datos de acceso." }
  redirect(next)
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect("/acceso")
}
