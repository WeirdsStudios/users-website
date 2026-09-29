import Link from "next/link"
import { listAccountOrganizations, requireAccountIdentity } from "@/lib/account-auth"
import { signOut } from "@/app/acceso/actions"

export default async function AccountPage() {
  const [identity, organizations] = await Promise.all([
    requireAccountIdentity(),
    listAccountOrganizations(),
  ])

  return (
    <main id="contenido" className="min-h-screen bg-zinc-950 px-5 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#4cfc0f]">USERS · cuenta</p>
            <h1 className="mt-2 text-3xl font-bold">Tus organizaciones</h1>
            <p className="mt-2 text-sm text-zinc-400">{identity.email}</p>
          </div>
          <form action={signOut}>
            <button className="rounded-lg border border-zinc-700 px-4 py-2 text-sm" type="submit">Salir</button>
          </form>
        </header>

        {organizations.length ? (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {organizations.map((organization) => (
              <li key={organization.id}>
                <Link
                  className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-[#4cfc0f]"
                  href={`/cuenta/${organization.slug}`}
                >
                  <p className="text-xl font-semibold">{organization.name}</p>
                  <p className="mt-3 text-sm text-zinc-400">Rol: {organization.role}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-300">
            Tu acceso está activo, pero todavía no hay una organización disponible.
          </p>
        )}
      </div>
    </main>
  )
}
