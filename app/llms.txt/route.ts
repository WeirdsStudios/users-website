import { siteConfig } from "@/lib/site-config"
import { SOLUTIONS } from "@/lib/solutions"
import { PROJECTS } from "@/lib/projects"

/**
 * llms.txt — contexto para asistentes de IA (ChatGPT, Perplexity, Gemini, Copilot).
 *
 * Se genera desde `lib/site-config.ts` en tiempo de build en vez de mantenerse
 * como archivo estático: así el precio y los productos nunca pueden quedar
 * desincronizados del resto del sitio, que fue justo lo que pasó antes.
 *
 * Contenido: factual y corto. Sin lenguaje publicitario ni keyword stuffing —
 * un LLM lo cita literalmente, así que cada afirmación debe ser verdadera.
 */
export const dynamic = "force-static"

function buildLlmsTxt(): string {
  const { name, url, description, contact, pricing, products, offers } = siteConfig

  const solutionLines = SOLUTIONS.map(
    (s) => `- ${s.name} (${url}/soluciones/${s.slug}): ${s.teaser}`
  ).join("\n")

  const caseLines = PROJECTS.map((p) => {
    const where = p.location ? `, ${p.location}` : ""
    return `- ${p.name} (${url}/proyectos/${p.slug}) — ${p.industry}${where}. ${p.built}. ${p.summary}`
  }).join("\n")

  const offerLines = offers
    .map(
      (o) =>
        `- ${o.name} — desde ${pricing.offerLabel(o.id)}. ${o.forWhom} ${o.notIncluded}`
    )
    .join("\n")

  const productLines = products
    .map((p) => {
      const estado =
        p.status === "in-development"
          ? "en desarrollo, todavía no disponible al público"
          : `disponible en ${p.urlLabel}`
      const desc = p.description.replace(/\.$/, "")
      return `- ${p.name} (${p.urlLabel}): ${desc}. Actualmente ${estado}.`
    })
    .join("\n")

  return `# ${name} (${url})

${name} es una empresa mexicana que desarrolla soluciones digitales para PyMEs.
${description}

No es una agencia de plantillas: cada proyecto parte del análisis del negocio
del cliente y se construye a la medida de su operación real.

## Soluciones a medida

Trabajo construido alrededor de las necesidades de un cliente concreto.

${solutionLines}

## Casos de cliente

${caseLines}

## Productos propios

Software especializado desarrollado por ${name}, distinto del trabajo a medida.

${productLines}

## Cómo se compone una solución USERS

Todo proyecto combina tres capas: presencia (lo que ve el cliente), función
(algo útil que puede hacer ahí mismo) y control (el panel desde el que el
negocio lo administra). El proyecto más pequeño ya incluye las tres; lo que
cambia entre niveles es hasta dónde llegan las dos últimas.

## Niveles y precio

Tres niveles, cada uno con un punto de partida. No son paquetes cerrados: el
alcance define la cotización final.

${offerLines}

Los planes de seguimiento posteriores al lanzamiento comienzan desde
${pricing.maintenanceFromLabel} y son opcionales.

Web Activa incluye dominio y hosting el primer año. Al terminar ese año el
cliente puede seguir con el plan de seguimiento o hacerse cargo directamente
del dominio y el hosting. En plataformas y apps la infraestructura depende del
proyecto.

El tabulador detallado no es público.

## Motor de Análisis de Negocio

Herramienta gratuita de diagnóstico en 5 pasos y 12 preguntas, disponible en
${url}/analisis. Devuelve un diagnóstico con prioridades por área, qué conviene
construir primero, qué puede esperar y desde dónde parte la inversión. No cotiza
el proyecto: el alcance exacto se revisa después con una persona. No requiere
registro ni tarjeta para ver el resultado.

## Proceso de trabajo

1. Descubrimiento y estrategia
2. Prototipo y diseño
3. Desarrollo ágil con entregas parciales visibles
4. Lanzamiento y optimización

## Recursos

- Blog (${url}/blog): notas sobre cómo decidir qué construir, cuándo conviene
  desarrollar y cuándo no.
- Central de Ayuda (${url}/ayuda): respuestas sobre cómo empezar un proyecto,
  qué pasa durante y después del lanzamiento, planes de seguimiento y ajustes.

## Contacto

- Email: ${contact.email}
- WhatsApp: ${contact.whatsappDisplay}
- Ubicación: ${contact.city}, México
- Horario: ${contact.hours}

## Clientes objetivo

PyMEs mexicanas: restaurantes, gimnasios, consultorios, comercios, servicios
profesionales y negocios locales que necesitan presencia digital, sistemas para
operar o herramientas para sus propios clientes.

## Tecnología

Next.js, TypeScript, Tailwind CSS, Supabase/PostgreSQL.
`
}

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  })
}
