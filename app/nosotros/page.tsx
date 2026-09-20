import Link from "next/link"
import type { Metadata } from "next"
import Header from "@/components/site/Header"
import Footer from "@/components/site/Footer"
import ComoTrabajamos from "@/components/sections/ComoTrabajamos"
import { siteConfig, defaultOgImage } from "@/lib/site-config"
import { getWhatsAppLink } from "@/lib/whatsapp"
import { PROJECTS } from "@/lib/projects"

/**
 * Quiénes somos, para alguien que está por gastar dinero con nosotros.
 *
 * QUÉ NO ES: un "acerca de" de agencia. No hay historia fundacional, ni
 * misión y visión, ni fotos de stock de gente en una sala de juntas.
 *
 * QUÉ RESPONDE, en este orden: qué es USERS · por qué existe · cómo se compone
 * lo que construimos · cómo trabajamos · quién responde · por qué web ·
 * cómo un proyecto se vuelve producto · qué pasa después de publicar ·
 * en qué condiciones se trabaja.
 *
 * LA MARCA ES LA PROTAGONISTA. La persona aparece porque para este comprador
 * saber con quién va a hablar baja la ansiedad, no porque USERS sea el
 * portafolio de alguien. Por eso el bloque de la persona va a media página y
 * no arriba, y por eso no hay biografía.
 *
 * TODO DATO SALE DE siteConfig. Ninguna condición comercial se escribe aquí.
 */

const TITLE = "Nosotros — quién está detrás de USERS"
const DESCRIPTION =
  "USERS es un estudio mexicano de tecnología web: sitios, plataformas y aplicaciones construidas alrededor de cómo opera cada negocio. Quién responde, cómo trabajamos y en qué condiciones."

export const metadata: Metadata = {
  title: `${TITLE} | USERS`,
  description: DESCRIPTION,
  alternates: { canonical: "/nosotros" },
  openGraph: {
    images: [defaultOgImage],
    title: TITLE,
    description: DESCRIPTION,
    url: `${siteConfig.url}/nosotros`,
  },
}

/** Por qué web, en lenguaje de negocio y sin profecías. */
const WEB_FIRST = [
  {
    t: "Se abre desde el navegador",
    d: "Tu equipo y tus clientes entran desde computadora, tablet o celular sin descargar ni actualizar nada.",
  },
  {
    t: "Se actualiza en un solo lugar",
    d: "Publicamos una vez y todos ven la versión nueva. No hay que perseguir a nadie para que instale.",
  },
  {
    t: "Crece sin rehacerse",
    d: "La misma base que sostiene un sitio público sostiene después un portal, un panel o un punto de venta.",
  },
  {
    t: "Se instala cuando conviene",
    d: "Si el uso lo justifica, la aplicación puede quedar en la pantalla de inicio del teléfono y abrirse como cualquier otra.",
  },
]

export default function NosotrosPage() {
  const { terms, contact } = siteConfig
  const founder = { name: "Haza Munguía", role: "Estrategia y desarrollo" }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        name: TITLE,
        description: DESCRIPTION,
        url: `${siteConfig.url}/nosotros`,
        isPartOf: { "@type": "WebSite", name: siteConfig.wordmark, url: siteConfig.url },
        about: { "@type": "Organization", name: siteConfig.wordmark, url: siteConfig.url },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "Nosotros", item: `${siteConfig.url}/nosotros` },
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
              <span className="text-[#9E9E9E]">Nosotros</span>
            </nav>

            <h1 className="text-[1.85rem] sm:text-4xl lg:text-[3rem] font-bold leading-[1.12] mt-5 max-w-3xl text-balance tracking-tight">
              Construimos tecnología web que hace algo por tu negocio
            </h1>
            <p className="text-[#B0B0B0] text-[15px] lg:text-lg mt-4 lg:mt-5 max-w-2xl leading-relaxed">
              USERS es un estudio mexicano de desarrollo. Trabajamos con negocios
              que ya venden y necesitan profesionalizar una parte concreta de su
              operación: lo que ve el cliente, lo que el equipo usa por dentro, o
              las dos cosas.
            </p>
          </div>
        </header>

        {/* ── Por qué existimos ── */}
        <section aria-labelledby="por-que" className="py-12 lg:py-20 border-t border-[#1A1A1A]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 lg:grid lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#4cfc0f]">
                Por qué existimos
              </span>
              <h2 id="por-que" className="text-xl lg:text-2xl font-bold tracking-tight mt-3">
                Un sitio que solo informa deja el trabajo donde estaba
              </h2>
            </div>
            <div className="lg:col-span-7 mt-4 lg:mt-0">
              <p className="text-[#B0B0B0] text-[15px] lg:text-base leading-relaxed">
                La mayoría de los negocios con los que hablamos ya tiene presencia
                de algún tipo. Lo que no tiene es una que trabaje: siguen
                contestando los mismos mensajes, cotizando a mano y anotando en
                una hoja de cálculo lo que el sitio podría registrar solo.
              </p>
              <p className="text-[#B0B0B0] text-[15px] lg:text-base mt-3 leading-relaxed">
                Por eso el proyecto más pequeño que hacemos no es un folleto
                digital. Combina tres capas, y esa es la diferencia con comprar
                una página.
              </p>
            </div>
          </div>
        </section>

        {/* ── Presencia + Función + Control ── */}
        <section aria-labelledby="capas" className="py-12 lg:py-20 border-t border-[#1A1A1A]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 id="capas" className="text-xl lg:text-2xl font-bold tracking-tight max-w-xl">
              Presencia, función y control
            </h2>
            <ul className="grid sm:grid-cols-3 gap-px bg-[#1F1F1F] border border-[#1F1F1F] mt-6 lg:mt-10">
              {[
                { n: "01", t: "Presencia", d: "Lo que ve tu cliente cuando te busca y te encuentra." },
                { n: "02", t: "Función", d: "Algo útil que puede hacer ahí mismo: cotizar, reservar, pedir, consultar." },
                { n: "03", t: "Control", d: "Tu panel: las solicitudes que entran y el contenido clave, sin depender de nosotros." },
              ].map((c) => (
                <li key={c.n} className="bg-[#0A0A0A] p-5 lg:p-6">
                  <span className="font-mono text-[11px] tnum text-[#4cfc0f]">{c.n}</span>
                  <h3 className="text-lg font-bold mt-2">{c.t}</h3>
                  <p className="text-[#B0B0B0] text-sm mt-2 leading-relaxed">{c.d}</p>
                </li>
              ))}
            </ul>
            <p className="text-[#8A8A8A] text-sm mt-6 max-w-2xl leading-relaxed">
              Las tres están en todo proyecto. Lo que cambia entre niveles es
              hasta dónde llegan las dos últimas —{" "}
              <Link href="/#niveles" className="text-[#4cfc0f] hover:underline underline-offset-4">
                así se reparten en Web Activa, Plataforma y App a medida
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ── Cómo trabajamos: se reutiliza el componente de la home ── */}
        <div className="border-t border-[#1A1A1A]">
          <ComoTrabajamos />
        </div>

        {/* ── Quién responde ── */}
        <section
          aria-labelledby="quien-responde"
          className="py-12 lg:py-20 border-t border-[#1A1A1A]"
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">
            <div className="lg:col-span-7">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#4cfc0f]">
                Quién responde por tu proyecto
              </span>
              <h2
                id="quien-responde"
                className="text-xl lg:text-2xl font-bold tracking-tight mt-3"
              >
                Hablas directamente con quien lo construye
              </h2>
              <p className="text-[#B0B0B0] text-[15px] lg:text-base mt-4 leading-relaxed">
                No hay una cadena de vendedor, ejecutivo de cuenta y
                desarrollador. La persona que entiende tu negocio en la primera
                conversación es la misma que define qué se construye y responde
                por la entrega.
              </p>
              <p className="text-[#B0B0B0] text-[15px] lg:text-base mt-3 leading-relaxed">
                Para un proyecto de este tamaño eso no es un detalle: es lo que
                evita que el contexto se pierda entre personas y que lo acordado
                en una junta llegue distinto a quien programa.
              </p>
              <p className="text-[#8A8A8A] text-sm mt-4 leading-relaxed">
                USERS trabaja hoy con esta estructura. Cuando crezca, lo diremos
                aquí — no antes.
              </p>
            </div>

            <div className="lg:col-span-5 mt-6 lg:mt-0">
              <article className="bg-[#0E0E0E] border border-[#1F1F1F] p-5 sm:p-6">
                <span
                  className="relative w-14 h-14 flex items-center justify-center border border-[#2E2E2E] bg-[#111] overflow-hidden"
                  aria-hidden="true"
                >
                  <span className="grid-tech absolute inset-0 opacity-70" />
                  <span className="relative font-mono text-lg font-bold text-[#4cfc0f] tracking-wide">
                    HM
                  </span>
                </span>
                <h3 className="text-lg font-bold mt-4 leading-tight">{founder.name}</h3>
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#4cfc0f] mt-2">
                  {founder.role}
                </p>
                <p className="text-[#B0B0B0] text-sm mt-3 leading-relaxed">
                  Traduce el problema del negocio en qué se construye y en qué
                  orden.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ── Por qué web ── */}
        <section aria-labelledby="web-first" className="py-12 lg:py-20 border-t border-[#1A1A1A]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#4cfc0f]">
                Por qué web
              </span>
              <h2 id="web-first" className="text-xl lg:text-2xl font-bold tracking-tight mt-3">
                La misma base sostiene un sitio, un portal y un punto de venta
              </h2>
              <p className="text-[#B0B0B0] text-[15px] lg:text-base mt-4 leading-relaxed">
                Nos especializamos en tecnología web porque con ella podemos
                construir lo público y lo interno sin cambiar de mundo a medio
                camino. No es que lo demás esté mal: es que así el negocio puede
                empezar por una parte y sumar la siguiente sin tirar lo anterior.
              </p>
            </div>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1F1F1F] border border-[#1F1F1F] mt-6 lg:mt-10">
              {WEB_FIRST.map((w) => (
                <li key={w.t} className="bg-[#0A0A0A] p-5 lg:p-6">
                  <h3 className="text-[15px] font-bold leading-snug">{w.t}</h3>
                  <p className="text-[#B0B0B0] text-sm mt-2 leading-relaxed">{w.d}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Proyecto → producto ── */}
        <section aria-labelledby="producto" className="py-12 lg:py-20 border-t border-[#1A1A1A]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 lg:grid lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#4cfc0f]">
                De proyecto a producto
              </span>
              <h2 id="producto" className="text-xl lg:text-2xl font-bold tracking-tight mt-3">
                Cuando un giro se repite, lo convertimos en producto
              </h2>
            </div>
            <div className="lg:col-span-7 mt-4 lg:mt-0">
              <p className="text-[#B0B0B0] text-[15px] lg:text-base leading-relaxed">
                Trabajar con varios negocios del mismo sector deja ver los mismos
                problemas una y otra vez. Llega un punto en que reconstruir desde
                cero deja de tener sentido y lo aprendido se convierte en un
                producto propio.
              </p>
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1.5 mt-5 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.12em]">
                {["Proyecto de cliente", "Aprendizaje reutilizable", "Problema que se repite", "Producto USERS"].map(
                  (paso, i, arr) => (
                    <li key={paso} className="flex items-center gap-2">
                      <span className={i === arr.length - 1 ? "text-[#4cfc0f]" : "text-[#8A8A8A]"}>
                        {paso}
                      </span>
                      {i < arr.length - 1 && (
                        <span className="text-[#3A3A3A]" aria-hidden="true">→</span>
                      )}
                    </li>
                  )
                )}
              </ol>
              <p className="text-[#8A8A8A] text-sm mt-5 leading-relaxed">
                Hoy tenemos uno recorriendo ese camino:{" "}
                <Link href="/productos" className="text-[#4cfc0f] hover:underline underline-offset-4">
                  ACTIIVA
                </Link>
                , para negocios fitness. Está en desarrollo: no tiene fecha ni
                precio publicado, y no vamos a describir funciones que todavía no
                se pueden usar.
              </p>
            </div>
          </div>
        </section>

        {/* ── Evidencia ── */}
        <section aria-labelledby="evidencia" className="py-12 lg:py-20 border-t border-[#1A1A1A]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 id="evidencia" className="text-xl lg:text-2xl font-bold tracking-tight">
              Lo que ya construimos
            </h2>
            <ul className="grid sm:grid-cols-3 gap-px bg-[#1F1F1F] border border-[#1F1F1F] mt-6 lg:mt-8">
              {PROJECTS.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/proyectos/${p.slug}`}
                    className="group block bg-[#0A0A0A] p-5 lg:p-6 h-full transition-colors hover:bg-[#0E0E0E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#4cfc0f]"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8A8A8A]">
                      {p.industry}
                    </p>
                    <h3 className="text-lg font-bold mt-1.5 group-hover:text-[#4cfc0f] transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-[#B0B0B0] text-sm mt-2 leading-relaxed">{p.built}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Condiciones ──
            Todo sale de siteConfig.terms. Se publica aquí porque es lo que un
            comprador necesita saber antes de escribir, y hasta ahora solo
            respondía el Centro de Atención a quien preguntara. */}
        <section aria-labelledby="condiciones" className="py-12 lg:py-20 border-t border-[#1A1A1A]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#4cfc0f]">
                En qué condiciones
              </span>
              <h2 id="condiciones" className="text-xl lg:text-2xl font-bold tracking-tight mt-3">
                Lo que acordamos antes de empezar
              </h2>
            </div>

            <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1F1F1F] border border-[#1F1F1F] mt-6 lg:mt-10">
              <div className="bg-[#0E0E0E] p-5 lg:p-6">
                <dt className="text-[15px] font-bold">Pagos</dt>
                <dd className="text-[#B0B0B0] text-sm mt-2 leading-relaxed">
                  {terms.payment.label}. {terms.payment.note}
                </dd>
              </div>
              <div className="bg-[#0A0A0A] p-5 lg:p-6">
                <dt className="text-[15px] font-bold">Aprobación</dt>
                <dd className="text-[#B0B0B0] text-sm mt-2 leading-relaxed">
                  {terms.approvalGuarantee}
                </dd>
              </div>
              <div className="bg-[#0A0A0A] p-5 lg:p-6">
                <dt className="text-[15px] font-bold">Revisiones</dt>
                <dd className="text-[#B0B0B0] text-sm mt-2 leading-relaxed">
                  El alcance acordado incluye {terms.revisionRounds} rondas de
                  revisión. {terms.scopeChanges}
                </dd>
              </div>
              <div className="bg-[#0A0A0A] p-5 lg:p-6">
                <dt className="text-[15px] font-bold">Por escrito</dt>
                <dd className="text-[#B0B0B0] text-sm mt-2 leading-relaxed">
                  {terms.writtenScope}
                </dd>
              </div>
              <div className="bg-[#0A0A0A] p-5 lg:p-6">
                <dt className="text-[15px] font-bold">El proyecto es tuyo</dt>
                <dd className="text-[#B0B0B0] text-sm mt-2 leading-relaxed">{terms.ownership}</dd>
              </div>
              <div className="bg-[#0A0A0A] p-5 lg:p-6">
                <dt className="text-[15px] font-bold">Después de publicar</dt>
                <dd className="text-[#B0B0B0] text-sm mt-2 leading-relaxed">
                  Incluye soporte el primer mes. Los planes de seguimiento son
                  opcionales y se pueden cancelar —{" "}
                  <Link
                    href="/#soporte"
                    className="text-[#4cfc0f] hover:underline underline-offset-4"
                  >
                    así funciona el seguimiento
                  </Link>
                  .
                </dd>
              </div>
            </dl>

            <p className="text-[#8A8A8A] text-sm mt-6 max-w-2xl leading-relaxed">
              {siteConfig.infrastructure.includedFirstYear} en Web Activa.{" "}
              {siteConfig.infrastructure.clarification}
            </p>
          </div>
        </section>

        {/* ── Cierre ── */}
        <section
          aria-labelledby="cierre-nosotros"
          className="py-12 lg:py-20 border-t border-[#1A1A1A]"
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2
              id="cierre-nosotros"
              className="text-[1.6rem] sm:text-3xl font-bold tracking-tight text-balance max-w-2xl"
            >
              ¿Quieres ver qué te conviene construir primero?
            </h2>
            <p className="text-[#B0B0B0] text-[15px] lg:text-lg mt-4 max-w-2xl leading-relaxed">
              El análisis te da un punto de partida en unos minutos, sin hablar
              con nadie hasta que tú quieras.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              <Link
                href="/analisis"
                className="group bg-[#4cfc0f] text-black font-bold px-6 py-4 text-[15px] inline-flex items-center justify-center gap-2.5 transition-all hover:shadow-[0_0_32px_rgba(76,252,15,0.4)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Analizar mi negocio
                <span className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
              </Link>
              <Link
                href="/contacto"
                className="border border-[#2E2E2E] text-white font-semibold px-6 py-4 text-[15px] inline-flex items-center justify-center gap-2.5 transition-colors hover:border-[#4cfc0f] hover:text-[#4cfc0f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4cfc0f]"
              >
                Hablar con USERS
              </Link>
            </div>
            <p className="text-[#8A8A8A] text-sm mt-6">
              {contact.hours} · {contact.city} ·{" "}
              <a
                href={getWhatsAppLink("default")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#4cfc0f] transition-colors underline underline-offset-4"
              >
                WhatsApp
              </a>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
