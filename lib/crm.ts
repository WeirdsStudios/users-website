import "server-only"

import { createAdminClient } from "@/lib/supabase-admin"
import { requireStaffIdentity } from "@/lib/account-auth"

export interface CrmLead {
  id: string
  businessName: string
  industry: string | null
  contactName: string | null
  email: string | null
  whatsapp: string | null
  organizationId: string | null
  updatedAt: string
}

export async function listCrmLeads(): Promise<CrmLead[]> {
  await requireStaffIdentity()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("analisis_negocio")
    .select("id, nombre_negocio, giro, nombre_contacto, email, whatsapp, organization_id, updated_at")
    .eq("status", "completado")
    .order("updated_at", { ascending: false })
    .limit(100)
  if (error) throw new Error("No se pudieron cargar los prospectos del CRM.")

  return (data ?? []).map((lead) => ({
    id: lead.id,
    businessName: lead.nombre_negocio ?? "Negocio sin nombre",
    industry: lead.giro,
    contactName: lead.nombre_contacto,
    email: lead.email,
    whatsapp: lead.whatsapp,
    organizationId: lead.organization_id,
    updatedAt: lead.updated_at,
  }))
}
