import "server-only"

import { createAdminClient } from "@/lib/supabase-admin"

function relatedText(value: unknown, key: "name" | "title" | "slug"): string | null {
  const item = Array.isArray(value) ? value[0] : value
  if (!item || typeof item !== "object" || !(key in item)) return null
  return typeof item[key] === "string" ? item[key] : null
}

export async function listClientPortalAdminData() {
  const supabase = createAdminClient()
  const [projects, deliverables, invoices, consoles, support, organizations] = await Promise.all([
    supabase.from("client_portal_projects").select("id, title, status, target_date, organization_id, client_summary, client_portal_deliverables(count)").order("updated_at", { ascending: false }),
    supabase.from("client_portal_deliverables").select("id, title, status, due_on, organization_id, client_portal_projects(title)").order("created_at", { ascending: false }),
    supabase.from("client_portal_invoices").select("id, reference, status, total, currency, due_on, organization_id").order("created_at", { ascending: false }),
    supabase.from("client_portal_console_links").select("id, organization_id, label, description, url, status, organizations(name, slug)").order("created_at", { ascending: false }),
    supabase.from("client_portal_support_requests").select("id, organization_id, subject, priority, status, staff_response, created_at, organizations(name)").order("created_at", { ascending: false }),
    supabase.from("organizations").select("id, name, slug").order("name"),
  ])
  if ([projects, deliverables, invoices, consoles, support, organizations].some((result) => result.error)) throw new Error("No se pudo cargar la operación del portal.")
  return {
    projects: (projects.data ?? []).map((item) => ({ id: item.id, title: item.title, status: item.status, targetDate: item.target_date, organizationId: item.organization_id, summary: item.client_summary, deliverables: Array.isArray(item.client_portal_deliverables) ? item.client_portal_deliverables[0]?.count ?? 0 : 0 })),
    deliverables: (deliverables.data ?? []).map((item) => ({ id: item.id, title: item.title, status: item.status, dueOn: item.due_on, organizationId: item.organization_id, projectTitle: relatedText(item.client_portal_projects, "title") })),
    invoices: (invoices.data ?? []).map((item) => ({ id: item.id, reference: item.reference, status: item.status, total: Number(item.total), currency: item.currency, dueOn: item.due_on, organizationId: item.organization_id })),
    consoles: (consoles.data ?? []).map((item) => ({
      id: item.id, organizationId: item.organization_id, label: item.label, description: item.description,
      url: item.url, status: item.status, organizationName: relatedText(item.organizations, "name"),
      organizationSlug: relatedText(item.organizations, "slug"),
    })),
    support: (support.data ?? []).map((item) => ({ id: item.id, organizationId: item.organization_id, organizationName: relatedText(item.organizations, "name"), subject: item.subject, priority: item.priority, status: item.status, response: item.staff_response, createdAt: item.created_at })),
    organizations: (organizations.data ?? []).map((item) => ({ id: item.id, name: item.name, slug: item.slug })),
  }
}
