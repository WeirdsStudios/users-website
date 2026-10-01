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
export type RegisterBusinessState = { ok?: boolean; message?: string }

type AccessEmailKind = "invite" | "recovery"

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    }
    return entities[character]
  })
}

async function sendAccountAccessEmail({
  email,
  organizationName,
  actionLink,
  kind,
}: {
  email: string
  organizationName: string
  actionLink: string
  kind: AccessEmailKind
}): Promise<string | null> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.USERS_CRM_FROM ?? process.env.RESEND_FROM
  if (!key || !from) return "Resend no está configurado para el CRM."

  const business = escapeHtml(organizationName)
  const safeLink = escapeHtml(actionLink)
  const opening = kind === "invite"
    ? "Creamos tu acceso para administrar la cuenta de tu negocio."
    : "Tu acceso estaba pendiente de activar. Aquí tienes un enlace nuevo y seguro."
  const buttonLabel = kind === "invite" ? "Activar mi cuenta" : "Configurar mi acceso"

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        reply_to: "hola@users.mx",
        subject: `Activa tu cuenta de ${organizationName} en USERS`,
        text: `${opening}\n\nNegocio: ${organizationName}\n\nActiva tu cuenta: ${actionLink}\n\nSi no reconoces esta invitación, puedes ignorar este correo.`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.55;color:#18181b;max-width:560px;margin:auto">
            <p style="letter-spacing:.16em;font-size:11px;color:#65a30d;font-weight:700">USERS · ACCESO</p>
            <h1 style="font-size:26px;line-height:1.2">Tu cuenta para ${business} está lista</h1>
            <p>${opening}</p>
            <p style="margin:28px 0">
              <a href="${safeLink}" style="display:inline-block;background:#18181b;color:#fff;padding:13px 20px;border-radius:8px;text-decoration:none;font-weight:700">${buttonLabel}</a>
            </p>
            <p style="font-size:13px;color:#52525b">Si el botón no funciona, copia este enlace en tu navegador:<br><a href="${safeLink}">${safeLink}</a></p>
            <p style="font-size:13px;color:#52525b">Si no reconoces esta invitación, puedes ignorar este correo.</p>
          </div>
        `,
      }),
    })
    return response.ok ? null : `Resend respondió con ${response.status}.`
  } catch {
    return "No se pudo conectar con Resend."
  }
}

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
  let accessEmailKind: AccessEmailKind | null = null
  let actionLink: string | null = null

  if (!user) {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "invite",
      email: ownerEmail,
      options: { redirectTo: `${getSiteUrl()}/cuenta/configurar` },
    })
    if (error || !data.user || !data.properties?.action_link) {
      return { ok: false, message: "No se pudo preparar la invitación para el propietario." }
    }
    user = data.user
    createdForInvite = true
    accessEmailKind = "invite"
    actionLink = data.properties.action_link
  } else if (!user.email_confirmed_at && !user.last_sign_in_at) {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: ownerEmail,
      options: { redirectTo: `${getSiteUrl()}/cuenta/configurar` },
    })
    if (error || !data.properties?.action_link) {
      return { ok: false, message: "No se pudo preparar un nuevo acceso para el propietario." }
    }
    accessEmailKind = "recovery"
    actionLink = data.properties.action_link
  }

  if (accessEmailKind && actionLink) {
    const deliveryError = await sendAccountAccessEmail({
      email: ownerEmail,
      organizationName,
      actionLink,
      kind: accessEmailKind,
    })
    if (deliveryError) {
      if (createdForInvite) await supabase.auth.admin.deleteUser(user.id)
      return {
        ok: false,
        message: "No se pudo enviar el correo de acceso; el prospecto no fue convertido.",
      }
    }
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
      ? `Cuenta creada e invitación enviada a ${ownerEmail} desde acceso@users.mx.`
      : accessEmailKind
        ? `Cuenta vinculada y nuevo acceso enviado a ${ownerEmail} desde acceso@users.mx.`
      : `Cuenta creada y vinculada a ${ownerEmail}.`,
  }
}

/** Alta directa: para negocios que llegan por llamada, WhatsApp o referencia. */
export async function registerBusiness(
  _state: RegisterBusinessState,
  formData: FormData
): Promise<RegisterBusinessState> {
  const staff = await requireStaffIdentity()
  const organizationName = String(formData.get("organizationName") ?? "").trim().slice(0, 120)
  const ownerEmail = normalizeMemberEmail(formData.get("ownerEmail"))
  if (!organizationName || !ownerEmail) return { ok: false, message: "Escribe el negocio y el correo de su propietario." }
  const supabase = createAdminClient()
  let user = await findAuthUserByEmail(ownerEmail)
  let createdForInvite = false
  let accessEmailKind: AccessEmailKind | null = null
  let actionLink: string | null = null
  if (!user) {
    const { data, error } = await supabase.auth.admin.generateLink({ type: "invite", email: ownerEmail, options: { redirectTo: `${getSiteUrl()}/cuenta/configurar` } })
    if (error || !data.user || !data.properties?.action_link) return { ok: false, message: "No se pudo preparar la invitación." }
    user = data.user; createdForInvite = true; accessEmailKind = "invite"; actionLink = data.properties.action_link
  } else if (!user.email_confirmed_at && !user.last_sign_in_at) {
    const { data, error } = await supabase.auth.admin.generateLink({ type: "recovery", email: ownerEmail, options: { redirectTo: `${getSiteUrl()}/cuenta/configurar` } })
    if (error || !data.properties?.action_link) return { ok: false, message: "No se pudo preparar el acceso." }
    accessEmailKind = "recovery"; actionLink = data.properties.action_link
  }
  if (accessEmailKind && actionLink) {
    const deliveryError = await sendAccountAccessEmail({ email: ownerEmail, organizationName, actionLink, kind: accessEmailKind })
    if (deliveryError) { if (createdForInvite) await supabase.auth.admin.deleteUser(user.id); return { ok: false, message: "No se pudo enviar el correo; el negocio no fue creado." } }
  }
  const ownerStatus = user.email_confirmed_at || user.last_sign_in_at ? "active" : "invited"
  const { error } = await supabase.rpc("create_users_organization", { p_name: organizationName, p_slug: createOrganizationSlug(organizationName), p_owner_user_id: user.id, p_owner_status: ownerStatus, p_staff_user_id: staff.userId })
  if (error) { if (createdForInvite) await supabase.auth.admin.deleteUser(user.id); return { ok: false, message: "No se pudo crear el negocio." } }
  revalidatePath("/crm"); revalidatePath("/crm/leads"); revalidatePath("/crm/clientes")
  return { ok: true, message: accessEmailKind ? `Negocio creado e invitación enviada a ${ownerEmail}.` : `Negocio creado y acceso vinculado a ${ownerEmail}.` }
}
