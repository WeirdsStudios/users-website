/**
 * Fuente única de verdad para la información comercial de USERS.
 *
 * Todo dato que (a) aparece repetido en el sitio, (b) debe permanecer
 * consistente y (c) puede cambiar por decisión comercial vive aquí.
 * El copy de cada sección NO vive aquí — solo los datos.
 *
 * Al cambiar `startingPrice`, corre `npm run build`: llms.txt se regenera
 * desde este archivo, así que no hay que sincronizarlo a mano.
 */

export type ProductStatus = "in-development" | "live"

export interface MaintenancePlan {
  id: string
  name: string
  forWhat: string
  price: number
  priceNote: string
  /** true = el precio es un punto de partida, no una tarifa cerrada. */
  isFrom?: boolean
  features: readonly string[]
  highlight: boolean
}

/**
 * Los tres niveles con los que USERS vende.
 *
 * NO son paquetes cerrados. Cada uno declara un punto de partida y un alcance
 * representativo; el precio final sale del alcance real. Por eso cada nivel
 * lleva `notIncluded`: el "desde" tiene que decir también qué NO implica, o se
 * lee como una lista de funciones incluidas.
 *
 * El orden del arreglo es el orden comercial: entrada → operación → a medida.
 * `pricing.startingPrice` se deriva del primero, así que el precio de entrada
 * del sitio no puede desincronizarse de la escalera.
 */
export type OfferId = "web-activa" | "plataforma" | "app-a-medida"

export interface CommercialOffer {
  id: OfferId
  name: string
  /** Punto de partida. Nunca el precio de un proyecto concreto. */
  startingPrice: number
  /** Una línea: para quién es. */
  forWhom: string
  /** Una línea: qué problema resuelve. */
  solves: string
  /** Alcance representativo, no lista de entregables cerrada. */
  scope: readonly string[]
  /** Qué NO implica el "desde". Obligatorio: sin esto el precio miente. */
  notIncluded: string
  /**
   * Caso cuyo ALCANCE se parece a este nivel. Es una referencia de tamaño,
   * no una reetiquetación: estos proyectos se entregaron antes de que
   * existiera esta escalera y se describen en /proyectos como lo que fueron.
   */
  comparableCase?: { slug: string; name: string }
}

export interface Product {
  name: string
  /** Vertical que atiende. Es el mensaje comercial, no el estado técnico. */
  vertical: string
  /** "in-development" oculta el CTA externo hasta que el destino esté terminado. */
  status: ProductStatus
  url: string
  urlLabel: string
  description: string
  tags: readonly string[]
}

/** "$12,900 MXN". Un solo formateador para toda cifra comercial. */
function priceLabel(amount: number, currency = "MXN"): string {
  return `$${amount.toLocaleString("en-US")} ${currency}`
}

/**
 * La escalera comercial de USERS.
 *
 * PRINCIPIO QUE LA SOSTIENE: una solución USERS combina presencia (lo que ve
 * el cliente), función (algo útil que puede hacer) y control (lo que el
 * negocio administra). Los tres niveles no se distinguen por "cuántas
 * páginas", sino por hasta dónde llega la función y el control.
 *
 * El nivel de entrada ya no es un sitio informativo. Esa es la diferencia
 * comercial respecto del modelo anterior.
 */
export const COMMERCIAL_OFFERS = [
  {
    id: "web-activa",
    name: "Web Activa",
    startingPrice: 12900,
    forWhom:
      "Negocios que ya venden y necesitan que su presencia digital deje de ser un folleto.",
    solves:
      "Lo que hoy se resuelve contestando los mismos mensajes: precios, disponibilidad, catálogo, solicitudes.",
    scope: [
      "Sitio responsivo, con estructura y contenido trabajados",
      "Base técnica de SEO y analítica",
      "Contacto y WhatsApp",
      "Dominio y hosting el primer año",
      "Una herramienta funcional acotada",
      "Tu panel para administrar lo anterior",
    ],
    notIncluded:
      "Incluye una herramienta acotada, definida contigo al arrancar. Herramientas adicionales, integraciones o mayor complejidad se cotizan aparte.",
    comparableCase: { slug: "las-frescas", name: "Las Frescas" },
  },
  {
    id: "plataforma",
    name: "Plataforma",
    startingPrice: 24900,
    forWhom:
      "Negocios con equipo, clientes recurrentes o varias sucursales que ya no caben en una hoja de cálculo.",
    solves:
      "Cuando además del sitio público hace falta una capa privada donde el equipo o los clientes entren y trabajen.",
    scope: [
      "Todo lo de Web Activa",
      "Acceso con cuentas y perfiles",
      "Portal de clientes o de socios",
      "Reservas, membresías o pedidos",
      "Inventario, caja o punto de venta",
      "Roles, permisos y varias sucursales",
    ],
    notIncluded:
      "Son ejemplos de lo que una plataforma puede incluir, no una lista que entre completa en el precio de entrada. El alcance define la cotización.",
    comparableCase: { slug: "greek-gym", name: "Greek Gym" },
  },
  {
    id: "app-a-medida",
    name: "App a medida",
    startingPrice: 39900,
    forWhom:
      "Negocios cuya operación no se parece a la de nadie más y no encaja en una herramienta de catálogo.",
    solves:
      "Cuando el proceso del negocio es el producto y el software tiene que construirse alrededor de él.",
    scope: [
      "Aplicación web construida sobre tu proceso",
      "Autenticación y roles",
      "Flujos de trabajo propios",
      "Base de datos y tableros",
      "Automatizaciones e integraciones",
      "Instalable en el dispositivo (PWA)",
    ],
    notIncluded:
      "El punto de partida no incluye todo lo anterior: una app a medida se cotiza por el proceso que tiene que sostener.",
    comparableCase: { slug: "llevelin", name: "Llevelín" },
  },
] as const satisfies readonly CommercialOffer[]

export function getOffer(id: OfferId): CommercialOffer {
  const offer = COMMERCIAL_OFFERS.find((o) => o.id === id)
  if (!offer) throw new Error(`Oferta desconocida: ${id}`)
  return offer
}

const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const

/**
 * Convierte los días de atención en el texto que ve una persona.
 * Días consecutivos se escriben como rango ("Lunes a sábado"); días sueltos
 * se enumeran. Así el copy nunca puede desincronizarse del cálculo.
 */
function formatDayRange(days: readonly number[]): string {
  if (days.length === 0) return "Sin atención programada"
  if (days.length === 7) return "Todos los días"

  const sorted = [...days].sort((a, b) => a - b)
  const consecutive = sorted.every((d, i) => i === 0 || d === sorted[i - 1] + 1)

  if (consecutive && sorted.length > 1) {
    return `${DAY_NAMES[sorted[0]]} a ${DAY_NAMES[sorted[sorted.length - 1]].toLowerCase()}`
  }
  return sorted.map((d) => DAY_NAMES[d]).join(", ")
}

/**
 * Imagen social por defecto.
 *
 * `app/opengraph-image.tsx` la genera, pero Next solo la inyecta cuando la
 * página no declara su propio bloque `openGraph`. Casi todas lo declaran para
 * fijar título y descripción, y al hacerlo perdían la imagen: al compartir un
 * proyecto o una solución en WhatsApp salía sin miniatura. Se declara aquí
 * para no repetir la URL en catorce archivos.
 */
export const defaultOgImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "USERS — desarrollo web y software para PyMEs en México",
}

export const siteConfig = {
  name: "USERS",
  /** Marca como se escribe en el sitio y en metadata. */
  wordmark: "users.mx",
  /**
   * Dominio canónico. Tiene que ser exactamente el que sirve contenido: el
   * apex users.mx responde 308 hacia www, así que apuntar los canonical al
   * apex los mandaba a una URL que redirige. La marca escrita sigue siendo
   * "users.mx" — eso vive en `wordmark`, esto es solo la URL.
   */
  url: "https://www.users.mx",
  locale: "es_MX",

  description:
    "Desarrollo web y software para PyMEs en México. Construimos la presencia digital, los sistemas para operar el negocio y las experiencias que usan sus clientes.",
  shortDescription: "Desarrollo web y software para PyMEs en México",

  contact: {
    email: "hola@users.mx",
    /** Formato E.164 sin signos, como lo requiere wa.me */
    whatsapp: "5215612934010",
    /** Mismo número en formato legible para humanos. */
    whatsappDisplay: "+52 56 1293 4010",
    /** Usado en el JSON-LD de Organization. */
    telephone: "+525612934010",
    city: "Ciudad de México",
    country: "MX",
    /**
     * Ventana de atención humana. El Centro automatizado responde siempre;
     * esto solo determina cuándo puede escalarse a una persona.
     *
     * `days` son índices de `Date.getDay()` (0 = domingo). Es la única
     * definición: tanto el cálculo de disponibilidad como el texto que se
     * muestra salen de aquí. Antes el texto decía una cosa y el motor
     * evaluaba otra constante, y podían separarse sin que nadie lo notara.
     */
    supportHours: { from: "09:00", to: "16:00", timezone: "America/Mexico_City" },
    supportDays: [1, 2, 3, 4, 5, 6] as readonly number[],
    get supportDaysLabel() {
      return formatDayRange(this.supportDays)
    },
    get hours() {
      return `${this.supportDaysLabel}, ${this.supportHours.from} a ${this.supportHours.to} hrs`
    },
  },

  /**
   * Responsable de los datos personales.
   *
   * USERS opera hoy como persona física en RESICO. NO existe todavía ninguna
   * sociedad: no debe aparecer una razón social que no está constituida.
   * Cuando se constituya, se cambia aquí y el aviso se actualiza solo.
   *
   * El RFC no se publica: no hay obligación confirmada de exhibirlo en el
   * aviso, y publicar un dato fiscal sin necesidad es exponerlo de más.
   */
  legal: {
    responsable: "Hazael Guillermo Munguía Alba",
    figura: "Persona física con actividad empresarial",
    regimen: "Régimen Simplificado de Confianza (RESICO)",
    domicilio:
      "Av. Central Sta. Clara #1, Jardines de Sta. Clara, C.P. 55450, Ecatepec de Morelos, Estado de México, México",
    correoPrivacidad: "privacidad@users.mx",
    /** Meses que se conserva un prospecto sin conversión. */
    retencionProspectosMeses: 12,
  },

  /**
   * Los tres niveles con los que se vende. Ver COMMERCIAL_OFFERS arriba.
   * Se expone aquí para que el sitio tenga un solo punto de acceso.
   */
  offers: COMMERCIAL_OFFERS,

  pricing: {
    currency: "MXN",
    /**
     * Punto de entrada del sitio = punto de entrada de Web Activa. Se deriva,
     * no se escribe: si cambia la escalera, cambia el sitio entero —Hero,
     * footer, metadata, llms.txt, Centro de Atención y el resultado del Motor.
     */
    get startingPrice() {
      return COMMERCIAL_OFFERS[0].startingPrice
    },
    /** "$12,900 MXN" — usar siempre esto en vez de escribirlo a mano. */
    get startingPriceLabel() {
      return priceLabel(this.startingPrice, this.currency)
    },
    /** Etiqueta de cualquier nivel de la escalera. */
    offerLabel(id: OfferId) {
      return priceLabel(getOffer(id).startingPrice, this.currency)
    },
    maintenanceFrom: 399,
    get maintenanceFromLabel() {
      return `${priceLabel(this.maintenanceFrom, this.currency)}/mes`
    },
  },

  /**
   * Planes de seguimiento posteriores al lanzamiento.
   *
   * Escalan por *qué* se mantiene, no por cuántos cambios se permiten: un
   * sistema con base de datos y usuarios cuesta más de sostener que un sitio
   * de contenido.
   *
   * El plan de Sistemas es un "desde": no se anuncian tiempos de respuesta,
   * horas incluidas ni frecuencia de respaldo porque esas condiciones aún no
   * están definidas comercialmente. Cuando lo estén, se pueden concretar aquí.
   */
  maintenancePlans: [
    {
      id: "sitio",
      name: "Sitio",
      forWhat: "Para sitios web, landing pages y catálogos",
      price: 399,
      priceNote: "MXN/mes",
      features: [
        "Hosting, dominio y certificado de seguridad",
        "Respaldos periódicos",
        "Actualizaciones de seguridad",
        "Cambios de contenido acordados",
        "Soporte por WhatsApp",
      ],
      highlight: false,
    },
    {
      id: "sistemas",
      name: "Sistemas",
      forWhat: "Para software con usuarios, cobros o base de datos",
      price: 1290,
      priceNote: "MXN/mes",
      /**
       * "Desde" y "según alcance" son deliberados: las condiciones concretas
       * (tiempos de respuesta, frecuencia de respaldo, horas incluidas) todavía
       * no están definidas comercialmente, así que se enuncian como lo que el
       * plan *puede incluir* y no como una promesa cerrada.
       */
      isFrom: true,
      features: [
        "Infraestructura y hosting del sistema",
        "Monitoreo",
        "Respaldos",
        "Actualizaciones de seguridad y dependencias",
        "Soporte",
        "Ajustes evolutivos",
      ],
      highlight: true,
    },
  ] as MaintenancePlan[],

  /**
   * Qué pasa con el dominio y el hosting. Política decidida, no ambigüedad.
   *
   * Web Activa incluye dominio y hosting el primer año. Al terminar ese año
   * hay dos caminos y ninguno apaga el sitio: seguir con el plan de
   * seguimiento, o hacerse cargo directamente de la infraestructura.
   *
   * Se enuncia así a propósito. "Después del primer año se renueva" deja al
   * cliente suponiendo que el sitio se cae si no paga mantenimiento, y eso no
   * es cierto: el mantenimiento es opcional, la infraestructura es un costo
   * que alguien tiene que cubrir.
   */
  infrastructure: {
    includedFirstYear: "Dominio y hosting incluidos el primer año",
    afterFirstYear: [
      {
        id: "seguimiento",
        title: "Seguir con el plan de seguimiento",
        body: "USERS mantiene dominio, hosting, respaldos y actualizaciones, y tú sigues con soporte.",
      },
      {
        id: "directo",
        title: "Hacerte cargo de la infraestructura",
        body: "Tomas el dominio y el hosting a tu nombre y los pagas directo, sin seguimiento de USERS.",
      },
    ],
    /** Lo que NO hay que dejar suponer. */
    clarification:
      "El sitio no deja de funcionar si no contratas seguimiento: el plan es opcional y la infraestructura se puede llevar por tu cuenta.",
    /** Plataformas y apps no caben en una cifra única. */
    platformNote:
      "En plataformas y apps la infraestructura depende del proyecto: usuarios, datos y disponibilidad no cuestan igual en todos los casos.",
  },

  /**
   * Productos propios de USERS. Cambiar `status` a "live" es todo lo que hace
   * falta para activar el enlace externo en el sitio.
   *
   * La lista es la oferta VIGENTE. Un producto que no se está ofreciendo no se
   * anuncia como pausado ni como próximo: simplemente no está aquí. Anunciar
   * ausencias no vende nada y obliga a explicar por qué.
   */
  products: [
    {
      name: "ACTIIVA",
      vertical: "Fitness",
      status: "in-development",
      url: "https://actiiva.mx",
      urlLabel: "actiiva.mx",
      description:
        "Plataforma para gimnasios boutique, estudios fitness y entrenadores: membresías, reservas y cobros en un solo lugar.",
      tags: ["Producto propio", "Fitness", "Membresías", "Reservas"],
    },
  ] as Product[],

  /** Solo perfiles que existen realmente. Vacío hasta que los haya. */
  social: [] as { platform: string; url: string }[],
} as const

export type SiteConfig = typeof siteConfig
