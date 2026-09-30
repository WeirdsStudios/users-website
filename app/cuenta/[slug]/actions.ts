"use server"

import { revalidatePath } from "next/cache"
import { listAccountOrganizations, requireAccountIdentity } from "@/lib/account-auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"

function content(formData: FormData, key: string, min: number, max: number) {
  const value = String(formData.get(key) ?? "").trim().slice(0, max)
  return value.length >= min ? value : null
}

export async function createSupportRequest(organizationId: string, slug: string, formData: FormData) {
  const identity = await requireAccountIdentity()
  const organizations = await listAccountOrganizations()
  if (!organizations.some((organization) => organization.id === organizationId && organization.slug === slug)) {
    throw new Error("No tienes acceso a esta organización.")
  }
  const subject = content(formData, "subject", 3, 180)
  const body = content(formData, "body", 3, 5000)
  const priority = String(formData.get("priority") ?? "normal")
  if (!subject || !body || !["low", "normal", "high", "urgent"].includes(priority)) {
    throw new Error("Completa el asunto, el detalle y la prioridad de tu solicitud.")
  }
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("client_portal_support_requests").insert({
    organization_id: organizationId,
    subject,
    body,
    priority,
    submitted_by: identity.userId,
  })
  if (error) throw new Error("No pudimos enviar tu solicitud. Intenta de nuevo.")
  revalidatePath(`/cuenta/${slug}`)
}

/**
 * El acceso a la consola se solicita desde el propio portal. No crea una
 * base ni un despliegue desde el navegador: sólo deja una solicitud trazable
 * para que USERS aprovisione y vincule la consola correcta de ese negocio.
 */
export async function requestConsoleActivation(organizationId: string, slug: string) {
  const identity = await requireAccountIdentity()
  const organizations = await listAccountOrganizations()
  if (!organizations.some((organization) => organization.id === organizationId && organization.slug === slug)) {
    throw new Error("No tienes acceso a esta organización.")
  }
  const supabase = await createSupabaseServerClient()
  const subject = "Activar consola operativa"
  const { data: existing, error: lookupError } = await supabase
    .from("client_portal_support_requests")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("subject", subject)
    .not("status", "in", "(resolved,closed)")
    .limit(1)
  if (lookupError) throw new Error("No pudimos revisar tus solicitudes. Intenta de nuevo.")
  if (!existing?.length) {
    const { error } = await supabase.from("client_portal_support_requests").insert({
      organization_id: organizationId,
      subject,
      body: "El cliente solicitó activar su consola de catálogo, clientes, cotizaciones y ventas.",
      priority: "normal",
      submitted_by: identity.userId,
    })
    if (error) throw new Error("No pudimos solicitar la activación. Intenta de nuevo.")
  }
  revalidatePath(`/cuenta/${slug}`)
}
