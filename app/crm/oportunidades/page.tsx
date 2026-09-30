import { requireStaffIdentity } from "@/lib/account-auth"
import { CRM_STATUS_LABELS, formatMoney, listCrmCompanies, listCrmOpportunities } from "@/lib/crm-v1"
import { createOpportunity, updateStatus } from "../manage-actions"
import { CrmCard, CrmEmpty, CrmField, CrmSelect, CrmShell, CrmSubmit } from "../CrmShell"

const opportunityStages = Object.entries(CRM_STATUS_LABELS.opportunity) as [string, string][]

export default async function OpportunitiesPage() {
  const [staff, companies, opportunities] = await Promise.all([requireStaffIdentity(), listCrmCompanies(), listCrmOpportunities()])
  return (
    <CrmShell email={staff.email} title="Oportunidades" description="Da seguimiento a cada venta antes de que se convierta en proyecto. El monto es estimado y puede ajustarse hasta la cotización final.">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {opportunities.map((opportunity) => (
            <CrmCard key={opportunity.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{opportunity.title}</h2>
                  <p className="mt-1 text-sm text-zinc-500">{opportunity.companyName ?? "Empresa sin nombre"} · {formatMoney(opportunity.amount, opportunity.currency)}</p>
                  {opportunity.expectedCloseOn ? <p className="mt-2 text-xs text-zinc-500">Cierre estimado: {opportunity.expectedCloseOn}</p> : null}
                </div>
                <form action={updateStatus} className="flex items-center gap-2">
                  <input name="table" type="hidden" value="crm_opportunities" />
                  <input name="id" type="hidden" value={opportunity.id} />
                  <select className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs" defaultValue={opportunity.stage} name="status">
                    {opportunityStages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  <button className="text-xs font-medium text-zinc-600 underline" type="submit">Actualizar</button>
                </form>
              </div>
            </CrmCard>
          ))}
          {!opportunities.length ? <CrmEmpty>Aún no hay oportunidades. Registra la siguiente conversación comercial.</CrmEmpty> : null}
        </div>

        <CrmCard>
          <h2 className="text-lg font-semibold">Nueva oportunidad</h2>
          <form action={createOpportunity} className="mt-4 grid gap-3">
            <label className="grid gap-1 text-xs font-medium text-zinc-700">Empresa
              <select className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-normal" name="companyId" required>
                <option value="">Selecciona una empresa</option>
                {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
              </select>
            </label>
            <CrmField label="Título" name="title" required placeholder="Ej. Sitio y portal de clientes" />
            <CrmSelect label="Etapa" name="stage" options={opportunityStages} defaultValue="new" />
            <CrmField label="Monto estimado" name="amount" type="number" />
            <CrmField label="Cierre estimado" name="expectedCloseOn" type="date" />
            <label className="grid gap-1 text-xs font-medium text-zinc-700">Contexto
              <textarea className="min-h-24 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-normal" name="description" />
            </label>
            <CrmSubmit>Guardar oportunidad</CrmSubmit>
          </form>
        </CrmCard>
      </div>
    </CrmShell>
  )
}
