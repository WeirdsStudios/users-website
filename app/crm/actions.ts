"use server"

import type { User } from "@supabase/supabase-js"
import {
  createOrganizationSlug,
  normalizeMemberEmail,
} from "@weirdsstudios/users-core"
import { revalidatePath } from "next/cache"
import { requireStaffIdentity } from "@/lib/account-auth"
import { createAdminClient } from "@/lib/supabase-admin"
import { getSiteUrl } from "@/lib/site-url"

export type ConvertLeadState = { ok?: boolean; message?: string }

async function findAuthUserByEmail(email: string): Promise<User | null> {
  const supabase = createAdminClient()
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw new Error("No se pudo comprobar el usuario en Supabase Auth.")
    const match = data.users.find((user) => user.email?.toLowerCase() === email)
    if (match) return match
    if (data.users.length < 1000) return null
  }
  throw new Error("No se pudo completar la búsqueda del usuario.")
}

export async function convertLeadToClient(
  leadId: string,
  _state: ConvertLeadState,
  formData: FormData
): Promise<ConvertLeadState> {
  const staff = await requireStaffIdentity()
  const organizationName = String(formData.get("organizationName") ?? "").trim().slice(0, 120)
  const ownerEmail = normalizeMemberEmail(formData.get("ownerEmail"))
  if (!organizationName || !ownerEmail) {
    return { ok: false, message: "Revisa el nombre del negocio y el correo del propietario." }
  }

  const supabase = createAdminClient()
  const { data: lead, error: leadError } = await supabase
    .from("analisis_negocio")
    .select("id, status, organization_id")
    .eq("id", leadId)
    .maybeSingle()
  if (leadError || !lead || lead.status !== "completado") {
    return { ok: false, message: "El prospecto ya no está disponible para conversión." }
  }
  if (lead.organization_id) return { ok: true, message: "Este cliente ya fue convertido." }

  let user = await findAuthUserByEmail(ownerEmail)
  let createdForInvite = false
  if (!user) {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(ownerEmail, {
      redirectTo: `${getSiteUrl()}/cuenta/configurar`,
    })
    if (error || !data.user) {
      return { ok: false, message: "No se pudo enviar la invitación al propietario." }
    }
    user = data.user
    createdForInvite = true
  }

  const ownerStatus = user.email_confirmed_at || user.last_sign_in_at ? "active" : "invited"
  const { error: conversionError } = await supabase.rpc("convert_users_lead_to_organization", {
    p_analysis_id: leadId,
    p_name: organizationName,
    p_slug: createOrganizationSlug(organizationName),
    p_owner_user_id: user.id,
    p_owner_status: ownerStatus,
    p_staff_user_id: staff.userId,
  })
  if (conversionError) {
    if (createdForInvite) await supabase.auth.admin.deleteUser(user.id)
    return { ok: false, message: "No se pudo crear la cuenta; no se modificó el prospecto." }
  }

  revalidatePath("/crm")
  return {
    ok: true,
    message: createdForInvite
      ? `Cuenta creada e invitación enviada a ${ownerEmail}.`
      : `Cuenta creada y vinculada a ${ownerEmail}.`,
  }
}
