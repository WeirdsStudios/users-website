import { requireStaffIdentity } from "@/lib/account-auth"
import { listCrmLeads } from "@/lib/crm"
import ConvertLeadForm from "../ConvertLeadForm"
import RegisterBusinessForm from "../RegisterBusinessForm"
import { CrmCard, CrmEmpty, CrmShell } from "../CrmShell"

export default async function CrmLeadsPage() {
  const [staff, leads] = await Promise.all([requireStaffIdentity(), listCrmLeads()])
  return (
    <CrmShell email={staff.email} title="Leads" description="Diagnósticos terminados desde el Motor. Convierte únicamente los que estén listos para iniciar una relación comercial.">
      <CrmCard><h2 className="text-lg font-semibold">Registrar negocio</h2><p className="mt-2 text-sm text-zinc-600">Para una venta, llamada o recomendación que no llegó por el Motor. El propietario recibe su invitación y su administración queda disponible desde el primer acceso.</p><RegisterBusinessForm /></CrmCard>
      <ul className="mt-5 space-y-4">
        {leads.map((lead) => (
          <li className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm" key={lead.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{lead.businessName}</h2>
                <p className="mt-1 text-sm text-zinc-500">{[lead.contactName, lead.industry, lead.email].filter(Boolean).join(" · ")}</p>
              </div>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">{lead.organizationId ? "Cliente convertido" : "Listo para convertir"}</span>
            </div>
            {!lead.organizationId ? <ConvertLeadForm leadId={lead.id} businessName={lead.businessName} ownerEmail={lead.email ?? ""} /> : null}
          </li>
        ))}
      </ul>
      {!leads.length ? <CrmEmpty>No hay leads terminados por convertir.</CrmEmpty> : null}
    </CrmShell>
  )
}
