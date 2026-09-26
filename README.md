# USERS Website

Sitio comercial de **USERS** — [www.users.mx](https://www.users.mx).

Es la superficie pública del negocio: qué construimos, para quién, con qué
evidencia, y por dónde entra un prospecto. Incluye el **Motor de Análisis**
(`/analisis`), que es hoy la principal vía de entrada de leads.

No es una plataforma ni un producto multi-tenant. Es un sitio de contenido con
dos endpoints de captura y un centro de atención determinista.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, TypeScript 5 |
| Estilos | Tailwind CSS v4 — configuración en CSS, **no hay `tailwind.config.ts`** |
| Componentes | shadcn/ui estilo `base-nova` sobre `@base-ui/react` (no Radix) |
| Datos | Supabase (tabla `analisis_negocio`) |
| Correo | Resend |
| Medición | Vercel Analytics + Speed Insights, GA4 y Meta Pixel — todos tras consentimiento |
| Hosting | Vercel |

Gestor de paquetes: **npm**. El lockfile está versionado; instala con `npm ci`.

---

## Comandos

```bash
npm ci            # instalar exactamente lo que fija el lockfile
npm run dev       # desarrollo en http://localhost:3000
npm run build     # build de producción
npm run start     # servir el build
npm run lint      # ESLint
npx tsc --noEmit  # tipos
```

### Bancos de pruebas

Deterministas y sin credenciales: se pueden correr en cualquier momento.

```bash
npx tsx scripts/motor-qa.mts     # Motor de Análisis — diagnóstico y reglas
npx tsx scripts/support-qa.mts   # Centro de Atención — ruteo, límites y escalamiento
```

El banco del funnel (`scripts/funnel-qa.mjs`) necesita Playwright y el sitio
servido en `:3000`; no corre en una instalación limpia.

Antes de publicar, `docs/lanzamiento.md` define la secuencia completa.

---

## Estructura

```
app/                      rutas (App Router)
  page.tsx                home
  soluciones/             índice + 5 páginas de solución
  proyectos/              índice + [slug] de casos
  productos/              productos propios de USERS
  analisis/               Motor de Análisis (cliente)
  centro-de-atencion/     centro de atención completo
  ayuda/                  central de ayuda
  blog/                   índice + [slug]
  aviso-de-privacidad/
  api/analisis/           calcular · guardar-progreso
  hola/                   entrada corta para QR e impresos (307 + UTM)
  llms.txt/               resumen factual para modelos
  robots.ts · sitemap.ts · opengraph-image.tsx

components/
  sections/               secciones de página
  site/                   Header, Footer, botones flotantes
  motor/                  vista del diagnóstico
  support/                widget y chat del Centro
  analytics/ · consent/   medición y consentimiento
  ui/                     primitivas propias (MediaFrame, LazyVideo…)

lib/
  site-config.ts          ← fuente única de verdad comercial
  solutions.ts            catálogo de soluciones
  projects.ts             casos de cliente
  products-media.ts       presentación de productos propios
  motor/                  questions · diagnose · types
  support/                motor determinista del Centro
  analytics/              catálogo de eventos, consentimiento, proveedores
  knowledge-base.ts       base de conocimiento del Centro

supabase/schema.sql       esquema de la tabla de análisis
docs/                     lanzamiento, medición, publicidad, post-deploy
scripts/                  bancos de prueba y utilidades de desarrollo
```

### Dos reglas que sostienen el contenido

1. **`lib/site-config.ts` es la fuente de verdad comercial.** Precios, contacto,
   horarios, datos legales y productos vigentes viven ahí y se interpolan. No se
   escriben a mano en componentes ni en metadata: una cifra copiada se
   desactualiza en silencio.

2. **No se publica lo que no se puede sostener.** Sin métricas de cliente sin
   evidencia, sin capturas simuladas de productos que no existen, sin
   testimonios entrecomillados que no sean literales. `lib/projects.ts` y
   `lib/site-config.ts` documentan el criterio en sus comentarios.

---

## Motor de Análisis

Ruta `/analisis`. Es la entrada principal del funnel.

- **5 pasos, 12 preguntas** (`lib/motor/questions.ts`). Cada pregunta declara a
  qué dimensión alimenta; el tipo no permite añadir una que no alimente nada.
- **El diagnóstico se calcula en el navegador** (`lib/motor/diagnose.ts`): seis
  dimensiones, cuatro estados categóricos y observaciones con evidencia. No sale
  nada a la red para verlo.
- **El resultado se muestra sin pedir datos.** El contacto va después, y es
  opcional.
- **No cotiza.** Devuelve prioridades, qué construir primero, qué puede esperar y
  un punto de partida de inversión. El alcance exacto se revisa con una persona.
- Al enviar el contacto, `POST /api/analisis/calcular` guarda el lead en Supabase
  y notifica por Resend. Si una de las dos vías falla, el lead no se pierde.

`lib/motor/types.ts` explica por qué el resultado usa categorías y no un puntaje.

---

## Variables de entorno

Solo **nombres**. Los valores se configuran en Vercel → Settings → Environment
Variables. Nunca se versionan: `.env*` está en `.gitignore`.

### Requeridas para captura de leads

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Proyecto de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Escritura server-side. **Nunca `NEXT_PUBLIC_`** |
| `RESEND_API_KEY` | Envío de la notificación |
| `RESEND_FROM` | Remitente verificado |
| `NOTIFICATION_EMAIL` | Destinatario del aviso de lead |

### Opcionales

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Conversiones de Google Ads |
| `SUPPORT_AI_PROVIDER` | Capa generativa del Centro. Sin ella, funciona determinista |

Sin las opcionales la aplicación compila y funciona: los adaptadores quedan
inertes y no se carga ningún script de terceros.

**Ningún secreto lleva el prefijo `NEXT_PUBLIC_`.** Ese prefijo expone el valor
al navegador.

---

## Deployment

Repositorio `users-website`; Vercel conserva por ahora el nombre técnico
`user-core`. `main` es la rama que se publica.

| | |
|---|---|
| Producción | `https://www.users.mx` |
| Canónico | `www` — el apex responde 308 hacia `www` |
| DNS | Nameservers **externos**, no gestionados desde Vercel |

**Límites que este repositorio no cruza:**

- El DNS no se toca desde aquí. Cambiarlo puede tirar el correo del dominio.
- Las variables de entorno se configuran en Vercel, no en el código.
- El esquema de Supabase (`supabase/schema.sql`) es referencia; las migraciones
  se aplican deliberadamente, no en el build.
- No hay Content-Security-Policy. La decisión y su motivo están en
  `next.config.ts`; está documentada como pendiente, no resuelta.

`docs/lanzamiento.md` incluye el checklist de publicación y cómo revertir.

---

## Documentación

| Documento | Qué cubre |
|---|---|
| `MAPA-DEL-PROYECTO.md` | Mapa del sitio real: secciones, rutas y assets |
| `docs/lanzamiento.md` | Publicar y revertir |
| `docs/medicion-y-campanas.md` | Cómo está instrumentada la medición y qué URLs usar |
| `docs/advertising-readiness.md` | Qué falta configurar para publicidad |
| `docs/post-deploy.md` | Tareas que solo aplican contra el dominio real |
| `AGENTS.md` / `CLAUDE.md` | Contexto para agentes de código |
