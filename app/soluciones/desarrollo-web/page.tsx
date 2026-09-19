import Link from "next/link"
import type { Metadata } from "next"
import {
  Header,
  Footer,
  SolutionBreadcrumbJsonLd,
  SolutionHeader,
  EvidenceCard,
  SolutionFaq,
  SolutionFooterNav,
} from "@/components/solutions/SolutionShell"
import { getSolution } from "@/lib/solutions"
import { siteConfig, defaultOgImage } from "@/lib/site-config"

const solution = getSolution("desarrollo-web")!

export const metadata: Metadata = {
  title: solution.metaTitle,
  description: solution.metaDescription,
  alternates: { canonical: `/soluciones/${solution.slug}` },
  openGraph: {
      images: [defaultOgImage],
    title: solution.metaTitle,
    description: solution.metaDescription,
    url: `/soluciones/${solution.slug}`,
  },
}

/**
 * Estructura propia: formas que toma una Web Activa → qué la hace activa →
 * evidencia → precio.
 *
 * EL EJE CAMBIÓ. Antes esta página decía "una web puede ser la primera capa":
 * primero el sitio, las herramientas después. Ese principio quedó atrás. El
 * proyecto más pequeño de USERS ya incluye presencia, una función acotada y
 * el panel para administrarla.
 *
 * Lo que sigue separando esta página de software-a-medida no es el tamaño del
 * sitio, sino de dónde parte el visitante: aquí llega pidiendo una página,
 * allá ya sabe que necesita una aplicación construida sobre su proceso.
 */
const tipos = [
  {
    n: "01",
    name: "Sitio corporativo",
    body: "Explica el negocio, muestra servicios y genera contacto. Es el punto de llegada de quien te buscó en Google o recibió tu tarjeta.",
  },
  {
    n: "02",
    name: "Landing page",
    body: "Una sola página enfocada en una campaña o un servicio. Útil cuando envías tráfico de anuncios y necesitas medir qué convierte.",
  },
  {
    n: "03",
    name: "Catálogo digital",
    body: "Tu inventario o tus servicios navegables, sin necesidad de vender en línea. Muchos negocios necesitan mostrar, no cobrar.",
  },
  {
    n: "04",
    name: "Tienda en línea",
    body: "Cuando el negocio sí vende directo y necesita carrito, pagos y control de pedidos.",
  },
]

export default function DesarrolloWebPage() {
  return (
    <>
      <SolutionBreadcrumbJsonLd solution={solution} />
      <Header />
      <main className="bg-[#0A0A0A] text-white">
        <SolutionHeader
          solution={solution}
          eyebrow="Web Activa"
          h1="Desarrollo web para negocios que necesitan algo más que una página bonita"
          lede="Para negocios mexicanos que ya venden y necesitan que su sitio trabaje. Toda web que entregamos sale activa: explica el negocio, resuelve algo concreto para tu cliente y te deja un panel para administrarla."
          proof={
            /* Tráfico frío de campaña abandona cuando no sabe si el precio
               está en su rango. El ancla va aquí, en el primer viewport, no
               solo en la sección de precio que está a tres pantallas. */
            <p className="font-mono text-[11px] text-[#8A8A8A] leading-relaxed">
              Desde{" "}
              <span className="text-white">{siteConfig.pricing.startingPriceLabel}</span>{" "}
              · Greek Gym y Las Frescas empezaron aquí ·{" "}
              <Link
                href="/proyectos"
                className="text-[#4cfc0f] hover:underline underline-offset-4 py-1.5 inline-block"
              >
                ver los casos
              </Link>
            </p>
          }
        />

        {/* Qué construimos */}
        <section aria-labelledby="tipos" className="py-12 lg:py-20 border-t border-[#1A1A1A]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 id="tipos" className="text-xl lg:text-2xl font-bold tracking-tight max-w-xl">
              Qué forma toma, según lo que el negocio necesite
            </h2>
            <ul className="mt-6 lg:mt-10 grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1F1F1F] border border-[#1F1F1F]">
              {tipos.map((tipo) => (
                <li key={tipo.n} className="bg-[#0A0A0A] p-5 lg:p-6">
                  <span className="font-mono text-[11px] tnum text-[#4cfc0f]">{tipo.n}</span>
                  <h3 className="text-lg font-bold mt-2">{tipo.name}</h3>
                  <p className="text-[#B0B0B0] text-sm mt-2 leading-relaxed">{tipo.body}</p>
                </li>
              ))}
            </ul>
            <p className="text-[#8A8A8A] text-sm mt-6 max-w-2xl leading-relaxed">
              En todos los casos incluimos la estructura de contenido, el diseño,
              el desarrollo, la base técnica de SEO y analítica, una herramienta
              funcional acotada, tu panel de administración y{" "}
              {siteConfig.infrastructure.includedFirstYear.toLowerCase()}. Las
              integraciones —pagos, reservas, correo, herramientas que ya uses—
              se definen según el proyecto.
            </p>
          </div>
        </section>

        {/* La web como primera capa: el argumento que diferencia esta página */}
        <section aria-labelledby="primera-capa" className="py-12 lg:py-20 border-t border-[#1A1A1A]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 lg:grid lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <h2 id="primera-capa" className="text-xl lg:text-2xl font-bold tracking-tight">
                Toda web que entregamos sale activa
              </h2>
              <p className="text-[#B0B0B0] text-[15px] lg:text-base mt-4 leading-relaxed">
                Antes el camino era: primero el sitio, las herramientas después.
                Ya no trabajamos así. Un sitio que solo informa deja el trabajo
                donde estaba —contestando los mismos mensajes— y obliga a una
                segunda inversión para resolver lo que ya dolía.
              </p>
              <p className="text-[#B0B0B0] text-[15px] lg:text-base mt-3 leading-relaxed">
                Por eso el proyecto más pequeño que hacemos ya incluye las tres
                capas. Lo que se define contigo es cuál es esa función y hasta
                dónde llega.
              </p>
            </div>

            <div className="lg:col-span-7 mt-6 lg:mt-0">
              <ol className="border-t border-[#1F1F1F]">
                {[
                  {
                    s: "Presencia",
                    t: "Un sitio que explica el negocio, se encuentra en Google y genera contacto.",
                  },
                  {
                    s: "Función",
                    t: "Una herramienta acotada que resuelve lo que hoy se pregunta por mensaje.",
                  },
                  {
                    s: "Control",
                    t: "Tu panel: las solicitudes que entran, el contenido clave y la actividad del sitio.",
                  },
                ].map((step, i) => (
                  <li
                    key={step.s}
                    className="border-b border-[#1F1F1F] py-4 flex items-baseline gap-4"
                  >
                    <span className="font-mono text-[11px] tnum text-[#4cfc0f] w-6 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8A8A8A] w-20 shrink-0">
                      {step.s}
                    </span>
                    <span className="text-[#B0B0B0] text-sm leading-relaxed">{step.t}</span>
                  </li>
                ))}
              </ol>

              <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8A8A8A] mt-6">
                La herramienta incluida puede ser
              </h3>
              <ul className="flex flex-wrap gap-1.5 mt-3">
                {[
                  "Cotizador sencillo",
                  "Solicitud de cita o reserva",
                  "Formulario inteligente",
                  "Catálogo administrable",
                  "Configurador simple",
                  "Flujo de pedidos",
                  "Calculadora",
                  "Calificación de prospectos",
                ].map((t) => (
                  <li
                    key={t}
                    className="border border-[#2A2A2A] px-2.5 py-1.5 text-[13px] text-[#B0B0B0]"
                  >
                    {t}
                  </li>
                ))}
              </ul>
              <p className="text-[#8A8A8A] text-sm mt-4 leading-relaxed">
                Se incluye <strong className="text-white">una</strong>, elegida
                contigo al definir el proyecto. Sumar más herramientas,
                integraciones o complejidad se cotiza aparte.
              </p>
            </div>
          </div>
        </section>

        {/* Evidencia */}
        <section aria-labelledby="evidencia-web" className="py-12 lg:py-20 border-t border-[#1A1A1A]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 id="evidencia-web" className="text-xl lg:text-2xl font-bold tracking-tight">
              Webs que ya están funcionando
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-6">
              <EvidenceCard
                slug="greek-gym"
                name="Greek Gym"
                claim="Sitio público con dos sucursales"
                detail="Disciplinas, coaches y planes de membresía de dos ubicaciones distintas, en un sitio que después se conectó con su sistema interno."
              />
              <EvidenceCard
                slug="las-frescas"
                name="Las Frescas"
                claim="Sitio + herramienta comercial"
                detail="Además de explicar el servicio, el sitio incorpora un cotizador que estructura la solicitud antes de que empiece la conversación."
              />
            </div>
          </div>
        </section>

        {/* Precio */}
        <section aria-labelledby="precio-web" className="py-12 lg:py-20 border-t border-[#1A1A1A]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 lg:grid lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <h2 id="precio-web" className="text-xl lg:text-2xl font-bold tracking-tight">
                Cuánto cuesta
              </h2>
            </div>
            <div className="lg:col-span-8 mt-4 lg:mt-0">
              <p className="text-2xl lg:text-3xl font-bold">
                Web Activa desde{" "}
                <span className="text-[#4cfc0f]">{siteConfig.pricing.startingPriceLabel}</span>
              </p>
              <p className="text-[#B0B0B0] text-[15px] mt-3 leading-relaxed max-w-prose">
                Ese es el punto de entrada, no el precio de cualquier sitio. El
                costo final depende del contenido, del número de secciones, de
                la herramienta que se incluya y de las integraciones que
                necesite. Una landing y una tienda en línea no cuestan lo mismo.
              </p>
              <p className="text-[#8A8A8A] text-sm mt-3 leading-relaxed max-w-prose">
                {siteConfig.offers[0].notIncluded}
              </p>

              {/* Qué pasa con dominio y hosting: política, no ambigüedad. */}
              <div className="border border-[#1F1F1F] bg-[#0E0E0E] p-4 lg:p-5 mt-5 max-w-prose">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#4cfc0f]">
                  Dominio y hosting
                </h3>
                <p className="text-[#B0B0B0] text-sm mt-2.5 leading-relaxed">
                  {siteConfig.infrastructure.includedFirstYear}. Al terminar ese
                  año puedes seguir con el plan de seguimiento (
                  {siteConfig.pricing.maintenanceFromLabel}) o hacerte cargo del
                  dominio y el hosting por tu cuenta.
                </p>
                <p className="text-[#8A8A8A] text-[13px] mt-2.5 leading-relaxed">
                  {siteConfig.infrastructure.clarification}
                </p>
              </div>

              <p className="text-[#8A8A8A] text-sm mt-5 leading-relaxed max-w-prose">
                El{" "}
                <Link href="/analisis" className="text-[#4cfc0f] hover:underline underline-offset-4">
                  Motor de Análisis
                </Link>{" "}
                te dice por dónde conviene empezar con tus datos, en unos
                minutos y sin hablar con nadie.
              </p>
            </div>
          </div>
        </section>

        <SolutionFaq
          items={[
            {
              q: "¿Cuánto tarda un sitio web?",
              a: "Un sitio informativo suele tomar entre 3 y 5 semanas. Si lleva cotizador, reservas o alguna integración, entre 6 y 14 semanas. Lo definimos con precisión en la propuesta, después del análisis.",
            },
            {
              q: "¿Puedo empezar con una web y crecer después?",
              a: (
                <>
                  Sí, y es el camino más común. Tu Web Activa ya incluye una
                  herramienta y tu panel; a partir de ahí se pueden sumar
                  cuentas de usuario, reservas, inventario o punto de venta sin
                  rehacer lo construido. Cuando el proceso del negocio es lo que
                  hay que sostener, el paso siguiente es una{" "}
                  <Link
                    href="/soluciones/software-a-medida"
                    className="text-[#4cfc0f] hover:underline underline-offset-4"
                  >
                    app a medida
                  </Link>
                  .
                </>
              ),
            },
            {
              q: "¿Qué puedo administrar desde mi panel?",
              a: "Las solicitudes que entran por el sitio, la herramienta que se incluyó y el contenido clave que definimos contigo al arrancar —los textos y secciones que de verdad cambian—, además de la actividad básica del sitio. No es un editor de cada pixel de la página: es el control de lo que un negocio necesita mover sin depender de nosotros.",
            },
            {
              q: "¿Quién escribe los textos y consigue las fotos?",
              a: "Nosotros definimos la estructura y qué debe decir cada sección; tú aportas la información del negocio. Si no tienes textos ni fotos listas, lo resolvemos juntos durante el proceso — no necesitas tenerlo todo desde el día uno.",
            },
            {
              q: "¿El sitio va a aparecer en Google?",
              a: "Entregamos la base técnica que Google necesita: estructura, metadatos, velocidad, versión móvil y sitemap. Aparecer en los primeros lugares depende además de la competencia de tu sector y del trabajo de contenido posterior, que es un esfuerzo continuo y no una casilla que se marca al lanzar.",
            },
          ]}
        />

        <SolutionFooterNav current={solution.slug} />
      </main>
      <Footer />
    </>
  )
}
