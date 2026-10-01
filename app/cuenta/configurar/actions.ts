"use server"

import { redirect } from "next/navigation"
import { isStaffEmail, requireAccountIdentity } from "@/lib/account-auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type SetupActionState = { message?: string }

export async function finishAccountSetup(
  _state: SetupActionState,
  formData: FormData
): Promise<SetupActionState> {
  const identity = await requireAccountIdentity()
  const password = String(formData.get("password") ?? "")
  const confirmation = String(formData.get("confirmation") ?? "")
  if (password.length < 12) return { message: "Usa al menos 12 caracteres." }
  if (password !== confirmation) return { message: "Las contraseñas no coinciden." }

  const supabase = await createSupabaseServerClient()
  const { error: passwordError } = await supabase.auth.updateUser({ password })
  if (passwordError) return { message: "No pudimos guardar tu contraseña." }

  // USERS staff accounts access the internal CRM and are not necessarily
  // members of a client organization. Client accounts continue below to
  // activate their pending organization membership.
  if (isStaffEmail(identity.email)) redirect("/admin")

  const { data, error: activationError } = await supabase.rpc(
    "activate_own_organization_memberships"
  )
  if (activationError || typeof data !== "number" || data < 1) {
    return { message: "Tu cuenta existe, pero no encontramos una invitación pendiente." }
  }
  redirect("/cuenta")
}
