import { requireStaffIdentity } from "@/lib/account-auth"
import { CRM_STATUS_LABELS, formatMoney, listCrmCompanies, listCrmInvoices, listCrmQuotes } from "@/lib/crm-v1"
import { createInvoice, createQuote, updateStatus } from "../manage-actions"
import { CrmCard, CrmEmpty, CrmField, CrmShell, CrmSubmit } from "../CrmShell"

const quoteStatuses = Object.entries(CRM_STATUS_LABELS.quote) as [string, string][]
const invoiceStatuses = Object.entries(CRM_STATUS_LABELS.invoice) as [string, string][]

export default async function QuotesPage() {
  const [staff, companies, quotes, invoices] = await Promise.all([requireStaffIdentity(), listCrmCompanies(), listCrmQuotes(), listCrmInvoices()])
  return (
    <CrmShell email={staff.email} title="Cotizaciones y facturas" description="Registra el compromiso comercial y el seguimiento de cobro. Esta V1 guarda el estado; la emisión fiscal y pagos se conectan después al proveedor elegido.">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <section>
            <h2 className="mb-3 text-lg font-semibold">Cotizaciones</h2>
            <div className="space-y-3">
              {quotes.map((quote) => (
                <CrmCard key={quote.id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div><p className="font-medium">{quote.title}</p><p className="mt-1 text-sm text-zinc-500">{quote.reference} · {quote.companyName} · {formatMoney(quote.total, quote.currency)}</p></div>
                    <form action={updateStatus} className="flex items-center gap-2"><input name="table" type="hidden" value="crm_quotes" /><input name="id" type="hidden" value={quote.id} /><select className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs" defaultValue={quote.status} name="status">{quoteStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button className="text-xs font-medium text-zinc-600 underline" type="submit">Actualizar</button></form>
                  </div>
                </CrmCard>
              ))}
              {!quotes.length ? <CrmEmpty>Aún no hay cotizaciones creadas.</CrmEmpty> : null}
            </div>
          </section>
          <section>
            <h2 className="mb-3 text-lg font-semibold">Facturas</h2>
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <CrmCard key={invoice.id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div><p className="font-medium">{invoice.reference}</p><p className="mt-1 text-sm text-zinc-500">{invoice.companyName} · {formatMoney(invoice.total, invoice.currency)}{invoice.dueOn ? ` · vence ${invoice.dueOn}` : ""}</p></div>
                    <form action={updateStatus} className="flex items-center gap-2"><input name="table" type="hidden" value="crm_invoices" /><input name="id" type="hidden" value={invoice.id} /><select className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs" defaultValue={invoice.status} name="status">{invoiceStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button className="text-xs font-medium text-zinc-600 underline" type="submit">Actualizar</button></form>
                  </div>
                </CrmCard>
              ))}
              {!invoices.length ? <CrmEmpty>Aún no hay facturas creadas.</CrmEmpty> : null}
            </div>
          </section>
        </div>
        <div className="space-y-5">
          <CrmCard>
            <h2 className="text-lg font-semibold">Nueva cotización</h2>
            <form action={createQuote} className="mt-4 grid gap-3">
              <label className="grid gap-1 text-xs font-medium text-zinc-700">Empresa<select className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-normal" name="companyId" required><option value="">Selecciona una empresa</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
              <CrmField label="Título" name="title" required />
              <CrmField label="Subtotal" name="subtotal" type="number" required />
              <CrmField label="IVA / impuestos" name="tax" type="number" />
              <CrmField label="Válida hasta" name="validUntil" type="date" />
              <CrmSubmit>Crear cotización</CrmSubmit>
            </form>
          </CrmCard>
          <CrmCard>
            <h2 className="text-lg font-semibold">Nueva factura</h2>
            <form action={createInvoice} className="mt-4 grid gap-3">
              <label className="grid gap-1 text-xs font-medium text-zinc-700">Empresa<select className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-normal" name="companyId" required><option value="">Selecciona una empresa</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
              <CrmField label="Total" name="total" type="number" required />
              <CrmField label="Fecha de emisión" name="issuedOn" type="date" />
              <CrmField label="Fecha límite" name="dueOn" type="date" />
              <CrmSubmit>Crear factura</CrmSubmit>
            </form>
          </CrmCard>
        </div>
      </div>
    </CrmShell>
  )
}
