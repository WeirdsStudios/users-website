import { requireAccountIdentity } from "@/lib/account-auth"
import SetupForm from "./SetupForm"

export default async function AccountSetupPage() {
  const identity = await requireAccountIdentity()
  return (
    <main id="contenido" className="min-h-screen bg-zinc-100 px-5 py-16">
      <section className="mx-auto max-w-md rounded-2xl bg-white p-7 shadow-sm">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
          Invitación para {identity.email}
        </p>
        <h1 className="mt-4 text-3xl font-bold">Activa tu cuenta</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Define tu contraseña para entrar al dashboard de tu organización.
        </p>
        <SetupForm />
      </section>
    </main>
  )
}
