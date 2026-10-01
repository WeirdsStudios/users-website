import { requireStaffIdentity } from "@/lib/account-auth"
import { listCrmLeads } from "@/lib/crm"
import ConvertLeadForm from "../ConvertLeadForm"
import RegisterBusinessForm from "../RegisterBusinessForm"
import { CrmCard, CrmEmpty, CrmShell } from "../CrmShell"

export default async function CrmLeadsPage() {
  const [staff, leads] = await Promise.all([requireStaffIdentity(), listCrmLeads()])
  return (
    <CrmShell email={staff.email} title="Leads" description="Diagnósticos terminados desde el Motor. Convierte únicamente los que estén listos para iniciar una relación comercial.">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Diagnósticos listos</h2><span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600">{leads.length} registros</span></div><ul className="space-y-4">
        {leads.map((lead) => (
          <li className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200/40 sm:p-6" key={lead.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{lead.businessName}</h2>
                <p className="mt-1 text-sm text-zinc-500">{[lead.contactName, lead.industry, lead.email].filter(Boolean).join(" · ")}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${lead.organizationId ? "bg-emerald-50 text-emerald-700" : "bg-[#ecffd9] text-[#3e6500]"}`}>{lead.organizationId ? "Cliente convertido" : "Listo para convertir"}</span>
            </div>
            {!lead.organizationId ? <ConvertLeadForm leadId={lead.id} businessName={lead.businessName} ownerEmail={lead.email ?? ""} /> : null}
          </li>
        ))}
      </ul>{!leads.length ? <CrmEmpty>No hay leads terminados por convertir.</CrmEmpty> : null}</div>
      <aside className="xl:sticky xl:top-6 xl:self-start"><CrmCard><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#568000]">Alta manual</p><h2 className="mt-2 text-xl font-semibold">Registrar negocio</h2><p className="mt-2 text-sm leading-6 text-zinc-600">Para una venta, llamada o recomendación que no llegó por el Motor. El propietario recibe su invitación y su administración desde el primer acceso.</p><RegisterBusinessForm /></CrmCard></aside>
      </div>
    </CrmShell>
  )
}
