import { requireStaffIdentity } from "@/lib/account-auth"
import { getCrmDashboard } from "@/lib/crm-v1"
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
  const [staff, dashboard] = await Promise.all([requireStaffIdentity(), getCrmDashboard()])

  return (
    <CrmShell email={staff.email} title="Resumen de operación" description="La vista diaria de USERS: ventas en curso, clientes, proyectos, pendientes y cobranza.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, key, href, description]) => (
          <a className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-[#76ad00]" href={href} key={key}>
            <p className="text-sm text-zinc-600">{label}</p>
            <p className="mt-3 text-4xl font-bold tracking-tight">{dashboard[key]}</p>
            <p className="mt-3 text-xs leading-5 text-zinc-500">{description}</p>
          </a>
        ))}
      </div>
      <CrmCard>
        <h2 className="text-lg font-semibold">Cómo usar este CRM</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
          Convierte un lead en empresa, registra los contactos y la oportunidad, y abre un proyecto cuando se gane el trabajo. Las cotizaciones y facturas quedan vinculadas a la misma empresa para no perder el contexto comercial.
        </p>
      </CrmCard>
    </CrmShell>
  )
}
