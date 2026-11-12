# Auditoría SEO técnico/on-page + visibilidad en IA — relocatepa.com

**Fecha:** agosto 2026
**Sitio:** relocatepa.com (Astro, `relocate_v3_astro/`) — despacho de inmigración/legal en Panamá (visas de residencia, corporaciones, bienes raíces)
**Alcance:** auditoría técnica SEO, auditoría on-page, visibilidad en motores de búsqueda con IA (ChatGPT, Claude, Perplexity, Google AI Overviews/Gemini, Copilot), y roadmap de contenido ejecutable.

---

## 1. Resumen ejecutivo

| # | Hallazgo | Impacto | Esfuerzo | Estado |
|---|----------|---------|----------|--------|
| 1 | **Bots de IA bloqueados en Cloudflare** (GPTBot, ClaudeBot, Google-Extended, etc.) — el sitio no puede ser citado por ChatGPT/Claude/Gemini hoy | 🔴 Crítico | Bajo (config, no código) | ⚠️ Pendiente — requiere que el usuario lo desactive en su dashboard de Cloudflare |
| 2 | Dos sitemaps conflictivos + ruta duplicada `[lang].astro` colisionando con `/es` | 🟠 Alto | Bajo | ✅ Corregido en este ciclo |
| 3 | Falta `llms.txt` — motores de IA no tienen contexto estructurado del negocio | 🟠 Alto | Bajo | ✅ Corregido en este ciclo |
| 4 | Testimonios sin schema `Review`/`AggregateRating` | 🟡 Medio | Bajo | ✅ Corregido en este ciclo |
| 5 | Sin `<main>` landmark, FAQ sin `aria-expanded`/`aria-controls` | 🟡 Medio | Bajo | ✅ Corregido en este ciclo |
| 6 | Sitio de una sola página — sin blog/guías/comparativas, cobertura temática limitada para *query fan-out* | 🟠 Alto | Alto (contenido) | 📋 Roadmap en sección 5 |
| 7 | Sin GA4/Search Console — no hay forma de medir tráfico ni indexación | 🟡 Medio | Bajo (requiere IDs del usuario) | ⚠️ Pendiente — requiere Measurement ID del usuario |

---

## 2. Auditoría técnica SEO

### Robots.txt y bots de IA

**Hallazgo crítico:** el `robots.txt` servido en producción (gestionado por una capa de Cloudflare, probablemente el toggle "Block AI Bots" del dashboard — **no** el archivo del repo) bloqueaba explícitamente:

```
Disallow: GPTBot, ClaudeBot, Google-Extended, Amazonbot, Applebot-Extended, Bytespider, CCBot, meta-externalagent
```

Esto significa que, sin importar qué tan bueno sea el contenido, **ChatGPT, Claude, y Google AI Overviews/Gemini no pueden leer ni citar el sitio.**

- **Acción tomada en el repo:** `relocate_v3_astro/public/robots.txt` ahora declara explícitamente `Allow` para `GPTBot`, `ChatGPT-User`, `ClaudeBot`, `anthropic-ai`, `PerplexityBot`, `Google-Extended`, `Bingbot`, y mantiene `Disallow` solo para `CCBot` (crawler de entrenamiento puro, sin uso de citación).
- **Acción pendiente del usuario (fuera del repo):** el bloqueo real ocurre en Cloudflare. Pasos para desactivarlo:
  1. Ir al dashboard de Cloudflare → dominio `relocatepa.com` → **Security → Bots**.
  2. Buscar la sección "AI Scrapers and Crawlers" o "Configure AI Bots" (a veces bajo un WAF Managed Ruleset).
  3. Cambiar de "Block" a "Allow" (o desactivar el toggle) para los bots de búsqueda/citación: GPTBot, ChatGPT-User, ClaudeBot, Google-Extended, PerplexityBot, Applebot-Extended, Bingbot.
  4. Mantener bloqueado solo lo que sea puramente entrenamiento (CCBot, Bytespider si se desea).
  5. Confirmar con `curl -A "GPTBot" https://relocatepa.com/` (debe devolver 200, no 403).

### Sitemaps

**Antes:** `public/sitemap.xml` escrito a mano (solo `/` y `/es`, `lastmod` fijo `2026-04-15`, nunca se actualizaba) coexistía con la integración `@astrojs/sitemap`, que genera su propio `sitemap-index.xml`. `robots.txt` referenciaba ambos — inconsistente.

**Corregido:**
- Se eliminó `public/sitemap.xml`.
- `astro.config.mjs` ahora filtra `/thanks` y `/gracias` de la generación automática (páginas transaccionales sin valor de indexación).
- `robots.txt` referencia solo `sitemap-index.xml`.
- Verificado con `npm run build`: el sitemap generado (`dist/sitemap-0.xml`) contiene únicamente `https://relocatepa.com/` y `https://relocatepa.com/es/`.

**Nota/seguimiento:** el sitemap generado no incluye actualmente los atributos `hreflang` (`xhtml:link`) que sí tenía el archivo manual. Los tags `<link rel="alternate" hreflang>` en el `<head>` de cada página (vía `Layout.astro`) siguen presentes y son el mecanismo principal de hreflang — el sitemap es secundario. Si se quiere paridad completa, `@astrojs/sitemap` soporta una opción `i18n` para generar alternates en el sitemap; no se implementó en este ciclo por ser de bajo impacto adicional.

### Rutas duplicadas

**Hallazgo:** `src/pages/[lang].astro` generaba `/en` y `/es` vía `getStaticPaths()`, **colisionando directamente con `es.astro`** en la ruta `/es` (dos archivos generando la misma URL) y produciendo una versión de `/en` con **menos secciones** que la home real (faltaban "How It Works", "Corporations", "Testimonials"). Además, el único enlace interno al `/en` (`index.astro`, botón de idioma "EN") apuntaba incorrectamente a `/en` en vez de `/` — un bug adicional.

**Corregido:**
- Se eliminó `src/pages/[lang].astro` por completo. `index.astro` (`/`) y `es.astro` (`/es`) ya cubren el 100% del contenido en ambos idiomas sin duplicación.
- Se corrigió el botón de idioma en `index.astro` para apuntar a `/` en vez de `/en`.
- Verificado con `npm run build`: el build ahora genera exactamente 4 páginas (`/`, `/es`, `/thanks`, `/gracias`), sin colisión de rutas.

### Páginas transaccionales indexables

`/thanks` y `/gracias` (páginas de agradecimiento post-formulario) no aportan valor de búsqueda ni de citación IA. Se añadió una prop `noindex` a `Layout.astro` y se aplicó a ambas páginas (`<meta name="robots" content="noindex, follow">`), además de excluirlas del sitemap generado.

### Schema.org

**Antes:** 4 bloques JSON-LD (`WebSite`, `Organization`, `LegalService`, `FAQPage`) — sólida base, pero sin cobertura de los testimonios visibles con estrellas.

**Corregido:** se añadieron `aggregateRating` y `review` (3 reseñas) al nodo `LegalService` existente en `Layout.astro`, en vez de crear un nodo duplicado — evita conflictos de `@id`.

**Pendiente para un ciclo futuro:** `BreadcrumbList` (poco valor en un sitio de una sola página), `Person`/atribución de abogado con credenciales (E-E-A-T), y `Article`/`HowTo` schema una vez exista contenido de blog (ver sección 5).

### Core Web Vitals / rendimiento

No se pudo medir con herramientas de campo dentro de esta tarea. **Recomendación:** correr [PageSpeed Insights](https://pagespeed.web.dev/) sobre `https://relocatepa.com/` después de desplegar estos cambios, y repetir mensualmente.

---

## 3. Auditoría on-page

| Check (del checklist AI SEO) | Resultado |
|---|---|
| ¿Definición clara en el primer párrafo? | ✅ Hero + "Why Panama" explican la propuesta de valor de inmediato |
| ¿Bloques de respuesta autocontenidos? | ✅ Las 8 preguntas de FAQ funcionan como pasajes independientes |
| ¿Estadísticas con fuente citada? | ⚠️ Hay cifras (temperatura, montos de visa, plazos) pero sin fuente/fecha explícita — oportunidad de mejora |
| ¿Tablas comparativas para consultas "X vs Y"? | ❌ No existen — no hay páginas de comparación |
| ¿Sección FAQ con preguntas en lenguaje natural? | ✅ 8 preguntas, con schema `FAQPage` |
| ¿Schema markup? | ✅ WebSite, Organization, LegalService, FAQPage, y ahora Review/AggregateRating |
| ¿Atribución de experto (autor, credenciales)? | ❌ No hay nombre de abogado/autor visible — solo "Panama Attorneys at Law" genérico |
| ¿Actualizado recientemente (< 6 meses)? | ⚠️ No había señal visible — se agregó nota "Page content last reviewed" en el footer de ambos idiomas |
| ¿Jerarquía de encabezados coherente? | ✅ Un solo `<h1>` por página, `h2` por sección, `h3`/`h4` anidados correctamente |
| ¿Bots de IA permitidos en robots.txt? | ⚠️ Corregido en el repo; pendiente en Cloudflare (ver sección 2) |

**Otros hallazgos on-page:**
- Meta title/description, Open Graph, Twitter Cards, geo tags, y hreflang están completos y bien implementados en `Layout.astro` — no requieren cambios.
- Imágenes: 0 sin `alt` text (10/10 con `alt` descriptivo).
- Se agregó `<main>` como landmark semántico en `index.astro` y `es.astro` (antes el contenido colgaba directo de `<body>`).
- Se agregaron `aria-expanded`/`aria-controls` al acordeón de FAQ en ambos idiomas — mejora de accesibilidad y de "experiencia agéntica" (agentes de IA que leen el árbol de accesibilidad).

---

## 4. Visibilidad en motores de búsqueda con IA

### Estado de acceso por plataforma

| Plataforma | Bot | Estado antes | Estado en el repo ahora |
|---|---|---|---|
| ChatGPT | GPTBot, ChatGPT-User | 🔴 Bloqueado (Cloudflare) | ✅ Allow explícito en robots.txt del repo — pendiente desbloquear en Cloudflare |
| Claude | ClaudeBot, anthropic-ai | 🔴 Bloqueado (Cloudflare) | ✅ Allow explícito — pendiente Cloudflare |
| Google AI Overviews / Gemini | Google-Extended | 🔴 Bloqueado (Cloudflare) | ✅ Allow explícito — pendiente Cloudflare |
| Perplexity | PerplexityBot | No verificado en Cloudflare | ✅ Allow explícito |
| Copilot | Bingbot | No verificado en Cloudflare | ✅ Allow explícito |

**Acción crítica pendiente:** el usuario debe desactivar el bloqueo de estos bots en el dashboard de Cloudflare (Security → Bots) — ver instrucciones detalladas en la sección 2. Sin este paso, los cambios del repo no tienen efecto real porque Cloudflare intercepta la petición antes de que llegue al sitio.

### Archivos machine-readable

- ✅ `public/llms.txt` creado — contexto del negocio, servicios, hechos clave citables (requisitos de visa, plazos, sistema fiscal territorial), y enlaces a `/` y `/es`.
- ❌ `pricing.md` — no se creó. El modelo de negocio es "consulta gratuita" sin tabla de precios pública; inventar precios sería contraproducente. Si en el futuro se define un rango de honorarios por servicio (ej. formación de corporación, procesamiento de visa), documentarlo en `/pricing.md` ayudaría a agentes de IA que comparan proveedores.
- ❌ Bundle OKF — no implementado (protocolo emergente de bajo ROI para el tamaño actual del sitio; revisar si Google amplía adopción).

### Matriz de monitoreo manual (sin herramienta de pago configurada)

No hay Peec AI / Otterly / ZipTie configurado. Recomendación: revisar mensualmente estas queries en ChatGPT, Perplexity, y Google AI Overview, y registrar si el sitio aparece citado:

| Query | Por qué importa |
|---|---|
| "Pensionado visa Panama requirements" | Query de alta intención, cluster principal |
| "Best residency visa for retirees in Panama" | Comparativa — mide si listados de terceros citan al sitio |
| "How to open a corporation in Panama" | Cluster de servicios corporativos |
| "Panama vs Costa Rica retirement visa" | Mide presencia en comparativas (aunque el sitio no tenga la página, hoy) |
| "relocatepa.com reviews" | Mide si aparecen menciones/reputación de terceros |
| "Friendly Nations Visa Panama lawyer" | Cluster de servicios + intención local |

### Presencia en terceros (no verificado en esta tarea — pendiente)

No se auditó presencia en Wikipedia, Reddit, foros de expatriados, ni YouTube por estar fuera del alcance de cambios en el repo. Recomendación separada: buscar manualmente "Relocate to Panama" y "relocatepa" en Reddit (r/panama, r/expats) y foros de retiro en el extranjero, y participar auténticamente donde ya se mencione la marca.

---

## 5. Plan de contenido ejecutable (roadmap estratégico)

El sitio es una landing page de una sola sección por idioma. Para cobertura de *query fan-out* (Google genera variantes relacionadas de cada búsqueda) y para dar a los motores de IA más superficie citable, se recomienda un cluster de contenido nuevo. **No se redactó el contenido en este ciclo** — esto es la ficha de planificación para las próximas 3-6 semanas de trabajo editorial.

| Cluster | Intención de búsqueda | Formato | Schema sugerido | Prioridad |
|---|---|---|---|---|
| Guía completa: Pensionado Visa | Informacional + transaccional | Guía definitiva + FAQ ampliada | `Article`, `FAQPage` | Alta |
| Guía completa: Friendly Nations Visa | Informacional + transaccional | Guía definitiva + FAQ | `Article`, `FAQPage` | Alta |
| Guía completa: Qualified Investor Visa | Transaccional (alto valor) | Guía + tabla de requisitos | `Article` | Alta |
| Guía completa: Digital Nomad / Short Stay Visa | Informacional, tendencia creciente | Guía + HowTo (proceso de aplicación) | `Article`, `HowTo` | Alta |
| Panamá vs. Costa Rica / México (residencia para retirados) | Comparativa — alta tasa de citación en IA (~33%) | Tabla comparativa | `Article`, `ItemList` | Alta |
| Cómo abrir una corporación panameña (S.A.) | Transaccional | Guía + HowTo paso a paso | `HowTo` | Media |
| Cómo abrir una cuenta bancaria en Panamá como extranjero | Informacional + transaccional | Guía + HowTo | `HowTo` | Media |
| Costo de vida en Panamá para expatriados | Informacional, con datos citables | Guía con estadísticas y fuentes fechadas | `Article` | Media |
| Comprar bienes raíces en Panamá como extranjero | Transaccional | Guía | `Article` | Media |
| Sistema fiscal territorial de Panamá explicado | Informacional, autoridad temática | Guía explicativa | `Article` | Baja |

**Recomendaciones transversales para cada pieza:**
- Bloque de definición de 40-60 palabras al inicio (optimizado para extracción por IA).
- Al menos una estadística con fuente y fecha citada (boost de +37-40% en visibilidad IA según estudio Princeton GEO).
- Nombre y credenciales del autor/abogado responsable del contenido (E-E-A-T) — actualmente ausente en todo el sitio.
- Fecha de "última actualización" visible.
- Enlace interno desde/hacia la sección de Visa Programs y FAQ de la home.
- Publicar en ambos idiomas (EN/ES) desde el día uno, siguiendo el patrón de `translations.ts` o migrando a content collections de Astro si el volumen de contenido crece más allá de ~10 piezas.

**Siguiente paso técnico recomendado (fuera de este ciclo):** si se decide avanzar con este roadmap, migrar de páginas estáticas individuales a **Astro Content Collections** (`src/content/blog/`) para no repetir la duplicación EN/ES manual que ya causó los problemas de la sección 2.

---

## 6. Registro de cambios implementados en este ciclo

| Archivo | Cambio |
|---|---|
| `relocate_v3_astro/public/robots.txt` | Allow explícito para bots de IA de búsqueda/citación; Disallow solo para CCBot; referencia única al sitemap generado |
| `relocate_v3_astro/public/sitemap.xml` | Eliminado (reemplazado por el generado automáticamente por `@astrojs/sitemap`) |
| `relocate_v3_astro/astro.config.mjs` | Filtro para excluir `/thanks` y `/gracias` del sitemap generado |
| `relocate_v3_astro/src/layouts/Layout.astro` | `aggregateRating`/`review` agregados a `LegalService` schema; prop `noindex` añadida y aplicada condicionalmente al meta `robots` |
| `relocate_v3_astro/src/pages/index.astro` | `<main>` landmark; `aria-expanded`/`aria-controls` en las 8 preguntas de FAQ + JS actualizado; corregido bug de enlace `/en` → `/`; nota de "última revisión" en el footer |
| `relocate_v3_astro/src/pages/es.astro` | Mismos cambios que `index.astro` (main, aria, footer) |
| `relocate_v3_astro/src/pages/thanks.astro` | `noindex={true}` |
| `relocate_v3_astro/src/pages/gracias.astro` | `noindex={true}` |
| `relocate_v3_astro/src/pages/[lang].astro` | Eliminado (duplicaba/colisionaba con `index.astro`/`es.astro`) |
| `relocate_v3_astro/public/llms.txt` | Creado |
| `docs/ai-seo-audit-2026-08.md` | Este documento |

**Verificación realizada:** `npm run build` dentro de `relocate_v3_astro/` completó sin errores, generando 4 páginas (`/`, `/es`, `/thanks`, `/gracias`) y un `sitemap-0.xml` con únicamente `/` y `/es/`. Se confirmó por `grep` sobre el HTML generado que `aggregateRating`, `<main>`, los 8 atributos `aria-expanded`, y la nota de última revisión están presentes en el build final. `llms.txt` se copia correctamente a `dist/`.

**Pendiente de acción del usuario (fuera del alcance de este repo):**
1. Desactivar el bloqueo de bots de IA en el dashboard de Cloudflare (Security → Bots) — ver instrucciones en la sección 2. **Esta es la acción de mayor impacto de toda la auditoría.**
2. Decidir si se conecta GA4/Google Search Console (requiere Measurement ID / verificación de propiedad del usuario).
3. Revisar y aprobar el roadmap de contenido de la sección 5 antes de iniciar la redacción.
