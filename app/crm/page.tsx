import { requireStaffIdentity } from "@/lib/account-auth"
import { getCrmDashboard } from "@/lib/crm-v1"
import { listClientPortalAdminData } from "@/lib/client-portal-admin"
import { CrmCard, CrmShell } from "./CrmShell"

const cards = [
  ["Leads por convertir", "leads", "/crm/leads", "Diagnósticos terminados que aún no son una empresa."],
  ["Empresas activas", "companies", "/crm/empresas", "Cuentas comerciales y sus contactos."],
  ["Oportunidades abiertas", "opportunities", "/crm/oportunidades", "Conversaciones de venta en curso."],
  ["Proyectos en marcha", "projects", "/crm/proyectos", "Trabajo planeado, activo o esperando al cliente."],
  ["Tareas pendientes", "tasks", "/crm/proyectos", "Siguientes acciones internas."],
  ["Facturas por cobrar", "invoices", "/crm/cotizaciones", "Facturas enviadas, parciales o vencidas."],
] as const

export default async function CrmPage() {
  const [staff, dashboard, portal] = await Promise.all([requireStaffIdentity(), getCrmDashboard(), listClientPortalAdminData()])
  const pendingRequests = portal.support.filter((request) => !["resolved", "closed"].includes(request.status))

  return (
    <CrmShell email={staff.email} title="Resumen de operación" description="La vista diaria de USERS: ventas en curso, clientes, proyectos, pendientes y cobranza.">
      <div className="mb-7 flex flex-col justify-between gap-4 rounded-2xl bg-zinc-950 p-6 text-white sm:flex-row sm:items-end sm:p-7">
        <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#4cfc0f]">Centro de mando</p><h2 className="mt-3 text-2xl font-semibold tracking-tight">Todo tu negocio, en orden.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">Da seguimiento a cada cliente desde el primer contacto hasta la entrega y el cobro.</p></div>
        <a className="shrink-0 rounded-xl bg-[#4cfc0f] px-4 py-2.5 text-center text-sm font-bold text-zinc-950 transition hover:bg-[#72ff36]" href="/crm/leads">+ Registrar cliente</a>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, key, href, description]) => (
          <a className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200/40 transition hover:-translate-y-0.5 hover:border-zinc-950" href={href} key={key}>
            <p className="text-sm font-medium text-zinc-600">{label}</p>
            <p className="mt-3 text-4xl font-bold tracking-tight">{dashboard[key]}</p>
            <p className="mt-3 text-xs leading-5 text-zinc-500">{description}</p>
            <p className="mt-4 text-xs font-semibold text-zinc-950 opacity-0 transition group-hover:opacity-100">Abrir módulo →</p>
          </a>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <CrmCard>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#568000]">Ruta de trabajo</p>
          <h2 className="mt-2 text-lg font-semibold">Cómo usar este CRM</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3"><p className="rounded-xl bg-zinc-50 p-3 text-sm"><strong className="block text-zinc-950">1. Registra</strong><span className="mt-1 block text-xs leading-5 text-zinc-500">Convierte un lead o da de alta una empresa.</span></p><p className="rounded-xl bg-zinc-50 p-3 text-sm"><strong className="block text-zinc-950">2. Vende</strong><span className="mt-1 block text-xs leading-5 text-zinc-500">Da seguimiento a oportunidad y cotización.</span></p><p className="rounded-xl bg-zinc-50 p-3 text-sm"><strong className="block text-zinc-950">3. Entrega</strong><span className="mt-1 block text-xs leading-5 text-zinc-500">Abre proyecto, tareas, factura y portal.</span></p></div>
        </CrmCard>
        <CrmCard>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#568000]">Bandeja</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Notificaciones</h2><p className="mt-1 text-sm leading-6 text-zinc-600">{pendingRequests.length ? `${pendingRequests.length} solicitudes requieren atención.` : "No hay solicitudes pendientes."}</p></div><a className="rounded-xl bg-zinc-950 px-3 py-2 text-sm font-semibold text-white" href="/crm/clientes">Abrir</a></div>
          {pendingRequests.slice(0, 3).map((request) => <p className="mt-3 border-t border-zinc-100 pt-3 text-sm" key={request.id}>{request.organizationName ?? "Cliente"} · {request.subject} · <span className="text-zinc-500">{request.status}</span></p>)}
        </CrmCard>
      </div>
    </CrmShell>
  )
}
