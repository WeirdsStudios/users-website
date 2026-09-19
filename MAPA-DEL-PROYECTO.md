# MAPA DEL PROYECTO — users.mx

Mapa del sitio **real**. Si algo de aquí no coincide con el código, gana el
código y este archivo se corrige.

---

## Rutas

| Ruta | Qué es |
|---|---|
| `/` | Home |
| `/soluciones` | Índice de soluciones |
| `/soluciones/desarrollo-web` | Presencia |
| `/soluciones/software-a-medida` | Operación |
| `/soluciones/punto-de-venta-a-medida` | Operación |
| `/soluciones/cotizadores-digitales` | Clientes |
| `/soluciones/portales-para-clientes` | Clientes |
| `/proyectos` | Índice de casos |
| `/proyectos/[slug]` | `greek-gym`, `llevelin`, `las-frescas` |
| `/productos` | Productos propios de USERS |
| `/analisis` | Motor de Análisis |
| `/centro-de-atencion` | Centro de Atención completo |
| `/ayuda` | Central de ayuda y planes de seguimiento |
| `/blog`, `/blog/[slug]` | 4 artículos |
| `/aviso-de-privacidad` | Legal |
| `/hola` | 307 hacia `/` con UTM. Para QR e impresos |
| `/llms.txt` | Resumen factual para modelos |
| `/api/analisis/calcular` | Registra el lead: Supabase + Resend |
| `/api/analisis/guardar-progreso` | Guardado parcial del Motor |

Generadas: `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`.

**Redirect vigente** (`next.config.ts`): el artículo de ACTIIVA cambió de slug y
la URL anterior responde 301.

---

## Home — orden de secciones

`app/page.tsx`:

1. `Header` — fijo
2. `Hero` — propuesta + CTA al Motor + WhatsApp
3. `Soluciones` — los tres frentes (presencia, operación, clientes)
4. `CasosHome` — los tres casos, mismo peso visual
5. `ProductosUsers` — ACTIIVA; "cuando un giro se repite, lo convertimos en producto"
6. `Equipo` — quién responde por el proyecto
7. `ComoTrabajamos` — los 5 pasos del proceso + disciplinas
8. `CentroAtencion` — postventa: atención, seguimiento y cambios
9. `MotorCTA` — el Motor como puerta de entrada
10. `Testimonials` — dos clientes
11. `FinalCTA` — dos rutas según qué tan definido esté el proyecto
12. `Footer`

El recorrido es: qué hacemos → qué compras → evidencia → producto propio →
quién lo construye → cómo trabajamos → qué pasa después → cómo empezar.

> **Nota:** `components/sections/` contiene además secciones huérfanas de fases
> anteriores que ya no importa nadie (`Portfolio`, `Manifesto`, `FAQ`,
> `Services`, `Team`, `ClientLogos`, `Oferta`, `Progresion`, `Mantenimiento`,
> `Capacidades`, `CasoDestacado`, `Differentiators`, `Process`, `Productos`,
> `TrustStrip`, `Blog`). Están pendientes de limpieza; no son parte del sitio.

---

## Fuentes de verdad

| Archivo | Contiene |
|---|---|
| `lib/site-config.ts` | Precios, contacto, horarios, datos legales, productos vigentes |
| `lib/solutions.ts` | Las 5 soluciones y su metadata |
| `lib/projects.ts` | Los 3 casos de cliente |
| `lib/products-media.ts` | Presentación y material de los productos propios |
| `lib/blog.ts` | Los 4 artículos |
| `lib/knowledge-base.ts` | Base de conocimiento del Centro de Atención |

**Regla:** ningún precio se escribe a mano fuera de `site-config`. Se interpola
desde `siteConfig.pricing`, incluido en metadata y en el resultado del Motor.

---

## Motor de Análisis

| | |
|---|---|
| Frontend | `app/analisis/MotorClient.tsx` — client component |
| Preguntas | `lib/motor/questions.ts` — **5 pasos, 12 preguntas** |
| Diagnóstico | `lib/motor/diagnose.ts` — se calcula **en el navegador** |
| Modelo | `lib/motor/types.ts` — 6 dimensiones, 4 estados categóricos |
| Resultado | `components/motor/DiagnosisView.tsx` |
| Lead | `app/api/analisis/calcular/route.ts` → Supabase + Resend |
| Progreso | `app/api/analisis/guardar-progreso/route.ts` |
| Admin DB | `lib/supabase-admin.ts` · esquema en `supabase/schema.sql` |
| Banco | `npx tsx scripts/motor-qa.mts` |

**Qué entrega:** prioridades por dimensión, qué construir primero, qué puede
esperar y un punto de partida de inversión.
**Qué no entrega:** cotización, desglose por módulo, tiempo de entrega ni
agenda. Nada de eso existe en el flujo y no debe anunciarse.

El resultado se muestra **antes** de pedir datos de contacto.

---

## Centro de Atención

Determinista, sin LLM. `lib/support/` (motor, clasificación, recuperación,
escalamiento, redacción de PII) sobre `lib/knowledge-base.ts`.

- Widget flotante: `components/support/SupportWidget.tsx` — carga diferida, no
  aparece en `/centro-de-atencion` ni en `/analisis`.
- Página completa: `app/centro-de-atencion/page.tsx`.
- `lib/support/ai-provider.ts` es una costura opcional: sin `SUPPORT_AI_PROVIDER`
  el Centro funciona determinista.
- Banco: `npx tsx scripts/support-qa.mts`.

---

## Medición

Todo pasa por `trackEvent` (`lib/analytics/track.ts`). Ningún componente habla
con Google, Meta o Vercel directamente. `ClickTracker` deduce el evento del
destino del enlace, así que un CTA nuevo queda medido por existir.

**Nada se carga sin consentimiento** — ni GA4, ni Meta, ni Vercel Analytics. El
catálogo cerrado de eventos está en `lib/analytics/events.ts`.

Detalle en `docs/medicion-y-campanas.md`.

---

## Identidad visual

**Tipografía** (`app/layout.tsx`, ambas con `display: "optional"`):

- DM Sans → `--font-sans`
- JetBrains Mono → `--font-mono`, para índices, etiquetas y datos

**Paleta** (hex directo en los componentes):

| Valor | Uso |
|---|---|
| `#4cfc0f` | Acento: CTAs, índices, marcadores |
| `#0A0A0A` | Fondo oscuro: hero, secciones oscuras, footer |
| `#0E0E0E` | Superficie sobre fondo oscuro (tarjetas) |
| `#F7F7F5` | Fondo claro alterno |
| `#FFFFFF` | Fondo claro |
| `#B0B0B0` | Texto secundario sobre oscuro |
| `#8A8A8A` | Texto terciario |
| `#1A1A1A` · `#1F1F1F` · `#2E2E2E` | Bordes y separadores |

> `app/globals.css` define además un sistema de tokens OKLCH heredado de shadcn
> que hoy **no se usa** en los componentes. Es deuda conocida: conviven dos
> sistemas y solo uno está vivo.

**Rejilla técnica:** la clase `.grid-tech` (en `globals.css`) es el patrón de
fondo que aparece en el hero y en los avatares.

---

## Componentes de medios

`components/ui/MediaFrame.tsx` es el componente vigente para casos y productos.
Un slot (`lib/media.ts`) declara `video` o `image`, y cuando todavía no hay
material real usa `placeholder: true` con una portada editorial — nunca una
interfaz simulada.

**Convención:** un `video: "x"` con `dir: "d"` espera

```
/imgs/d/x.webm   ·   /imgs/d/x.mp4   ·   /imgs/d/x-poster.webp
```

Sin `dir`, la carpeta por defecto es `/imgs/video/`.

---

## Assets en uso

```
public/
  favicon.svg · favicon-32.png · apple-touch-icon.png
  logos/
    imagotipo_user.svg          header sobre fondo oscuro, footer, JSON-LD
    imagotipo_user_black.svg    header sobre fondo claro
    products/actiiva.svg        logotipo de ACTIIVA
  imgs/
    portfolio/motor-analisis.webp     captura del reporte (MotorCTA)
    blog/thumb-1..4.webp              miniaturas de artículos
    video/
      greekgym.{webm,mp4}       + greekgym-poster.webp
      greekgym-admin.{webm,mp4} + greekgym-admin-poster.webp
      lasfrescas.{webm,mp4}     + lasfrescas-poster.webp
    projects/llevelin/
      preview · caja · inventario · reporte   (.webm, .mp4, -poster.webp)
```

> El resto de `public/imgs/` (`hero/`, `bg/`, `team/`, `services/`, `clients/`
> y los `portfolio/sec-3-*`) son restos de la plantilla original: no los pide
> ninguna ruta viva. Pendiente de limpieza.

---

## Variables de entorno

Solo nombres; los valores van en Vercel. Ver `README.md` para la tabla completa.

Requeridas para captura de leads: `NEXT_PUBLIC_SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM`,
`NOTIFICATION_EMAIL`.

Opcionales: `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_META_PIXEL_ID`,
`NEXT_PUBLIC_GOOGLE_ADS_ID`, `SUPPORT_AI_PROVIDER`.
