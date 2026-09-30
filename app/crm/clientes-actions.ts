"use server"

import { revalidatePath } from "next/cache"
import { requireStaffIdentity } from "@/lib/account-auth"
import { createAdminClient } from "@/lib/supabase-admin"

function text(formData: FormData, key: string, limit = 500): string | null {
  const value = String(formData.get(key) ?? "").trim().slice(0, limit)
  return value || null
}

function date(formData: FormData, key: string): string | null {
  const value = text(formData, key, 10)
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
}

function mapProjectStatus(status: string) {
  return ({ planning: "planned", active: "in_progress", waiting_client: "waiting_you", paused: "paused", completed: "complete", cancelled: "cancelled" } as Record<string, string>)[status] ?? "planned"
}

function refresh() {
  revalidatePath("/crm/clientes")
  revalidatePath("/cuenta", "layout")
}

function httpsUrl(formData: FormData, key: string) {
  const value = text(formData, key, 500)
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

export async function createConsoleLink(formData: FormData) {
  const staff = await requireStaffIdentity()
  const organizationId = text(formData, "organizationId", 60)
  const label = text(formData, "label", 120)
  const url = httpsUrl(formData, "url")
  const status = text(formData, "status", 30) ?? "active"
  if (!organizationId || !label || !url || !["active", "maintenance"].includes(status)) {
    throw new Error("Selecciona un cliente, escribe un nombre y usa una URL https válida.")
  }
  const supabase = createAdminClient()
  const { data: organization, error: organizationError } = await supabase.from("organizations").select("id").eq("id", organizationId).maybeSingle()
  if (organizationError || !organization) throw new Error("No encontramos esa organización cliente.")
  const { error } = await supabase.from("client_portal_console_links").insert({
    organization_id: organizationId, label, url, status,
    description: text(formData, "description", 1000), created_by: staff.userId,
  })
  if (error) throw new Error("No se pudo vincular la consola del cliente.")
  refresh()
}

export async function updateConsoleLink(formData: FormData) {
  await requireStaffIdentity()
  const id = text(formData, "id", 60)
  const label = text(formData, "label", 120)
  const url = httpsUrl(formData, "url")
  const status = text(formData, "status", 30)
  if (!id || !label || !url || !status || !["active", "maintenance"].includes(status)) {
    throw new Error("La consola requiere nombre, URL https y estado válido.")
  }
  const { error } = await createAdminClient().from("client_portal_console_links").update({
    label, url, status, description: text(formData, "description", 1000),
  }).eq("id", id)
  if (error) throw new Error("No se pudo actualizar la consola del cliente.")
  refresh()
}

export async function publishProjectToPortal(formData: FormData) {
  const staff = await requireStaffIdentity()
  const projectId = text(formData, "projectId", 60)
  const summary = text(formData, "summary", 4000)
  if (!projectId || !summary) throw new Error("Selecciona un proyecto y escribe un resumen para el cliente.")
  const supabase = createAdminClient()
  const { data: project, error: projectError } = await supabase.from("crm_projects").select("id, company_id, name, status, target_date").eq("id", projectId).single()
  if (projectError || !project) throw new Error("No encontramos ese proyecto interno.")
  const { data: company, error: companyError } = await supabase.from("crm_companies").select("organization_id").eq("id", project.company_id).single()
  if (companyError || !company?.organization_id) throw new Error("Este proyecto necesita una empresa vinculada a una organización cliente antes de publicarse.")
  const { error } = await supabase.from("client_portal_projects").upsert({
    organization_id: company.organization_id, source_crm_project_id: project.id, title: project.name,
    client_summary: summary, status: mapProjectStatus(project.status), target_date: project.target_date, published_by: staff.userId,
  }, { onConflict: "source_crm_project_id" })
  if (error) throw new Error("No se pudo publicar el proyecto en el portal.")
  refresh()
}

export async function createPortalDeliverable(formData: FormData) {
  const staff = await requireStaffIdentity()
  const projectId = text(formData, "portalProjectId", 60)
  const title = text(formData, "title", 200)
  if (!projectId || !title) throw new Error("El entregable requiere un proyecto publicado y un título.")
  const supabase = createAdminClient()
  const { data: project, error: projectError } = await supabase.from("client_portal_projects").select("organization_id").eq("id", projectId).single()
  if (projectError || !project) throw new Error("No encontramos el proyecto publicado.")
  const status = text(formData, "status", 30) ?? "in_progress"
  if (!["planned", "in_progress", "review", "ready", "accepted"].includes(status)) throw new Error("Estado de entregable inválido.")
  const url = text(formData, "url", 500)
  if (url && !url.startsWith("https://")) throw new Error("El enlace del entregable debe usar https://.")
  const { error } = await supabase.from("client_portal_deliverables").insert({
    organization_id: project.organization_id, portal_project_id: projectId, title, status,
    description: text(formData, "description", 4000), due_on: date(formData, "dueOn"), url, published_by: staff.userId,
  })
  if (error) throw new Error("No se pudo publicar el entregable.")
  refresh()
}

export async function publishInvoiceToPortal(formData: FormData) {
  const staff = await requireStaffIdentity()
  const invoiceId = text(formData, "invoiceId", 60)
  if (!invoiceId) throw new Error("Selecciona una factura.")
  const supabase = createAdminClient()
  const { data: invoice, error: invoiceError } = await supabase.from("crm_invoices").select("id, company_id, reference, status, total, currency, due_on").eq("id", invoiceId).single()
  if (invoiceError || !invoice) throw new Error("No encontramos esa factura interna.")
  const { data: company, error: companyError } = await supabase.from("crm_companies").select("organization_id").eq("id", invoice.company_id).single()
  if (companyError || !company?.organization_id) throw new Error("La factura necesita una empresa vinculada a una organización cliente.")
  const documentUrl = text(formData, "documentUrl", 500)
  if (documentUrl && !documentUrl.startsWith("https://")) throw new Error("El documento debe usar un enlace https://.")
  const { error } = await supabase.from("client_portal_invoices").upsert({
    organization_id: company.organization_id, source_crm_invoice_id: invoice.id, reference: invoice.reference,
    status: invoice.status, total: invoice.total, currency: invoice.currency, due_on: invoice.due_on,
    document_url: documentUrl, published_by: staff.userId,
  }, { onConflict: "source_crm_invoice_id" })
  if (error) throw new Error("No se pudo publicar la factura.")
  refresh()
}

export async function replyToSupportRequest(formData: FormData) {
  await requireStaffIdentity()
  const id = text(formData, "id", 60)
  const status = text(formData, "status", 30)
  const response = text(formData, "response", 5000)
  if (!id || !status || !["received", "in_progress", "waiting_client", "resolved", "closed"].includes(status)) throw new Error("Actualización de solicitud inválida.")
  const { error } = await createAdminClient().from("client_portal_support_requests").update({
    status, staff_response: response, responded_at: response ? new Date().toISOString() : null,
  }).eq("id", id)
  if (error) throw new Error("No se pudo actualizar la solicitud.")
  refresh()
}
