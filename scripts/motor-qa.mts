/**
 * Banco del Motor de Análisis.
 *
 *   npx tsx scripts/motor-qa.mts
 *
 * Comprueba lo que un formulario no enseña a simple vista: que dos negocios
 * distintos reciban diagnósticos distintos, que nada se invente, y que los
 * ingresos ajusten el alcance sin decidir el diagnóstico.
 */
import { diagnose } from "@/lib/motor/diagnose"
import type { Answers } from "@/lib/motor/questions"
import { QUESTIONS } from "@/lib/motor/questions"
import { STATE_LABEL } from "@/lib/motor/types"
import { siteConfig, getOffer, type OfferId } from "@/lib/site-config"

const asArrayLen = (v: string | string[] | undefined): number =>
  Array.isArray(v) ? v.filter((x) => x !== "ninguno").length : v && v !== "ninguno" ? 1 : 0

let pass = 0
let fail = 0
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) {
    pass++
    console.log(`  ok    ${name}`)
  } else {
    fail++
    console.log(`  FAIL  ${name}${detail ? `\n        ${detail}` : ""}`)
  }
}

// ── 20 perfiles sintéticos ───────────────────────────────────────────────────
const perfiles: { nombre: string; a: Answers }[] = [
  {
    nombre: "1. Restaurante sin web",
    a: { businessName: "N", industry: "restaurante", size: "2-5", revenue: "50k-150k",
      hasWebsite: "no", acquisition: ["recomendacion", "local"], closeProcess: "manual-todo",
      manualWork: ["agenda", "cobros"], tools: "papel", customerAsks: ["horarios", "catalogo"],
      priority: "vender-mas", timeline: "normal" },
  },
  {
    nombre: "2. Restaurante con web, reservas a mano",
    a: { businessName: "N", industry: "restaurante", size: "6-20", revenue: "150k-500k",
      hasWebsite: "si", acquisition: ["google", "redes"], closeProcess: "manual-cotiza",
      manualWork: ["agenda", "clientes"], tools: "excel", customerAsks: ["disponibilidad"],
      priority: "atender-mejor", timeline: "normal" },
  },
  {
    nombre: "3. Gimnasio pequeño",
    a: { businessName: "N", industry: "fitness", size: "2-5", revenue: "50k-150k",
      hasWebsite: "redes", acquisition: ["redes", "recomendacion"], closeProcess: "manual-todo",
      manualWork: ["agenda", "cobros", "recordatorios"], tools: "excel",
      customerAsks: ["precios", "disponibilidad"], priority: "menos-manual", timeline: "urgente" },
  },
  {
    nombre: "4. Gimnasio con sucursales",
    a: { businessName: "N", industry: "fitness", size: "20+", revenue: "500k+",
      hasWebsite: "viejo", acquisition: ["redes", "google", "recomendacion"], closeProcess: "parcial",
      manualWork: ["cobros", "reportes", "clientes", "recordatorios"], tools: "apps",
      customerAsks: ["disponibilidad", "estado"], priority: "crecer", timeline: "normal" },
  },
  {
    nombre: "5. Consultorio",
    a: { businessName: "N", industry: "salud", size: "solo", revenue: "50k-150k",
      hasWebsite: "no", acquisition: ["recomendacion"], closeProcess: "manual-todo",
      manualWork: ["agenda", "clientes", "recordatorios"], tools: "papel",
      customerAsks: ["disponibilidad", "horarios"], priority: "menos-manual", timeline: "normal" },
  },
  {
    nombre: "6. Clínica mediana",
    a: { businessName: "N", industry: "salud", size: "6-20", revenue: "500k+",
      hasWebsite: "si", acquisition: ["google", "recomendacion"], closeProcess: "parcial",
      manualWork: ["agenda", "reportes"], tools: "apps", customerAsks: ["estado"],
      priority: "ordenar", timeline: "normal" },
  },
  {
    nombre: "7. Supermercado",
    a: { businessName: "N", industry: "retail", size: "20+", revenue: "500k+",
      hasWebsite: "redes", acquisition: ["local"], closeProcess: "manual-todo",
      manualWork: ["cobros", "inventario", "reportes"], tools: "apps",
      customerAsks: ["catalogo"], priority: "crecer", timeline: "urgente" },
  },
  {
    nombre: "8. Tienda retail chica",
    a: { businessName: "N", industry: "retail", size: "2-5", revenue: "menos-50k",
      hasWebsite: "no", acquisition: ["redes", "local"], closeProcess: "manual-todo",
      manualWork: ["inventario", "cobros"], tools: "papel", customerAsks: ["precios", "catalogo"],
      priority: "vender-mas", timeline: "normal" },
  },
  {
    nombre: "9. Eventos",
    a: { businessName: "N", industry: "eventos", size: "2-5", revenue: "150k-500k",
      hasWebsite: "viejo", acquisition: ["redes", "recomendacion"], closeProcess: "manual-cotiza",
      manualWork: ["clientes"], tools: "excel", customerAsks: ["precios"],
      priority: "vender-mas", timeline: "normal" },
  },
  {
    nombre: "10. Servicios profesionales",
    a: { businessName: "N", industry: "servicios", size: "solo", revenue: "50k-150k",
      hasWebsite: "redes", acquisition: ["recomendacion"], closeProcess: "manual-cotiza",
      manualWork: ["clientes"], tools: "excel", customerAsks: ["precios"],
      priority: "vender-mas", timeline: "normal" },
  },
  {
    nombre: "11. B2B con Excel",
    a: { businessName: "N", industry: "b2b", size: "6-20", revenue: "500k+",
      hasWebsite: "viejo", acquisition: ["recomendacion"], closeProcess: "manual-cotiza",
      manualWork: ["cobros", "clientes", "reportes", "inventario"], tools: "excel",
      customerAsks: ["precios", "estado"], priority: "ordenar", timeline: "normal" },
  },
  {
    nombre: "12. Solo necesita landing",
    a: { businessName: "N", industry: "servicios", size: "solo", revenue: "menos-50k",
      hasWebsite: "no", acquisition: ["recomendacion", "redes"], closeProcess: "automatizado",
      manualWork: ["ninguno"], tools: "sistema", customerAsks: ["horarios"],
      priority: "vender-mas", timeline: "normal" },
  },
  {
    nombre: "13. Ya digitalizado",
    a: { businessName: "N", industry: "retail", size: "6-20", revenue: "500k+",
      hasWebsite: "si", acquisition: ["google", "redes", "publicidad"], closeProcess: "automatizado",
      manualWork: ["ninguno"], tools: "sistema", customerAsks: ["pocas"],
      priority: "crecer", timeline: "explorando" },
  },
  {
    nombre: "14. Poco ingreso, necesidades enormes",
    a: { businessName: "N", industry: "restaurante", size: "solo", revenue: "menos-50k",
      hasWebsite: "no", acquisition: ["whatsapp"], closeProcess: "manual-todo",
      manualWork: ["agenda", "cobros", "inventario", "clientes", "reportes"], tools: "papel",
      customerAsks: ["precios", "disponibilidad", "catalogo"], priority: "menos-manual",
      timeline: "urgente" },
  },
  {
    nombre: "15. Grande con necesidad simple",
    a: { businessName: "N", industry: "b2b", size: "20+", revenue: "500k+",
      hasWebsite: "viejo", acquisition: ["recomendacion", "google", "publicidad"],
      closeProcess: "automatizado", manualWork: ["ninguno"], tools: "sistema",
      customerAsks: ["catalogo"], priority: "vender-mas", timeline: "normal" },
  },
  {
    nombre: "16. Ecommerce",
    a: { businessName: "N", industry: "retail", size: "2-5", revenue: "150k-500k",
      hasWebsite: "si", acquisition: ["redes", "publicidad", "google"], closeProcess: "parcial",
      manualWork: ["inventario", "cobros"], tools: "apps", customerAsks: ["estado"],
      priority: "atender-mejor", timeline: "normal" },
  },
  {
    nombre: "17. Vive de WhatsApp",
    a: { businessName: "N", industry: "servicios", size: "2-5", revenue: "50k-150k",
      hasWebsite: "no", acquisition: ["whatsapp"], closeProcess: "manual-todo",
      manualWork: ["agenda", "clientes"], tools: "papel", customerAsks: ["precios", "disponibilidad"],
      priority: "vender-mas", timeline: "urgente" },
  },
  {
    nombre: "18. Necesita cotizador",
    a: { businessName: "N", industry: "eventos", size: "2-5", revenue: "150k-500k",
      hasWebsite: "si", acquisition: ["google", "redes"], closeProcess: "manual-cotiza",
      manualWork: ["clientes"], tools: "excel", customerAsks: ["precios"],
      priority: "atender-mejor", timeline: "normal" },
  },
  {
    nombre: "19. Necesita portal",
    a: { businessName: "N", industry: "b2b", size: "6-20", revenue: "500k+",
      hasWebsite: "si", acquisition: ["recomendacion", "google"], closeProcess: "parcial",
      manualWork: ["reportes"], tools: "apps", customerAsks: ["estado"],
      priority: "atender-mejor", timeline: "normal" },
  },
  {
    nombre: "20. No necesita software a medida",
    a: { businessName: "N", industry: "servicios", size: "solo", revenue: "50k-150k",
      hasWebsite: "si", acquisition: ["google", "recomendacion", "redes"],
      closeProcess: "automatizado", manualWork: ["ninguno"], tools: "sistema",
      customerAsks: ["pocas"], priority: "crecer", timeline: "explorando" },
  },
]

console.log("\n── DIAGNÓSTICOS ──")
const resultados = perfiles.map((p) => ({ ...p, d: diagnose(p.a, "TEST") }))
for (const { nombre, d } of resultados) {
  console.log(`\n${nombre}`)
  console.log(`  prioridad: ${d.prioridad.label} (${STATE_LABEL[d.prioridad.state]})`)
  console.log(`  categoría: ${d.recomendacion.category}${d.recomendacion.product ? ` · ${d.recomendacion.product}` : ""}`)
  console.log(`  titular:   ${d.headline.slice(0, 110)}`)
}

/**
 * Matriz comercial: qué diagnostica y qué propone vender cada perfil.
 * Se imprime completa para poder revisarla a ojo, no solo para que pase.
 */
console.log("\n── MATRIZ COMERCIAL ──")
console.log(
  "PERFIL".padEnd(34) + "PRIORIDAD".padEnd(16) + "CAT".padEnd(11) + "NIVEL".padEnd(14) + "DESDE"
)
for (const { nombre, d } of resultados) {
  console.log(
    nombre.padEnd(34) +
      d.prioridad.label.padEnd(16) +
      d.recomendacion.category.padEnd(11) +
      (d.inversion.nivel ?? "—").padEnd(14) +
      (d.inversion.desde ?? "—") +
      (d.recomendacion.product ? `  +${d.recomendacion.product}` : "") +
      (d.recomendacion.podriaEscalar ? "  (conservador)" : "")
  )
}

// ── Aserciones ───────────────────────────────────────────────────────────────
console.log("\n── NADA INVENTADO ──")
const PROHIBIDO: [string, RegExp][] = [
  ["precio cerrado de proyecto", /\$\s?\d{2},\d{3}(?!\s*MXN\b)|costará|tu proyecto cuesta/i],
  ["precio de producto propio", /ACTIIVA.{0,40}\$|\$\d+\s*(mxn)?\/mes/i],
  ["producto anunciado como listo", /ACTIIVA[^.]{0,30}(lista|listo|disponible ya|ya está)/i],
  ["cualquier rastro de MEDIICA", /mediica/i],
  ["ROI o retorno inventado", /ROI|retorno de inversión|recuperas?\s+\$|payback|% de crecimiento/i],
  ["pérdidas estimadas", /pierdes\s+\$|estás perdiendo|dejas de ganar/i],
  ["certeza absoluta", /necesitas obligatoriamente|tu negocio requiere sin duda|garantizamos/i],
]
for (const [nombre, re] of PROHIBIDO) {
  const culpables = resultados.filter(({ d }) => re.test(JSON.stringify(d)))
  check(
    `ningún diagnóstico contiene ${nombre}`,
    culpables.length === 0,
    culpables.map((c) => c.nombre).join(", ")
  )
}

console.log("\n── LOS DIAGNÓSTICOS SON DISTINTOS ──")
{
  const titulares = new Set(resultados.map((r) => r.d.headline))
  check(`titulares distintos: ${titulares.size} de ${resultados.length}`, titulares.size >= 5)
  const categorias = new Set(resultados.map((r) => r.d.recomendacion.category))
  check(`categorías usadas: ${[...categorias].join(", ")}`, categorias.size >= 4)
  const prioridades = new Set(resultados.map((r) => r.d.prioridad.id))
  check(`prioridades distintas: ${[...prioridades].join(", ")}`, prioridades.size >= 3)
}

console.log("\n── TODO OUTPUT TIENE EVIDENCIA ──")
for (const { nombre, d } of resultados) {
  const conProblema = d.dimensions.filter((x) => x.state === "prioridad" || x.state === "oportunidad")
  const sinEvidencia = conProblema.filter((x) => x.evidence.length === 0)
  check(`${nombre}: ninguna dimensión marcada sin evidencia`, sinEvidencia.length === 0,
    sinEvidencia.map((x) => x.label).join(", "))
}

console.log("\n── PUEDE DECIR QUE NO ──")
{
  const noCustom = resultados.filter((r) => r.d.recomendacion.category === "no_custom")
  check(`al menos un perfil recibe "no necesitas construir nada" (${noCustom.length})`, noCustom.length >= 1,
    noCustom.map((r) => r.nombre).join(", "))
  const web = resultados.filter((r) => r.d.recomendacion.category === "web")
  check(`al menos un perfil recibe solo web (${web.length})`, web.length >= 1)
}

console.log("\n── PRODUCTOS PROPIOS ──")
{
  const actiiva = resultados.filter((r) => r.d.recomendacion.product === "ACTIIVA")
  check(`ACTIIVA solo aparece en fitness (${actiiva.length})`,
    actiiva.every((r) => r.a.industry === "fitness"))
  check("ACTIIVA se presenta como en desarrollo",
    actiiva.every((r) => /desarrollo|todavía|no podemos prometer|etapa temprana/i.test(r.d.recomendacion.body)))

  // MEDIICA salió de la oferta pública: ningún consultorio ni clínica puede
  // recibirla, y ningún diagnóstico debe mencionarla.
  const salud = resultados.filter((r) => r.a.industry === "salud")
  check(`ningún perfil de salud recibe un producto propio (${salud.length} perfiles)`,
    salud.every((r) => !r.d.recomendacion.product),
    salud.map((r) => `${r.nombre}: ${r.d.recomendacion.product}`).join(", "))
  check("los perfiles de salud sí reciben diagnóstico útil",
    salud.every((r) => r.d.observaciones.length > 0 && r.d.recomendacion.title.length > 0))
  check("USERS no se presenta como especialista en regulación sanitaria",
    !/regulaci[óo]n|normativ|COFEPRIS|permisos sanitarios|NOM-/i.test(JSON.stringify(resultados)))
}

console.log("\n── INGRESOS: AJUSTAN ALCANCE, NO DIAGNÓSTICO ──")
{
  const base: Answers = {
    businessName: "N", industry: "retail", size: "2-5",
    hasWebsite: "no", acquisition: ["redes"], closeProcess: "manual-todo",
    manualWork: ["agenda", "cobros", "inventario", "clientes"], tools: "papel",
    customerAsks: ["precios", "disponibilidad"], priority: "menos-manual", timeline: "normal",
  }
  const bajo = diagnose({ ...base, revenue: "menos-50k" }, "T")
  const alto = diagnose({ ...base, revenue: "500k+" }, "T")
  const sinDato = diagnose({ ...base, revenue: "prefiero-no" }, "T")

  check("misma prioridad con ingresos distintos",
    bajo.prioridad.id === alto.prioridad.id,
    `${bajo.prioridad.id} vs ${alto.prioridad.id}`)
  check("misma categoría de recomendación",
    bajo.recomendacion.category === alto.recomendacion.category,
    `${bajo.recomendacion.category} vs ${alto.recomendacion.category}`)
  check("el alcance inicial sí cambia",
    JSON.stringify(bajo.recomendacion.fase_inicial) !== JSON.stringify(alto.recomendacion.fase_inicial),
    `${bajo.recomendacion.fase_inicial.join("|")} vs ${alto.recomendacion.fase_inicial.join("|")}`)
  check("no responder ingresos no rompe ni penaliza",
    sinDato.prioridad.id === bajo.prioridad.id && sinDato.observaciones.length > 0)
  check("los ingresos nunca aparecen en el texto del diagnóstico",
    !/50,000|500,000|ingresos de|ganas/i.test(JSON.stringify(alto)))
}

console.log("\n── CADA PREGUNTA ALIMENTA ALGO ──")
{
  const sinDimension = QUESTIONS.filter((q) => q.feeds.length === 0)
  check(`las ${QUESTIONS.length} preguntas declaran dimensión`, sinDimension.length === 0,
    sinDimension.map((q) => q.id).join(", "))

  // Cambiar cada respuesta debe poder cambiar algo del diagnóstico.
  const base = perfiles[0].a
  const inertes: string[] = []
  for (const q of QUESTIONS) {
    if (!q.options || q.options.length < 2) continue
    const variantes = q.options.map((o) =>
      JSON.stringify(diagnose({ ...base, [q.id]: q.kind === "multi" ? [o.value] : o.value }, "T"))
    )
    if (new Set(variantes).size === 1) inertes.push(q.id)
  }
  check(`ninguna pregunta es inerte`, inertes.length === 0, `inertes: ${inertes.join(", ")}`)
}

/**
 * ── RECOMENDACIÓN COMERCIAL ──────────────────────────────────────────────
 *
 * El Motor diagnostica y después propone un nivel. Estas pruebas cubren la
 * segunda parte: que el nivel corresponda a la evidencia, que el precio
 * corresponda al nivel, y que no se venda de más ni de menos.
 */
console.log("\n── RECOMENDACIÓN COMERCIAL ──")
{
  const porNombre = (frag: string) => resultados.find((r) => r.nombre.includes(frag))!
  const nivelDe = (frag: string) => porNombre(frag).d.recomendacion.offer
  const detalle = (frag: string) =>
    `${porNombre(frag).nombre} → ${porNombre(frag).d.recomendacion.offer ?? "ninguna"}`

  // 1. Presencia sola → Web Activa, nunca un sitio informativo
  check("perfil de solo presencia recibe Web Activa", nivelDe("Solo necesita landing") === "web-activa",
    detalle("Solo necesita landing"))

  // 2. Cotización manual / eventos → Web Activa con herramienta
  check("cotización manual recibe Web Activa", nivelDe("Necesita cotizador") === "web-activa",
    detalle("Necesita cotizador"))
  check("eventos recibe Web Activa", nivelDe("Eventos") === "web-activa", detalle("Eventos"))

  // 3. Disponibilidad repetida → Web Activa basta si es solicitud
  check("consultorio con disponibilidad recibe Web Activa", nivelDe("Consultorio") === "web-activa",
    detalle("Consultorio"))

  // 4. El cliente necesita ver el estado de lo suyo → Plataforma
  check("portal de estado del cliente recibe Plataforma", nivelDe("Necesita portal") === "plataforma",
    detalle("Necesita portal"))

  // 5. Retail chico con inventario y caja → Plataforma, no App automática
  check("retail chico recibe Plataforma y no App", nivelDe("Tienda retail chica") === "plataforma",
    detalle("Tienda retail chica"))
  check("supermercado recibe Plataforma", nivelDe("Supermercado") === "plataforma",
    detalle("Supermercado"))

  // 6. B2B con varios procesos manuales y herramientas sueltas → App
  check("B2B fragmentado recibe App a medida", nivelDe("B2B con Excel") === "app-a-medida",
    detalle("B2B con Excel"))

  // 7. Grande con necesidad simple NO se convierte en App por ser grande
  check("negocio grande con necesidad simple no recibe App",
    nivelDe("Grande con necesidad simple") === "web-activa",
    detalle("Grande con necesidad simple"))
  const grandes = resultados.filter((r) => r.a.size === "20+" || r.a.revenue === "500k+")
  check(`tamaño/ingresos altos no bastan para App (${grandes.length} perfiles)`,
    grandes.every((r) => r.d.recomendacion.offer !== "app-a-medida" ||
      asArrayLen(r.a.manualWork) >= 4),
    grandes.map((r) => `${r.nombre}:${r.d.recomendacion.offer}`).join(", "))

  // 8. Sin proyecto: ni nivel ni precio
  const noCustom = resultados.filter((r) => r.d.recomendacion.category === "no_custom")
  check(`no_custom no propone nivel ni precio (${noCustom.length} perfiles)`,
    noCustom.every((r) =>
      r.d.recomendacion.offer === null &&
      r.d.inversion.nivel === null &&
      r.d.inversion.desde === null &&
      !/\$/.test(r.d.inversion.entrada)),
    noCustom.map((r) => `${r.nombre}: ${r.d.inversion.entrada}`).join(" | "))

  // 9. ACTIIVA: en desarrollo, sin precio de producto, con algo accionable hoy
  const actiiva = resultados.filter((r) => r.d.recomendacion.product === "ACTIIVA")
  check(`ACTIIVA sigue en desarrollo (${actiiva.length} perfiles)`,
    actiiva.length > 0 && actiiva.every((r) =>
      /desarrollo|todavía|no podemos prometer/i.test(r.d.recomendacion.body)))
  check("ACTIIVA no lleva precio de producto",
    actiiva.every((r) => !/ACTIIVA[^.]{0,60}\$/.test(r.d.recomendacion.body)))
  check("ACTIIVA ofrece además un nivel accionable hoy",
    actiiva.every((r) => r.d.recomendacion.offer !== null && r.d.inversion.desde !== null),
    actiiva.map((r) => `${r.nombre}: ${r.d.recomendacion.offer}`).join(", "))

  // 10. El precio mostrado corresponde SIEMPRE al nivel recomendado
  const conNivel = resultados.filter((r) => r.d.recomendacion.offer !== null)
  check(`el precio corresponde al nivel recomendado (${conNivel.length} perfiles)`,
    conNivel.every((r) => {
      const id = r.d.recomendacion.offer as OfferId
      return (
        r.d.inversion.desde === siteConfig.pricing.offerLabel(id) &&
        r.d.inversion.nivel === getOffer(id).name
      )
    }),
    conNivel.map((r) => `${r.nombre}: ${r.d.inversion.nivel}/${r.d.inversion.desde}`).join(" | "))
  check("ningún precio se escribe fuera de siteConfig",
    conNivel.every((r) =>
      siteConfig.offers.some((o) => r.d.inversion.desde === siteConfig.pricing.offerLabel(o.id))))

  // 11. Los ingresos ajustan alcance, no saltan de nivel
  const baseOp: Answers = {
    businessName: "N", industry: "retail", size: "6-20", revenue: "menos-50k",
    hasWebsite: "si", acquisition: ["google"], closeProcess: "parcial",
    manualWork: ["inventario", "cobros", "reportes"], tools: "excel",
    customerAsks: ["estado"], priority: "menos-manual", timeline: "normal",
  }
  const pobre = diagnose(baseOp, "T")
  const rico = diagnose({ ...baseOp, revenue: "500k+" }, "T")
  check("los ingresos no cambian el nivel comercial",
    pobre.recomendacion.offer === rico.recomendacion.offer,
    `${pobre.recomendacion.offer} vs ${rico.recomendacion.offer}`)
  check("los ingresos sí cambian el alcance inicial",
    JSON.stringify(pobre.recomendacion.fase_inicial) !==
      JSON.stringify(rico.recomendacion.fase_inicial))

  // 12. Ninguna recomendación propone un sitio sin función
  const SOLO_SITIO = /sitio (web )?que (explique|muestre)[^,.]*$|solo (un )?sitio|sitio informativo/i
  const conProyecto = resultados.filter((r) => r.d.recomendacion.offer !== null)
  const soloSitio = conProyecto.filter((r) =>
    r.d.recomendacion.fase_inicial.length === 1 && SOLO_SITIO.test(r.d.recomendacion.fase_inicial[0]))
  check(`ninguna fase inicial es solo presencia (${conProyecto.length} perfiles)`,
    soloSitio.length === 0, soloSitio.map((r) => r.nombre).join(", "))
  check("toda Web Activa incluye herramienta y panel",
    conProyecto.filter((r) => r.d.recomendacion.offer === "web-activa").every((r) =>
      r.d.recomendacion.fase_inicial.length >= 2 &&
      r.d.recomendacion.fase_inicial.some((f) => /panel/i.test(f))),
    conProyecto.filter((r) => r.d.recomendacion.offer === "web-activa")
      .map((r) => `${r.nombre}: ${r.d.recomendacion.fase_inicial.join(" / ")}`).join(" | "))

  // Terminología retirada
  const RETIRADA = /sistema a medida|solo sitio|primero el sitio|herramientas después/i
  const conTerminologia = resultados.filter((r) =>
    RETIRADA.test(`${r.d.recomendacion.title} ${r.d.recomendacion.body} ${r.d.recomendacion.evolucion.join(" ")}`))
  check("no queda terminología comercial retirada", conTerminologia.length === 0,
    conTerminologia.map((r) => r.nombre).join(", "))

  // El nivel conservador se declara, no se esconde
  const conservadores = resultados.filter((r) => r.d.recomendacion.podriaEscalar)
  check(`los niveles conservadores se marcan (${conservadores.length} perfiles)`,
    conservadores.every((r) => r.d.inversion.requiereCotizacion))

  // Se usan los tres niveles: la escalera no colapsa en uno solo
  const niveles = new Set(conNivel.map((r) => r.d.recomendacion.offer))
  check(`se usan los tres niveles de la escalera: ${[...niveles].join(", ")}`, niveles.size === 3)
}

console.log(`\n═══ ${pass} ok · ${fail} fail ═══\n`)
process.exit(fail > 0 ? 1 : 0)
