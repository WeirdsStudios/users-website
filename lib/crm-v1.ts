import "server-only"

import { createAdminClient } from "@/lib/supabase-admin"

export const CRM_STATUS_LABELS = {
  company: {
    lead: "Lead",
    prospect: "Prospecto",
    client: "Cliente",
    former_client: "Excliente",
    archived: "Archivada",
  },
  opportunity: {
    new: "Nueva",
    qualified: "Calificada",
    proposal: "Propuesta",
    negotiation: "Negociación",
    won: "Ganada",
    lost: "Perdida",
  },
  project: {
    planning: "Planeación",
    active: "Activo",
    waiting_client: "En espera del cliente",
    paused: "Pausado",
    completed: "Completado",
    cancelled: "Cancelado",
  },
  task: {
    todo: "Por hacer",
    in_progress: "En proceso",
    waiting: "En espera",
    done: "Completada",
    cancelled: "Cancelada",
  },
  quote: {
    draft: "Borrador",
    sent: "Enviada",
    accepted: "Aceptada",
    rejected: "Rechazada",
    expired: "Vencida",
    cancelled: "Cancelada",
  },
  invoice: {
    draft: "Borrador",
    sent: "Enviada",
    partial: "Pago parcial",
    paid: "Pagada",
    overdue: "Vencida",
    void: "Anulada",
  },
} as const

export type CrmCompany = {
  id: string
  name: string
  status: keyof typeof CRM_STATUS_LABELS.company
  industry: string | null
  website: string | null
  phone: string | null
  billingEmail: string | null
  updatedAt: string
}

export type CrmContact = {
  id: string
  companyId: string
  name: string
  email: string | null
  phone: string | null
  jobTitle: string | null
  isPrimary: boolean
  companyName: string | null
}

export type CrmOpportunity = {
  id: string
  companyId: string
  companyName: string | null
  title: string
  stage: keyof typeof CRM_STATUS_LABELS.opportunity
  amount: number | null
  currency: string
  expectedCloseOn: string | null
  updatedAt: string
}

export type CrmProject = {
  id: string
  companyId: string
  companyName: string | null
  name: string
  status: keyof typeof CRM_STATUS_LABELS.project
  health: "on_track" | "attention" | "blocked"
  targetDate: string | null
  updatedAt: string
}

export type CrmTask = {
  id: string
  projectId: string | null
  projectName: string | null
  companyId: string | null
  companyName: string | null
  title: string
  status: keyof typeof CRM_STATUS_LABELS.task
  priority: "low" | "normal" | "high" | "urgent"
  dueOn: string | null
}

export type CrmQuote = {
  id: string
  companyId: string
  companyName: string | null
  reference: string
  title: string
  status: keyof typeof CRM_STATUS_LABELS.quote
  total: number
  currency: string
  validUntil: string | null
}

export type CrmInvoice = {
  id: string
  companyId: string
  companyName: string | null
  reference: string
  status: keyof typeof CRM_STATUS_LABELS.invoice
  total: number
  currency: string
  dueOn: string | null
}

export type CrmNote = {
  id: string
  companyId: string | null
  companyName: string | null
  body: string
  createdAt: string
}

function relatedName(value: unknown): string | null {
  const item = Array.isArray(value) ? value[0] : value
  if (!item || typeof item !== "object" || !("name" in item)) return null
  return typeof item.name === "string" ? item.name : null
}

export async function getCrmDashboard() {
  const supabase = createAdminClient()
  const results = await Promise.all([
    supabase.from("analisis_negocio").select("*", { count: "exact", head: true }).eq("status", "completado").is("organization_id", null),
    supabase.from("crm_companies").select("*", { count: "exact", head: true }).in("status", ["lead", "prospect", "client"]),
    supabase.from("crm_opportunities").select("*", { count: "exact", head: true }).not("stage", "in", "(won,lost)"),
    supabase.from("crm_projects").select("*", { count: "exact", head: true }).in("status", ["planning", "active", "waiting_client", "paused"]),
    supabase.from("crm_tasks").select("*", { count: "exact", head: true }).not("status", "in", "(done,cancelled)"),
    supabase.from("crm_invoices").select("*", { count: "exact", head: true }).in("status", ["sent", "partial", "overdue"]),
  ])
  if (results.some((result) => result.error)) throw new Error("No se pudo cargar el resumen del CRM.")
  return {
    leads: results[0].count ?? 0,
    companies: results[1].count ?? 0,
    opportunities: results[2].count ?? 0,
    projects: results[3].count ?? 0,
    tasks: results[4].count ?? 0,
    invoices: results[5].count ?? 0,
  }
}

export async function listCrmCompanies(): Promise<CrmCompany[]> {
  const { data, error } = await createAdminClient()
    .from("crm_companies")
    .select("id, name, status, industry, website, phone, billing_email, updated_at")
    .order("updated_at", { ascending: false })
  if (error) throw new Error("No se pudieron cargar las empresas.")
  return (data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    status: item.status,
    industry: item.industry,
    website: item.website,
    phone: item.phone,
    billingEmail: item.billing_email,
    updatedAt: item.updated_at,
  })) as CrmCompany[]
}

export async function listCrmContacts(): Promise<CrmContact[]> {
  const { data, error } = await createAdminClient()
    .from("crm_contacts")
    .select("id, company_id, name, email, phone, job_title, is_primary, crm_companies(name)")
    .order("is_primary", { ascending: false })
    .order("name")
  if (error) throw new Error("No se pudieron cargar los contactos.")
  return (data ?? []).map((item) => ({
    id: item.id, companyId: item.company_id, name: item.name, email: item.email,
    phone: item.phone, jobTitle: item.job_title, isPrimary: item.is_primary,
    companyName: relatedName(item.crm_companies),
  }))
}

export async function listCrmOpportunities(): Promise<CrmOpportunity[]> {
  const { data, error } = await createAdminClient()
    .from("crm_opportunities")
    .select("id, company_id, title, stage, amount, currency, expected_close_on, updated_at, crm_companies(name)")
    .order("updated_at", { ascending: false })
  if (error) throw new Error("No se pudieron cargar las oportunidades.")
  return (data ?? []).map((item) => ({
    id: item.id, companyId: item.company_id, companyName: relatedName(item.crm_companies),
    title: item.title, stage: item.stage, amount: item.amount === null ? null : Number(item.amount),
    currency: item.currency, expectedCloseOn: item.expected_close_on, updatedAt: item.updated_at,
  }))
}

export async function listCrmProjects(): Promise<CrmProject[]> {
  const { data, error } = await createAdminClient()
    .from("crm_projects")
    .select("id, company_id, name, status, health, target_date, updated_at, crm_companies(name)")
    .order("updated_at", { ascending: false })
  if (error) throw new Error("No se pudieron cargar los proyectos.")
  return (data ?? []).map((item) => ({
    id: item.id, companyId: item.company_id, companyName: relatedName(item.crm_companies),
    name: item.name, status: item.status, health: item.health,
    targetDate: item.target_date, updatedAt: item.updated_at,
  }))
}

export async function listCrmTasks(): Promise<CrmTask[]> {
  const { data, error } = await createAdminClient()
    .from("crm_tasks")
    .select("id, project_id, company_id, title, status, priority, due_on, crm_projects(name), crm_companies(name)")
    .order("due_on", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
  if (error) throw new Error("No se pudieron cargar las tareas.")
  return (data ?? []).map((item) => ({
    id: item.id, projectId: item.project_id, projectName: relatedName(item.crm_projects),
    companyId: item.company_id, companyName: relatedName(item.crm_companies),
    title: item.title, status: item.status, priority: item.priority, dueOn: item.due_on,
  }))
}

export async function listCrmQuotes(): Promise<CrmQuote[]> {
  const { data, error } = await createAdminClient()
    .from("crm_quotes")
    .select("id, company_id, reference, title, status, total, currency, valid_until, crm_companies(name)")
    .order("created_at", { ascending: false })
  if (error) throw new Error("No se pudieron cargar las cotizaciones.")
  return (data ?? []).map((item) => ({
    id: item.id, companyId: item.company_id, companyName: relatedName(item.crm_companies),
    reference: item.reference, title: item.title, status: item.status,
    total: Number(item.total), currency: item.currency, validUntil: item.valid_until,
  }))
}

export async function listCrmInvoices(): Promise<CrmInvoice[]> {
  const { data, error } = await createAdminClient()
    .from("crm_invoices")
    .select("id, company_id, reference, status, total, currency, due_on, crm_companies(name)")
    .order("due_on", { ascending: true, nullsFirst: false })
  if (error) throw new Error("No se pudieron cargar las facturas.")
  return (data ?? []).map((item) => ({
    id: item.id, companyId: item.company_id, companyName: relatedName(item.crm_companies),
    reference: item.reference, status: item.status, total: Number(item.total),
    currency: item.currency, dueOn: item.due_on,
  }))
}

export async function listCrmNotes(): Promise<CrmNote[]> {
  const { data, error } = await createAdminClient()
    .from("crm_notes")
    .select("id, company_id, body, created_at, crm_companies(name)")
    .order("created_at", { ascending: false })
    .limit(30)
  if (error) throw new Error("No se pudieron cargar las notas.")
  return (data ?? []).map((item) => ({
    id: item.id,
    companyId: item.company_id,
    companyName: relatedName(item.crm_companies),
    body: item.body,
    createdAt: item.created_at,
  }))
}

export function formatMoney(amount: number | null, currency = "MXN") {
  if (amount === null) return "—"
  return new Intl.NumberFormat("es-MX", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)
}
