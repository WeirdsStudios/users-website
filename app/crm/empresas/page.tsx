import { requireStaffIdentity } from "@/lib/account-auth"
import { CRM_STATUS_LABELS, listCrmCompanies, listCrmContacts, listCrmNotes } from "@/lib/crm-v1"
import { createCompany, createContact, createNote, updateStatus } from "../manage-actions"
import { CrmCard, CrmEmpty, CrmField, CrmSelect, CrmShell, CrmSubmit } from "../CrmShell"

const companyStatuses = Object.entries(CRM_STATUS_LABELS.company) as [string, string][]

export default async function CompaniesPage() {
  const [staff, companies, contacts, notes] = await Promise.all([requireStaffIdentity(), listCrmCompanies(), listCrmContacts(), listCrmNotes()])
  return (
    <CrmShell email={staff.email} title="Empresas y contactos" description="La ficha comercial de cada negocio. Una empresa puede venir de un lead convertido o crearse manualmente.">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {companies.map((company) => (
            <CrmCard key={company.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{company.name}</h2>
                  <p className="mt-1 text-sm text-zinc-500">{[company.industry, company.website, company.phone].filter(Boolean).join(" · ") || "Sin datos de contacto adicionales"}</p>
                </div>
                <form action={updateStatus} className="flex items-center gap-2">
                  <input name="table" type="hidden" value="crm_companies" />
                  <input name="id" type="hidden" value={company.id} />
                  <select className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs" defaultValue={company.status} name="status">
                    {companyStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  <button className="text-xs font-medium text-zinc-600 underline" type="submit">Actualizar</button>
                </form>
              </div>
              {company.billingEmail ? <p className="mt-3 text-sm text-zinc-600">Facturación: {company.billingEmail}</p> : null}
            </CrmCard>
          ))}
          {!companies.length ? <CrmEmpty>Aún no hay empresas. Crea una o convierte un lead.</CrmEmpty> : null}

          <CrmCard>
            <h2 className="text-lg font-semibold">Contactos</h2>
            <ul className="mt-4 divide-y divide-zinc-100">
              {contacts.map((contact) => (
                <li className="py-3 text-sm" key={contact.id}>
                  <p className="font-medium">{contact.name}{contact.isPrimary ? " · principal" : ""}</p>
                  <p className="mt-1 text-zinc-500">{[contact.companyName, contact.jobTitle, contact.email, contact.phone].filter(Boolean).join(" · ")}</p>
                </li>
              ))}
            </ul>
            {!contacts.length ? <p className="mt-3 text-sm text-zinc-500">Todavía no hay contactos registrados.</p> : null}
          </CrmCard>

          <CrmCard>
            <h2 className="text-lg font-semibold">Notas recientes</h2>
            <ul className="mt-4 divide-y divide-zinc-100">
              {notes.map((note) => (
                <li className="py-3 text-sm" key={note.id}>
                  <p className="font-medium">{note.companyName ?? "Sin empresa"}</p>
                  <p className="mt-1 whitespace-pre-wrap text-zinc-600">{note.body}</p>
                  <p className="mt-2 text-xs text-zinc-400">{new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(note.createdAt))}</p>
                </li>
              ))}
            </ul>
            {!notes.length ? <p className="mt-3 text-sm text-zinc-500">Aún no hay notas registradas.</p> : null}
          </CrmCard>
        </div>

        <div className="space-y-5">
          <CrmCard>
            <h2 className="text-lg font-semibold">Nueva empresa</h2>
            <form action={createCompany} className="mt-4 grid gap-3">
              <CrmField label="Nombre" name="name" required />
              <CrmSelect label="Estado" name="status" options={companyStatuses} defaultValue="prospect" />
              <CrmField label="Giro" name="industry" />
              <CrmField label="Sitio web" name="website" type="url" placeholder="https://" />
              <CrmField label="Teléfono" name="phone" type="tel" />
              <CrmField label="Correo de facturación" name="billingEmail" type="email" />
              <CrmSubmit>Crear empresa</CrmSubmit>
            </form>
          </CrmCard>

          <CrmCard>
            <h2 className="text-lg font-semibold">Nuevo contacto</h2>
            <form action={createContact} className="mt-4 grid gap-3">
              <label className="grid gap-1 text-xs font-medium text-zinc-700">Empresa
                <select className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-normal" name="companyId" required>
                  <option value="">Selecciona una empresa</option>
                  {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                </select>
              </label>
              <CrmField label="Nombre" name="name" required />
              <CrmField label="Puesto" name="jobTitle" />
              <CrmField label="Correo" name="email" type="email" />
              <CrmField label="Teléfono" name="phone" type="tel" />
              <label className="flex items-center gap-2 text-sm text-zinc-700"><input name="isPrimary" type="checkbox" /> Contacto principal</label>
              <CrmSubmit>Guardar contacto</CrmSubmit>
            </form>
          </CrmCard>

          <CrmCard>
            <h2 className="text-lg font-semibold">Nueva nota</h2>
            <form action={createNote} className="mt-4 grid gap-3">
              <label className="grid gap-1 text-xs font-medium text-zinc-700">Empresa
                <select className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-normal" name="companyId" required>
                  <option value="">Selecciona una empresa</option>
                  {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-medium text-zinc-700">Nota
                <textarea className="min-h-28 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-normal text-zinc-950" name="body" required />
              </label>
              <CrmSubmit>Guardar nota</CrmSubmit>
            </form>
          </CrmCard>
        </div>
      </div>
    </CrmShell>
  )
}
