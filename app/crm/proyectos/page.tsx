import { requireStaffIdentity } from "@/lib/account-auth"
import { CRM_STATUS_LABELS, listCrmCompanies, listCrmProjects, listCrmTasks } from "@/lib/crm-v1"
import { createProject, createTask, updateStatus } from "../manage-actions"
import { CrmCard, CrmEmpty, CrmField, CrmSelect, CrmShell, CrmSubmit } from "../CrmShell"

const projectStatuses = Object.entries(CRM_STATUS_LABELS.project) as [string, string][]
const taskStatuses = Object.entries(CRM_STATUS_LABELS.task) as [string, string][]

export default async function ProjectsPage() {
  const [staff, companies, projects, tasks] = await Promise.all([requireStaffIdentity(), listCrmCompanies(), listCrmProjects(), listCrmTasks()])
  return (
    <CrmShell email={staff.email} title="Proyectos y tareas" description="Convierte una oportunidad ganada en trabajo visible para USERS y para el cliente. Las tareas mantienen el siguiente paso claro.">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <section>
            <h2 className="mb-3 text-lg font-semibold">Proyectos</h2>
            <div className="space-y-4">
              {projects.map((project) => (
                <CrmCard key={project.id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <p className="mt-1 text-sm text-zinc-500">{project.companyName ?? "Empresa sin nombre"}{project.targetDate ? ` · Entrega ${project.targetDate}` : ""}</p>
                      <p className="mt-2 text-xs text-zinc-500">Salud: {project.health === "on_track" ? "En curso" : project.health === "attention" ? "Requiere atención" : "Bloqueado"}</p>
                    </div>
                    <form action={updateStatus} className="flex items-center gap-2">
                      <input name="table" type="hidden" value="crm_projects" /><input name="id" type="hidden" value={project.id} />
                      <select className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs" defaultValue={project.status} name="status">
                        {projectStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                      <button className="text-xs font-medium text-zinc-600 underline" type="submit">Actualizar</button>
                    </form>
                  </div>
                </CrmCard>
              ))}
              {!projects.length ? <CrmEmpty>Aún no hay proyectos abiertos.</CrmEmpty> : null}
            </div>
          </section>
          <section>
            <h2 className="mb-3 text-lg font-semibold">Tareas</h2>
            <div className="space-y-3">
              {tasks.map((task) => (
                <CrmCard key={task.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">{[task.projectName ?? task.companyName, task.dueOn ? `vence ${task.dueOn}` : null, task.priority].filter(Boolean).join(" · ")}</p>
                    </div>
                    <form action={updateStatus} className="flex items-center gap-2">
                      <input name="table" type="hidden" value="crm_tasks" /><input name="id" type="hidden" value={task.id} />
                      <select className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs" defaultValue={task.status} name="status">
                        {taskStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                      <button className="text-xs font-medium text-zinc-600 underline" type="submit">Actualizar</button>
                    </form>
                  </div>
                </CrmCard>
              ))}
              {!tasks.length ? <CrmEmpty>No hay tareas pendientes.</CrmEmpty> : null}
            </div>
          </section>
        </div>
        <div className="space-y-5">
          <CrmCard>
            <h2 className="text-lg font-semibold">Nuevo proyecto</h2>
            <form action={createProject} className="mt-4 grid gap-3">
              <label className="grid gap-1 text-xs font-medium text-zinc-700">Empresa
                <select className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-normal" name="companyId" required><option value="">Selecciona una empresa</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select>
              </label>
              <CrmField label="Nombre" name="name" required />
              <CrmSelect label="Estado" name="status" options={projectStatuses} defaultValue="planning" />
              <CrmSelect label="Salud" name="health" options={[["on_track", "En curso"], ["attention", "Requiere atención"], ["blocked", "Bloqueado"]]} defaultValue="on_track" />
              <CrmField label="Fecha objetivo" name="targetDate" type="date" />
              <CrmSubmit>Crear proyecto</CrmSubmit>
            </form>
          </CrmCard>
          <CrmCard>
            <h2 className="text-lg font-semibold">Nueva tarea</h2>
            <form action={createTask} className="mt-4 grid gap-3">
              <label className="grid gap-1 text-xs font-medium text-zinc-700">Proyecto (opcional)
                <select className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-normal" name="projectId"><option value="">Sin proyecto</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
              </label>
              <label className="grid gap-1 text-xs font-medium text-zinc-700">Empresa
                <select className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-normal" name="companyId"><option value="">Sin empresa</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select>
              </label>
              <CrmField label="Tarea" name="title" required />
              <CrmSelect label="Prioridad" name="priority" options={[["low", "Baja"], ["normal", "Normal"], ["high", "Alta"], ["urgent", "Urgente"]]} defaultValue="normal" />
              <CrmField label="Vence" name="dueOn" type="date" />
              <CrmSubmit>Crear tarea</CrmSubmit>
            </form>
          </CrmCard>
        </div>
      </div>
    </CrmShell>
  )
}
