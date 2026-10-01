import Link from "next/link"
import AccessForm from "./AccessForm"

export default async function AccessPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const params = await searchParams
  const next = params.next === "/admin" || params.next === "/crm" ? "/admin" : "/cuenta"
  const initialMessage = params.error === "enlace-invalido"
    ? "El enlace venció o ya fue utilizado. Solicita una nueva invitación."
    : undefined

  return (
    <main id="contenido" className="min-h-screen bg-zinc-950 px-5 py-16 text-white">
      <section className="mx-auto max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-7 shadow-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#4cfc0f]">
          USERS · acceso seguro
        </p>
        <h1 className="mt-4 text-3xl font-bold">Tu cuenta</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Acceso exclusivo para clientes y personal autorizado de USERS.
        </p>
        <AccessForm next={next} initialMessage={initialMessage} />
        <Link className="mt-6 inline-block text-sm text-zinc-400 underline" href="/">
          Volver a users.mx
        </Link>
      </section>
    </main>
  )
}
