import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export const PORTAL_PROJECT_STATUS = {
  planned: "Planeación",
  in_progress: "En curso",
  waiting_you: "Esperando tu respuesta",
  paused: "En pausa",
  complete: "Completado",
  cancelled: "Cancelado",
} as const

export const PORTAL_DELIVERABLE_STATUS = {
  planned: "Planeado",
  in_progress: "En preparación",
  review: "En revisión",
  ready: "Listo para ti",
  accepted: "Aceptado",
} as const

export type ClientPortalData = {
  projects: Array<{ id: string; title: string; summary: string | null; status: keyof typeof PORTAL_PROJECT_STATUS; targetDate: string | null }>
  deliverables: Array<{ id: string; title: string; description: string | null; status: keyof typeof PORTAL_DELIVERABLE_STATUS; dueOn: string | null; url: string | null; projectTitle: string | null }>
  invoices: Array<{ id: string; reference: string; status: string; total: number; currency: string; dueOn: string | null; documentUrl: string | null }>
  consoles: Array<{ id: string; label: string; description: string | null; url: string; status: "active" | "maintenance" }>
  support: Array<{ id: string; subject: string; priority: string; status: string; staffResponse: string | null; createdAt: string }>
}

function relatedTitle(value: unknown): string | null {
  const item = Array.isArray(value) ? value[0] : value
  if (!item || typeof item !== "object" || !("title" in item)) return null
  return typeof item.title === "string" ? item.title : null
}

export async function getClientPortalData(organizationId: string): Promise<ClientPortalData> {
  const supabase = await createSupabaseServerClient()
  const [projects, deliverables, invoices, consoles, support] = await Promise.all([
    supabase.from("client_portal_projects").select("id, title, client_summary, status, target_date").eq("organization_id", organizationId).order("target_date", { ascending: true, nullsFirst: false }),
    supabase.from("client_portal_deliverables").select("id, title, description, status, due_on, url, client_portal_projects(title)").eq("organization_id", organizationId).order("due_on", { ascending: true, nullsFirst: false }),
    supabase.from("client_portal_invoices").select("id, reference, status, total, currency, due_on, document_url").eq("organization_id", organizationId).order("due_on", { ascending: true, nullsFirst: false }),
    supabase.from("client_portal_console_links").select("id, label, description, url, status").eq("organization_id", organizationId).order("created_at"),
    supabase.from("client_portal_support_requests").select("id, subject, priority, status, staff_response, created_at").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(20),
  ])
  if ([projects, deliverables, invoices, consoles, support].some((result) => result.error)) {
    throw new Error("No se pudo cargar la información de tu portal.")
  }
  return {
    projects: (projects.data ?? []).map((item) => ({ id: item.id, title: item.title, summary: item.client_summary, status: item.status as keyof typeof PORTAL_PROJECT_STATUS, targetDate: item.target_date })),
    deliverables: (deliverables.data ?? []).map((item) => ({ id: item.id, title: item.title, description: item.description, status: item.status as keyof typeof PORTAL_DELIVERABLE_STATUS, dueOn: item.due_on, url: item.url, projectTitle: relatedTitle(item.client_portal_projects) })),
    invoices: (invoices.data ?? []).map((item) => ({ id: item.id, reference: item.reference, status: item.status, total: Number(item.total), currency: item.currency, dueOn: item.due_on, documentUrl: item.document_url })),
    consoles: (consoles.data ?? []).map((item) => ({ id: item.id, label: item.label, description: item.description, url: item.url, status: item.status as "active" | "maintenance" })),
    support: (support.data ?? []).map((item) => ({ id: item.id, subject: item.subject, priority: item.priority, status: item.status, staffResponse: item.staff_response, createdAt: item.created_at })),
  }
}

export function formatPortalMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)
}
