import { notFound } from "next/navigation"
import Link from "next/link"
import { listAccountOrganizations } from "@/lib/account-auth"

export default async function OrganizationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const organizations = await listAccountOrganizations()
  const organization = organizations.find((candidate) => candidate.slug === slug)
  if (!organization) notFound()

  return (
    <main id="contenido" className="min-h-screen bg-zinc-100 px-5 py-12">
      <section className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
        <Link className="text-sm text-zinc-500 underline" href="/cuenta">← Tus organizaciones</Link>
        <p className="mt-10 font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">Client Console · primera rebanada</p>
        <h1 className="mt-3 text-4xl font-bold">{organization.name}</h1>
        <p className="mt-4 max-w-2xl leading-7 text-zinc-600">
          Tu cuenta ya está aislada y vinculada a esta organización. Los próximos módulos —proyectos,
          solicitudes, archivos y seguimiento— se añadirán sobre esta misma base sin mezclar datos de otros clientes.
        </p>
      </section>
    </main>
  )
}
