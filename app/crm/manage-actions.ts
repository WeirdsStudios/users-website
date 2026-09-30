"use server"

import { revalidatePath } from "next/cache"
import { requireStaffIdentity } from "@/lib/account-auth"
import { createAdminClient } from "@/lib/supabase-admin"

function text(formData: FormData, key: string, limit = 300): string | null {
  const value = String(formData.get(key) ?? "").trim().slice(0, limit)
  return value || null
}

function date(formData: FormData, key: string): string | null {
  const value = text(formData, key, 10)
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
}

function money(formData: FormData, key: string): number {
  const value = Number(formData.get(key) ?? 0)
  return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) / 100 : 0
}

function refresh(...paths: string[]) {
  paths.forEach((path) => revalidatePath(path))
}

async function save(table: string, values: Record<string, unknown>) {
  await requireStaffIdentity()
  const { error } = await createAdminClient().from(table).insert(values)
  if (error) throw new Error("No se pudo guardar el registro del CRM.")
}

export async function createCompany(formData: FormData) {
  const staff = await requireStaffIdentity()
  const name = text(formData, "name", 160)
  if (!name) throw new Error("La empresa necesita un nombre.")
  const { error } = await createAdminClient().from("crm_companies").insert({
    name,
    status: text(formData, "status", 30) ?? "prospect",
    industry: text(formData, "industry", 120),
    website: text(formData, "website", 240),
    phone: text(formData, "phone", 40),
    billing_email: text(formData, "billingEmail", 160),
    created_by: staff.userId,
  })
  if (error) throw new Error("No se pudo guardar la empresa.")
  refresh("/crm", "/crm/empresas")
}

export async function createContact(formData: FormData) {
  const staff = await requireStaffIdentity()
  const companyId = text(formData, "companyId", 60)
  const name = text(formData, "name", 160)
  if (!companyId || !name) throw new Error("El contacto requiere empresa y nombre.")
  await save("crm_contacts", {
    company_id: companyId, name, email: text(formData, "email", 160),
    phone: text(formData, "phone", 40), job_title: text(formData, "jobTitle", 120),
    is_primary: formData.get("isPrimary") === "on", created_by: staff.userId,
  })
  refresh("/crm", "/crm/empresas")
}

export async function createOpportunity(formData: FormData) {
  const staff = await requireStaffIdentity()
  const companyId = text(formData, "companyId", 60)
  const title = text(formData, "title", 200)
  if (!companyId || !title) throw new Error("La oportunidad requiere empresa y título.")
  await save("crm_opportunities", {
    company_id: companyId, title, stage: text(formData, "stage", 30) ?? "new",
    amount: money(formData, "amount"), currency: text(formData, "currency", 3) ?? "MXN",
    expected_close_on: date(formData, "expectedCloseOn"), description: text(formData, "description", 4000),
    owner_user_id: staff.userId, created_by: staff.userId,
  })
  refresh("/crm", "/crm/oportunidades")
}

export async function createProject(formData: FormData) {
  const staff = await requireStaffIdentity()
  const companyId = text(formData, "companyId", 60)
  const name = text(formData, "name", 200)
  if (!companyId || !name) throw new Error("El proyecto requiere empresa y nombre.")
  await save("crm_projects", {
    company_id: companyId, opportunity_id: text(formData, "opportunityId", 60), name,
    status: text(formData, "status", 30) ?? "planning", health: text(formData, "health", 30) ?? "on_track",
    summary: text(formData, "summary", 4000), started_on: date(formData, "startedOn"),
    target_date: date(formData, "targetDate"), manager_user_id: staff.userId, created_by: staff.userId,
  })
  refresh("/crm", "/crm/proyectos")
}

export async function createTask(formData: FormData) {
  const staff = await requireStaffIdentity()
  const projectId = text(formData, "projectId", 60)
  const companyId = text(formData, "companyId", 60)
  const title = text(formData, "title", 240)
  if (!title || (!projectId && !companyId)) throw new Error("La tarea requiere un proyecto o una empresa.")
  await save("crm_tasks", {
    project_id: projectId, company_id: companyId, title,
    priority: text(formData, "priority", 20) ?? "normal", due_on: date(formData, "dueOn"),
    assignee_user_id: staff.userId, created_by: staff.userId,
  })
  refresh("/crm", "/crm/proyectos")
}

export async function createNote(formData: FormData) {
  const staff = await requireStaffIdentity()
  const companyId = text(formData, "companyId", 60)
  const body = text(formData, "body", 10000)
  if (!companyId || !body) throw new Error("La nota requiere empresa y contenido.")
  await save("crm_notes", {
    company_id: companyId,
    body,
    author_user_id: staff.userId,
  })
  refresh("/crm", "/crm/empresas")
}

function reference(prefix: "COT" | "FAC") {
  return `${prefix}-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
}

export async function createQuote(formData: FormData) {
  const staff = await requireStaffIdentity()
  const companyId = text(formData, "companyId", 60)
  const title = text(formData, "title", 200)
  if (!companyId || !title) throw new Error("La cotización requiere empresa y título.")
  const subtotal = money(formData, "subtotal")
  const tax = money(formData, "tax")
  await save("crm_quotes", {
    company_id: companyId, opportunity_id: text(formData, "opportunityId", 60),
    reference: reference("COT"), title, subtotal, tax, total: subtotal + tax,
    currency: text(formData, "currency", 3) ?? "MXN", valid_until: date(formData, "validUntil"),
    notes: text(formData, "notes", 4000), created_by: staff.userId,
  })
  refresh("/crm", "/crm/cotizaciones")
}

export async function createInvoice(formData: FormData) {
  const staff = await requireStaffIdentity()
  const companyId = text(formData, "companyId", 60)
  if (!companyId) throw new Error("La factura requiere empresa.")
  await save("crm_invoices", {
    company_id: companyId, quote_id: text(formData, "quoteId", 60), reference: reference("FAC"),
    total: money(formData, "total"), currency: text(formData, "currency", 3) ?? "MXN",
    issued_on: date(formData, "issuedOn"), due_on: date(formData, "dueOn"),
    notes: text(formData, "notes", 4000), created_by: staff.userId,
  })
  refresh("/crm", "/crm/cotizaciones")
}

const STATUS_TABLES = new Set([
  "crm_companies", "crm_opportunities", "crm_projects", "crm_tasks", "crm_quotes", "crm_invoices",
])

export async function updateStatus(formData: FormData) {
  await requireStaffIdentity()
  const table = text(formData, "table", 40)
  const id = text(formData, "id", 60)
  const status = text(formData, "status", 30)
  if (!table || !STATUS_TABLES.has(table) || !id || !status) throw new Error("Actualización inválida.")
  const { error } = await createAdminClient().from(table).update({ status }).eq("id", id)
  if (error) throw new Error("No se pudo actualizar el estado.")
  refresh("/crm", "/crm/empresas", "/crm/oportunidades", "/crm/proyectos", "/crm/cotizaciones")
}
