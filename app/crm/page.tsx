import { listCrmLeads } from "@/lib/crm"
import { requireStaffIdentity } from "@/lib/account-auth"
import { signOut } from "@/app/acceso/actions"
import ConvertLeadForm from "./ConvertLeadForm"

export default async function CrmPage() {
  const [staff, leads] = await Promise.all([requireStaffIdentity(), listCrmLeads()])

  return (
    <main id="contenido" className="min-h-screen bg-zinc-100 px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">USERS · CRM inicial</p>
            <h1 className="mt-2 text-4xl font-bold">Prospectos confirmados</h1>
            <p className="mt-2 text-sm text-zinc-600">Sesión de {staff.email}</p>
          </div>
          <form action={signOut}>
            <button className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm" type="submit">Salir</button>
          </form>
        </header>

        <ul className="mt-8 space-y-4">
          {leads.map((lead) => (
            <li className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm" key={lead.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">{lead.businessName}</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    {[lead.contactName, lead.industry, lead.email].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
                  {lead.organizationId ? "Cliente convertido" : "Listo para convertir"}
                </span>
              </div>
              {!lead.organizationId ? (
                <ConvertLeadForm
                  leadId={lead.id}
                  businessName={lead.businessName}
                  ownerEmail={lead.email ?? ""}
                />
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
