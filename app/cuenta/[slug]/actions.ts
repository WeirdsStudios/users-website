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
