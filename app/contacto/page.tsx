import Link from "next/link"
import type { Metadata } from "next"
import Header from "@/components/site/Header"
import Footer from "@/components/site/Footer"
import { siteConfig, defaultOgImage } from "@/lib/site-config"
import { getWhatsAppLink } from "@/lib/whatsapp"

/**
 * Contacto, organizado por intención y no por formulario.
 *
 * POR QUÉ NO HAY FORMULARIO LARGO: el sitio ya tiene dos mecanismos que
 * funcionan —el Motor, que además devuelve algo útil, y WhatsApp, que es donde
 * este comprador ya conversa—. Un formulario genérico de "nombre, empresa,
 * mensaje" no añade nada: pide más y devuelve menos.
 *
 * Las tres rutas están ordenadas por qué tan definido tiene el visitante lo
 * que necesita, no por lo que a nosotros nos conviene.
 *
 * SIN PROMESAS DE TIEMPO. No hay ningún tiempo de respuesta documentado, así
 * que se muestra el horario de atención humana —que sí está definido en
 * siteConfig— y nada más. Prometer "respondemos en 24 h" sin poder sostenerlo
 * es la clase de promesa que el resto del sitio evita.
 */

const TITLE = "Contacto — hablemos de lo que necesitas"
const DESCRIPTION =
  "Tres formas de empezar con USERS: el análisis gratuito si todavía no tienes claro qué necesitas, WhatsApp si ya lo sabes, o correo. Desarrollo web, plataformas y aplicaciones en México."

export const metadata: Metadata = {
  title: `${TITLE} | USERS`,
  description: DESCRIPTION,
  alternates: { canonical: "/contacto" },
  openGraph: {
    images: [defaultOgImage],
    title: TITLE,
    description: DESCRIPTION,
    url: `${siteConfig.url}/contacto`,
  },
}

/**
 * Qué pasa después de escribir.
 *
 * Los cuatro pasos describen el proceso que ya existe —el paso 1 de
 * ComoTrabajamos es "hablamos de tu negocio antes de proponer nada"— sin
 * añadir plazos, llamadas gratuitas ni número de propuestas.
 */
const DESPUES = [
  { n: "01", t: "Nos cuentas qué necesitas", d: "Por el canal que prefieras. Si ya hiciste el análisis, con la referencia basta." },
  { n: "02", t: "Revisamos si USERS encaja", d: "A veces la respuesta honesta es que todavía no necesitas construir nada, y lo decimos." },
  { n: "03", t: "Definimos el alcance inicial", d: "Qué entra, qué no y por dónde conviene empezar." },
  { n: "04", t: "Recibes una propuesta", d: "Con el alcance, los tiempos y las condiciones por escrito." },
]

export default function ContactoPage() {
  const { contact, terms } = siteConfig

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        name: TITLE,
        description: DESCRIPTION,
        url: `${siteConfig.url}/contacto`,
        isPartOf: { "@type": "WebSite", name: siteConfig.wordmark, url: siteConfig.url },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "Contacto", item: `${siteConfig.url}/contacto` },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main id="contenido" className="bg-[#0A0A0A] text-white">
        {/* ── Encabezado ── */}
        <header className="relative pt-28 pb-10 lg:pt-36 lg:pb-14 overflow-hidden">
          <div
            aria-hidden="true"
            className="grid-tech absolute inset-0 pointer-events-none"
            style={{
              maskImage: "radial-gradient(ellipse 90% 60% at 50% 0%, #000 30%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 90% 60% at 50% 0%, #000 30%, transparent 100%)",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <nav aria-label="Ruta de navegación" className="font-mono text-[11px] text-[#8A8A8A]">
              <Link href="/" className="hover:text-white transition-colors py-1.5 inline-block">
                Inicio
              </Link>
              <span className="mx-2" aria-hidden="true">/</span>
              <span className="text-[#9E9E9E]">Contacto</span>
            </nav>

            <h1 className="text-[1.85rem] sm:text-4xl lg:text-[3rem] font-bold leading-[1.12] mt-5 max-w-3xl text-balance tracking-tight">
              Hablemos de lo que necesitas
            </h1>
            <p className="text-[#B0B0B0] text-[15px] lg:text-lg mt-4 lg:mt-5 max-w-2xl leading-relaxed">
              Elige por dónde te acomoda empezar. No hay formulario largo ni
              filtro de ventas: las tres rutas llegan a la misma persona.
            </p>
          </div>
        </header>

        {/* ── Las tres rutas ── */}
        <section aria-labelledby="rutas" className="py-10 lg:py-16 border-t border-[#1A1A1A]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 id="rutas" className="sr-only">
              Formas de contactar a USERS
            </h2>

            <ul className="grid lg:grid-cols-3 gap-px bg-[#1F1F1F] border border-[#1F1F1F]">
              {/* A — todavía no sabe qué necesita */}
              <li className="bg-[#0E0E0E] p-5 sm:p-6 lg:p-7 flex flex-col relative corner-marks">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#8A8A8A]">
                    01
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#4cfc0f] border border-[#4cfc0f]/30 px-2 py-1">
                    Recomendado
                  </span>
                </div>
                <h3 className="text-xl font-bold mt-4 tracking-tight">
                  Todavía no sé qué necesito
                </h3>
                <p className="text-[#B0B0B0] text-sm mt-3 leading-relaxed flex-1">
                  Contesta 5 pasos sobre tu negocio y recibe un diagnóstico con
                  prioridades, qué conviene construir primero y desde dónde parte
                  la inversión. Sin registro y sin hablar con nadie.
                </p>
                <Link
                  href="/analisis"
                  className="group bg-[#4cfc0f] text-black font-bold px-5 py-3.5 text-sm inline-flex items-center justify-center gap-2 mt-6 transition-all hover:shadow-[0_0_28px_rgba(76,252,15,0.35)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Analizar mi negocio
                  <span className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
                </Link>
                <p className="font-mono text-[11px] text-[#8A8A8A] mt-3">Gratis · 12 preguntas</p>
              </li>

              {/* B — ya sabe */}
              <li className="bg-[#0A0A0A] p-5 sm:p-6 lg:p-7 flex flex-col">
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#8A8A8A]">
                  02
                </span>
                <h3 className="text-xl font-bold mt-4 tracking-tight">Ya sé qué necesito</h3>
                <p className="text-[#B0B0B0] text-sm mt-3 leading-relaxed flex-1">
                  Cuéntanos qué tienes en mente y te decimos si podemos ayudarte
                  y cómo. Es el camino más rápido si ya tienes claro el problema.
                </p>
                <a
                  href={getWhatsAppLink("contacto")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-[#2E2E2E] text-white font-semibold px-5 py-3.5 text-sm inline-flex items-center justify-center gap-2 mt-6 transition-colors hover:border-[#4cfc0f] hover:text-[#4cfc0f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4cfc0f]"
                >
                  Escribir por WhatsApp
                </a>
                <p className="font-mono text-[11px] text-[#8A8A8A] mt-3">
                  {contact.whatsappDisplay}
                </p>
              </li>

              {/* C — correo */}
              <li className="bg-[#0A0A0A] p-5 sm:p-6 lg:p-7 flex flex-col">
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#8A8A8A]">
                  03
                </span>
                <h3 className="text-xl font-bold mt-4 tracking-tight">Prefiero correo</h3>
                <p className="text-[#B0B0B0] text-sm mt-3 leading-relaxed flex-1">
                  Si tienes un documento, un brief o simplemente prefieres
                  escribir con calma, este es el canal.
                </p>
                <a
                  href={`mailto:${contact.email}`}
                  className="border border-[#2E2E2E] text-white font-semibold px-5 py-3.5 text-sm inline-flex items-center justify-center gap-2 mt-6 transition-colors hover:border-[#4cfc0f] hover:text-[#4cfc0f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4cfc0f]"
                >
                  {contact.email}
                </a>
                <p className="font-mono text-[11px] text-[#8A8A8A] mt-3">{contact.city}, México</p>
              </li>
            </ul>
          </div>
        </section>

        {/* ── Qué pasa después ── */}
        <section aria-labelledby="despues" className="py-12 lg:py-20 border-t border-[#1A1A1A]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 lg:grid lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#4cfc0f]">
                Sin sorpresas
              </span>
              <h2 id="despues" className="text-xl lg:text-2xl font-bold tracking-tight mt-3">
                Qué pasa después de escribir
              </h2>
              <p className="text-[#8A8A8A] text-sm mt-4 leading-relaxed">
                Atendemos {contact.supportDaysLabel.toLowerCase()} de{" "}
                {contact.supportHours.from} a {contact.supportHours.to} h, hora
                del centro de México. Fuera de ese horario tu mensaje queda
                registrado y lo retomamos al abrir.
              </p>
            </div>

            <ol className="lg:col-span-8 mt-6 lg:mt-0 border-t border-[#1F1F1F]">
              {DESPUES.map((paso) => (
                <li
                  key={paso.n}
                  className="border-b border-[#1F1F1F] py-4 flex items-baseline gap-4"
                >
                  <span className="font-mono text-[11px] tnum text-[#4cfc0f] w-6 shrink-0">
                    {paso.n}
                  </span>
                  <div>
                    <h3 className="text-[15px] font-bold leading-snug">{paso.t}</h3>
                    <p className="text-[#B0B0B0] text-sm mt-1 leading-relaxed">{paso.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Condiciones, resumidas ──
            Quien llega aquí está a un mensaje de escribir: las dudas que lo
            frenan son estas tres. Todo sale de siteConfig.terms. */}
        <section aria-labelledby="condiciones-contacto" className="py-12 lg:py-16 border-t border-[#1A1A1A]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2
              id="condiciones-contacto"
              className="text-xl lg:text-2xl font-bold tracking-tight"
            >
              Antes de que preguntes
            </h2>
            <dl className="grid sm:grid-cols-3 gap-px bg-[#1F1F1F] border border-[#1F1F1F] mt-6">
              <div className="bg-[#0A0A0A] p-5 lg:p-6">
                <dt className="text-[15px] font-bold">¿Cómo se paga?</dt>
                <dd className="text-[#B0B0B0] text-sm mt-2 leading-relaxed">
                  {terms.payment.label}. {terms.payment.note}
                </dd>
              </div>
              <div className="bg-[#0A0A0A] p-5 lg:p-6">
                <dt className="text-[15px] font-bold">¿Desde cuánto?</dt>
                <dd className="text-[#B0B0B0] text-sm mt-2 leading-relaxed">
                  Web Activa desde {siteConfig.pricing.offerLabel("web-activa")}.{" "}
                  <Link
                    href="/#niveles"
                    className="text-[#4cfc0f] hover:underline underline-offset-4"
                  >
                    Ver los tres niveles
                  </Link>
                  .
                </dd>
              </div>
              <div className="bg-[#0A0A0A] p-5 lg:p-6">
                <dt className="text-[15px] font-bold">¿Con quién hablo?</dt>
                <dd className="text-[#B0B0B0] text-sm mt-2 leading-relaxed">
                  Con quien construye el proyecto, no con un intermediario —{" "}
                  <Link
                    href="/nosotros"
                    className="text-[#4cfc0f] hover:underline underline-offset-4"
                  >
                    quiénes somos
                  </Link>
                  .
                </dd>
              </div>
            </dl>

            <p className="text-[#8A8A8A] text-sm mt-6 max-w-2xl leading-relaxed">
              ¿Ya eres cliente y necesitas ayuda con un proyecto existente? El{" "}
              <Link
                href="/centro-de-atencion"
                className="text-[#4cfc0f] hover:underline underline-offset-4"
              >
                Centro de Atención
              </Link>{" "}
              responde a cualquier hora.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
