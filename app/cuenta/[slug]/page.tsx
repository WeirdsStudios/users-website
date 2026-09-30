import { notFound } from "next/navigation"
import Link from "next/link"
import { listAccountOrganizations } from "@/lib/account-auth"
import { formatPortalMoney, getClientPortalData, PORTAL_DELIVERABLE_STATUS, PORTAL_PROJECT_STATUS } from "@/lib/client-portal"
import { createSupportRequest } from "./actions"

function date(value: string | null) {
  return value ? new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(`${value}T12:00:00`)) : "Sin fecha definida"
}

const supportStatus: Record<string, string> = {
  received: "Recibida", in_progress: "En atención", waiting_client: "Esperando tu respuesta", resolved: "Resuelta", closed: "Cerrada",
}

export default async function OrganizationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const organizations = await listAccountOrganizations()
  const organization = organizations.find((candidate) => candidate.slug === slug)
  if (!organization) notFound()
  const portal = await getClientPortalData(organization.id)
  const submitSupport = createSupportRequest.bind(null, organization.id, organization.slug)

  return (
    <main id="contenido" className="min-h-screen bg-zinc-100 px-5 py-7 text-zinc-950 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-start justify-between gap-5 border-b border-zinc-200 pb-7">
          <div>
            <Link className="text-sm text-zinc-500 underline underline-offset-4" href="/cuenta">← Tus organizaciones</Link>
            <p className="mt-7 font-mono text-xs uppercase tracking-[0.18em] text-[#5a8500]">USERS · Portal del cliente</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{organization.name}</h1>
            <p className="mt-2 text-sm text-zinc-600">Centro de seguimiento con USERS · Rol: {organization.role}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">Tu cuenta está aislada de las demás organizaciones.</div>
        </header>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Proyectos", portal.projects.length, "Trabajo publicado por USERS"],
            ["Entregables", portal.deliverables.length, "Materiales y siguientes entregas"],
            ["Facturas", portal.invoices.length, "Documentos de tu relación con USERS"],
            ["Solicitudes", portal.support.length, "Conversaciones de soporte"],
          ].map(([label, count, detail]) => (
            <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm" key={String(label)}>
              <p className="text-sm text-zinc-500">{label}</p><p className="mt-2 text-3xl font-bold">{count}</p><p className="mt-2 text-xs leading-5 text-zinc-500">{detail}</p>
            </section>
          ))}
        </section>

        <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.8fr)]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-semibold">Proyectos</h2><span className="text-xs text-zinc-500">Actualizados por USERS</span></div>
              <div className="mt-5 space-y-3">
                {portal.projects.map((project) => <article className="rounded-xl border border-zinc-200 p-4" key={project.id}><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-semibold">{project.title}</h3><p className="mt-1 text-sm leading-6 text-zinc-600">{project.summary ?? "USERS publicará el avance y los siguientes hitos aquí."}</p></div><span className="h-fit rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700">{PORTAL_PROJECT_STATUS[project.status]}</span></div><p className="mt-3 text-xs text-zinc-500">Fecha objetivo: {date(project.targetDate)}</p></article>)}
                {!portal.projects.length ? <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-500">Todavía no hay proyectos publicados. Cuando USERS inicie uno, aparecerá aquí con su avance y fechas.</p> : null}
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Entregables</h2>
              <div className="mt-5 space-y-3">
                {portal.deliverables.map((item) => <article className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-zinc-200 p-4" key={item.id}><div><h3 className="font-semibold">{item.title}</h3><p className="mt-1 text-sm text-zinc-600">{[item.projectTitle, item.description].filter(Boolean).join(" · ")}</p><p className="mt-2 text-xs text-zinc-500">{PORTAL_DELIVERABLE_STATUS[item.status]} · {date(item.dueOn)}</p></div>{item.url ? <a className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50" href={item.url} rel="noreferrer" target="_blank">Abrir</a> : null}</article>)}
                {!portal.deliverables.length ? <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-500">Aquí aparecerán archivos, enlaces y entregas que USERS comparta contigo.</p> : null}
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Facturas</h2>
              <div className="mt-5 divide-y divide-zinc-100">
                {portal.invoices.map((invoice) => <article className="flex flex-wrap items-center justify-between gap-4 py-4" key={invoice.id}><div><p className="font-semibold">{invoice.reference}</p><p className="mt-1 text-sm text-zinc-600">{invoice.status} · vence {date(invoice.dueOn)}</p></div><div className="flex items-center gap-3"><p className="font-semibold">{formatPortalMoney(invoice.total, invoice.currency)}</p>{invoice.documentUrl ? <a className="text-sm underline underline-offset-4" href={invoice.documentUrl} rel="noreferrer" target="_blank">Documento</a> : null}</div></article>)}
                {!portal.invoices.length ? <p className="py-6 text-sm text-zinc-500">No hay facturas publicadas para esta organización.</p> : null}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-zinc-200 bg-zinc-950 p-6 text-white shadow-sm">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#4cfc0f]">Operación de tu negocio</p>
              <h2 className="mt-3 text-xl font-semibold">Tu consola operativa</h2>
              {portal.consoles.map((console) => <a className="mt-4 block rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950" href={console.url} key={console.id} rel="noreferrer" target="_blank">{console.label} <span className="font-normal text-zinc-500">· {console.status === "active" ? "Disponible" : "En mantenimiento"}</span></a>)}
              {!portal.consoles.length ? <p className="mt-3 text-sm leading-6 text-zinc-300">Tu consola de catálogo, clientes, cotizaciones y ventas se conecta aquí cuando quede provisionada para tu negocio. Sus datos no viven en USERS ni se comparten con otros clientes.</p> : null}
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Solicitar apoyo</h2><p className="mt-2 text-sm leading-6 text-zinc-600">Cuéntanos qué necesitas. El equipo de USERS responderá en esta misma cuenta.</p>
              <form action={submitSupport} className="mt-5 grid gap-3">
                <label className="grid gap-1 text-xs font-medium text-zinc-700">Asunto<input className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-normal" name="subject" required /></label>
                <label className="grid gap-1 text-xs font-medium text-zinc-700">Prioridad<select className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-normal" defaultValue="normal" name="priority"><option value="low">Baja</option><option value="normal">Normal</option><option value="high">Alta</option><option value="urgent">Urgente</option></select></label>
                <label className="grid gap-1 text-xs font-medium text-zinc-700">Detalle<textarea className="min-h-28 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-normal" name="body" required /></label>
                <button className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800" type="submit">Enviar solicitud</button>
              </form>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Tus solicitudes</h2>
              <div className="mt-4 space-y-4">{portal.support.map((request) => <article className="border-l-2 border-zinc-200 pl-3" key={request.id}><p className="font-medium">{request.subject}</p><p className="mt-1 text-xs text-zinc-500">{supportStatus[request.status] ?? request.status} · prioridad {request.priority}</p>{request.staffResponse ? <p className="mt-2 text-sm text-zinc-600">{request.staffResponse}</p> : null}</article>)}{!portal.support.length ? <p className="text-sm text-zinc-500">No hay solicitudes abiertas.</p> : null}</div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}
