# GeekStore — Roadmap Completo + Schema de Base de Datos

**Naturaleza del proyecto:** Ya no es un entregable de 15 días. Es tu proyecto insignia de portafolio, con un **hito de "portfolio-ready"** dentro del roadmap para cuando empieces a aplicar a trabajos, y fases posteriores que lo siguen puliendo mientras ya estás empleado.

**Regla del proyecto:** cada feature se construye completa o no se construye. Nada "a medias" solo por avanzar rápido.

---

## 1. ROADMAP POR FASES

### 🎯 HITO 1 — "Portfolio-Ready" (Semanas 1-3, ~36-45h)
Objetivo: tener algo deployado, funcional y defendible en entrevista, aunque no tenga TODO.

- Migración a Next.js 15 (App Router) + Prisma + PostgreSQL
- Catálogo + detalle de producto desde DB real (con página 404 dedicada — `not-found.tsx` — para producto no encontrado)
- Auth con credenciales + Google OAuth (Microsoft se agrega en Hito 2, no bloquea)
- Carrito con subtotal por línea, total, aviso de stock y estado vacío + checkout con **un solo** proveedor de pago (Stripe, por documentación más simple)
- Cuenta de usuario con pestañas: perfil editable, direcciones, historial de pedidos
- Recomendaciones con Claude API ("también te puede interesar" en producto, carrito y 404)
- IA sugiere `bannerColor` al crear una marca nueva desde el dashboard (dado el nombre, ej. "Nintendo" → sugiere el rojo característico)
- Dashboard admin **básico**: CRUD de productos (crear, editar, eliminar — no solo crear), ver órdenes
- Página "Sobre nosotros" con narrativa de marca, separada del crédito de autoría (ver sección 8)
- Deploy + README profesional

**Al final de este hito: ya puedes ponerlo en tu CV y defenderlo en entrevista.**

---

### 🔧 HITO 2 — E-commerce Completo (Semanas 4-6, ~30-36h)
Se hace en paralelo a que ya estés buscando/en entrevistas, o justo después de conseguir empleo.

- Mercado Pago como segundo método de pago (relevante para mercado mexicano — esto en entrevista local pesa mucho)
- Microsoft OAuth (Azure AD / Entra ID)
- Dashboard admin completo: gestión de inventario (stock), reportes de ventas, gestión de usuarios
- Sistema de reseñas/calificaciones de productos
- Manejo de estados de orden (pendiente, pagado, enviado, cancelado)
- Tour de bienvenida en primera visita con la mascota v4: detecta primera vez (cookie/localStorage), secuencia de pasos guiando catálogo/carrito/cuenta

---

### 🚀 HITO 3 — Pulido y Diferenciación (Semanas 7+, según disponibilidad)
Ya con empleo, ritmo más relajado — esto es lo que separa un portafolio bueno de uno excepcional.

- Panel de analíticas para admin (ventas por categoría, productos más vistos)
- Búsqueda avanzada (filtros combinados, búsqueda semántica con embeddings + IA)
- Actualización en tiempo real del catálogo (WebSockets/SSE) cuando el admin crea/edita un producto, sin que el cliente tenga que refrescar — por ahora (Hito 1) el catálogo se actualiza vía `revalidatePath` al navegar/recargar, no en vivo
- Sistema de wishlist / favoritos — *schema (`Wishlist`) y UI ya diseñados desde Hito 1 (ver secciones 4 y 7); se puede adelantar si se decide, no depende de nada de Hito 2*
- Notificaciones (email transaccional: confirmación de orden, etc.)
- Tests automatizados (al menos unit tests de las funciones críticas — esto es EXACTAMENTE lo que un entrevistador senior pregunta y casi nadie en portafolios junior tiene)

---

📱 **App nativa iOS (Swift):** documentada aparte en `GeekStore_App_Swift_Roadmap.md` — no compite con el timeline de este documento, es entrenamiento futuro sin fecha comprometida.

---

## 2. STACK FINAL (actualizado con las adiciones)

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router, TypeScript) |
| ORM | Prisma |
| DB | PostgreSQL (Supabase o Railway) |
| Auth | Auth.js (NextAuth v5) — Credentials + Google + Microsoft (Entra ID) |
| Pagos | Stripe (Hito 1) + Mercado Pago (Hito 2) |
| IA | Claude API (Anthropic SDK) en producción / Ollama + `qwen2.5:3b` en desarrollo local — abstraídos vía Vercel AI SDK, intercambiables por variable de entorno `AI_PROVIDER` sin tocar código de llamada |
| Estilos | Tailwind CSS |
| Deploy | Vercel |
| Email transaccional (Hito 3) | Resend |

---

## 3. ARQUITECTURA

**Patrón: Monolito Modular con Next.js (Full-Stack)** — un solo proyecto/deploy, pero con responsabilidades separadas en capas que no se mezclan.

```
┌─────────────────────────────────────────┐
│           Next.js App Router              │
│                                             │
│  ┌───────────────┐    ┌─────────────────┐ │
│  │  Presentación   │    │   API Routes /   │ │
│  │  (Server/Client │───▶│  Server Actions  │ │
│  │   Components)   │    │  (/app/api/...)  │ │
│  └───────────────┘    └────────┬────────┘ │
│                                   │           │
│                          ┌────────▼────────┐ │
│                          │  Capa de datos   │ │
│                          │  (Prisma Client) │ │
│                          └────────┬────────┘ │
└───────────────────────────────────┼──────────┘
                                      │
                             ┌────────▼────────┐
                             │   PostgreSQL     │
                             └──────────────────┘
```

**Por qué monolito y no microservicios:** microservicios resuelven problemas de equipos grandes trabajando en paralelo o escalado independiente de partes del sistema — ninguno de los dos aplica a un dev solo construyendo un MVP. Se empieza con monolito bien modularizado; se extrae a microservicio solo cuando hay una razón concreta de escala o equipo, no por defecto.

**Server Components vs Client Components:**
- **Server Component** (default en Next.js 15): se renderiza en el servidor, puede usar Prisma directamente, no manda JS al navegador. Se usa para: catálogo, detalle de producto, cualquier vista que solo muestra datos.
- **Client Component** (`"use client"`): se hidrata en el navegador, tiene estado e interacción (`onClick`, hooks). Se usa para: botón "agregar al carrito", formularios, toggles.

**Server Actions + API Routes (combinados, no uno solo):**
- **Server Actions** (`"use server"`): mutaciones internas del usuario en la web — carrito, checkout desde formulario. Más simple, sin definir endpoint REST aparte.
- **API Routes** (`/app/api/...`): todo lo que se integra con algo externo a Next.js — webhook de Stripe/Mercado Pago (requieren una URL REST real), y la futura app Swift (Server Actions no son invocables fuera del framework).

---

## 4. SCHEMA DE BASE DE DATOS (Prisma)

### Diagrama de relaciones (resumen)

```
User 1───1 Customer 1───N Address
User 1───N Order N───N Product (vía OrderItem)
User 1───N CartItem N───1 Product
User 1───N Review N───1 Product
User 1───N Wishlist N───1 Product
User 1───1 Account (OAuth, manejado por NextAuth)
Order N───1 Address (envío)
Product N───1 Category
Product N───1 Brand
Product 1───N ProductImage
Order 1───1 Payment
```

### Definición de tablas

**User**
| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (cuid) | PK |
| name | String? | |
| email | String | unique |
| emailVerified | DateTime? | requerido por NextAuth |
| image | String? | avatar (de OAuth o subido) |
| passwordHash | String? | null si solo usa OAuth |
| role | Enum: `CUSTOMER`, `ADMIN` | default `CUSTOMER` |
| createdAt | DateTime | default now() |

**Account** (manejado por Auth.js para OAuth — Google/Microsoft). Requiere el schema estándar completo aunque la sesión use JWT: el adapter usa esta tabla para vincular cuentas OAuth a un `User`, independiente de dónde vive la sesión activa.
| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | FK → User |
| type | String | "oauth" |
| provider | String | "google" \| "microsoft-entra-id" |
| providerAccountId | String | |
| refresh_token / access_token / id_token | String? | tokens de OAuth |
| expires_at | Int? | |
| token_type | String? | |
| scope | String? | |
| session_state | String? | |

`@@unique([provider, providerAccountId])`

**Session** (requerida por el adapter de Auth.js aunque la estrategia activa sea JWT — el adapter espera que la tabla exista)
| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (cuid) | PK |
| sessionToken | String | unique |
| userId | String | FK → User |
| expires | DateTime | |

**VerificationToken** (requerida por el adapter — usada para flujos de verificación de email/magic link, aunque no se use activamente en Hito 1)
| Campo | Tipo | Notas |
|-------|------|-------|
| identifier | String | |
| token | String | unique |
| expires | DateTime | |

`@@unique([identifier, token])`

**Customer** (extensión 1:1 de `User`, solo aplica cuando `role = CUSTOMER`)
| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | FK → User, unique (relación 1:1) |
| phone | String? | |
| loyaltyPoints | Int | default 0 |
| stripeCustomerId | String? | unique — vincula con el Customer object de Stripe para guardar métodos de pago. Se crea la primera vez que el usuario paga o agrega una tarjeta; nunca se guarda el número de tarjeta en esta base de datos, solo la referencia |
| createdAt | DateTime | |

**Address** (un cliente puede tener varias — casa, oficina, etc.)
| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (cuid) | PK |
| customerId | String | FK → Customer |
| label | String | ej. "Casa", "Oficina" |
| street | String | |
| city | String | |
| state | String | |
| zipCode | String | |
| country | String | |
| isDefault | Boolean | default false — cuál se preselecciona en checkout |

**Category**
| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (cuid) | PK |
| name | String | ej. "Consolas", "Periféricos" |
| slug | String | unique, para URLs |

**Brand** (fabricante/plataforma — distinto de Category)
| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (cuid) | PK |
| name | String | ej. "PlayStation", "Xbox", "Nintendo" |
| slug | String | unique |
| logoUrl | String | imagen de marca usada como fondo/banner en las cards |
| bannerColor | String | color/hex de la marca — fallback si `logoUrl` no carga, y base para acentos de UI (bordes, sombras). Sugerido automáticamente por IA al crear la marca (ver Hito 1) |

**Genre** (solo aplica a videojuegos — un juego puede tener varios, relación muchos-a-muchos)
| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (cuid) | PK |
| name | String | ej. "Acción", "RPG", "Deportes" |
| slug | String | unique |

**Product**
| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (cuid) | PK |
| name | String | |
| description | String | |
| price | Decimal | |
| stock | Int | control de inventario (clave para dashboard admin) |
| coverImageUrl | String | imagen principal/portada — se usa en catálogo, cards, listados |
| categoryId | String | FK → Category |
| brandId | String | FK → Brand |
| genres | Genre[] | relación muchos-a-muchos (implícita en Prisma) — opcional, solo relevante para productos tipo videojuego |
| isFeatured | Boolean | default false — marca el producto como "estelar" para el layout hero de detalle |
| heroImageUrl | String? | imagen grande estilo hero (distinta de `coverImageUrl`) — solo se usa/pide si `isFeatured` es true |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**ProductImage** (galería secundaria únicamente — NO incluye la portada)
| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (cuid) | PK |
| productId | String | FK → Product |
| url | String | capturas adicionales, ángulos, etc. |
| order | Int | orden de despliegue en galería |

**Promotion** (banners del carousel de home, editables por el admin — reemplaza el carousel estático)
| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (cuid) | PK |
| title | String | interno, para identificarlo en el admin — no necesariamente visible en el banner |
| imageUrl | String | imagen del banner |
| productId | String | FK → Product — al hacer clic, lleva al detalle de ese producto |
| order | Int | orden de despliegue en el carousel |
| active | Boolean | default true — permite desactivar sin eliminar |
| createdAt | DateTime | |

**CartItem**
| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | FK → User |
| productId | String | FK → Product |
| quantity | Int | |

`@@unique([userId, productId])` — evita duplicar filas al hacer merge del carrito de invitado al iniciar sesión; mismo patrón que `Wishlist`.

**Order**
| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | FK → User |
| shippingAddressId | String | FK → Address — se copia el snapshot de datos en envío real (Hito 2), aquí referencia directa basta para MVP |
| status | Enum: `PENDING`, `PAID`, `SHIPPED`, `CANCELLED` | |
| total | Decimal | |
| createdAt | DateTime | |

**OrderItem** (tabla intermedia Order↔Product, guarda precio histórico)
| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (cuid) | PK |
| orderId | String | FK → Order |
| productId | String | FK → Product |
| quantity | Int | |
| priceAtPurchase | Decimal | importante: el precio puede cambiar después, esto lo congela |

**Payment**
| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (cuid) | PK |
| orderId | String | FK → Order, unique (1:1) |
| provider | Enum: `STRIPE`, `MERCADO_PAGO` | |
| externalId | String | ID de la transacción en el proveedor |
| status | Enum: `PENDING`, `COMPLETED`, `FAILED` | |
| amount | Decimal | |

**Review**
| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | FK → User |
| productId | String | FK → Product |
| rating | Int | 1-5 |
| comment | String? | |
| createdAt | DateTime | |

**Wishlist** (lista de deseos — favoritos del cliente)
| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | FK → User |
| productId | String | FK → Product |
| createdAt | DateTime | default now() |

`@@unique([userId, productId])` — un producto no se duplica en la lista de un mismo usuario; el corazón de la UI (outline = agregar, relleno = quitar) hace upsert/delete sobre esa combinación, no necesita lógica extra de validación.

---

### Por qué este schema es defendible en entrevista

- **`OrderItem` con `priceAtPurchase` en vez de solo referenciar `Product.price`**: demuestra que entiendes un problema real de e-commerce (el precio cambia con el tiempo, pero la orden histórica no debe cambiar)
- **`Payment` como tabla separada de `Order`**: permite soportar múltiples proveedores sin ensuciar la tabla de órdenes — esto es literalmente por qué se agrega Mercado Pago sin rehacer nada
- **`stock` en `Product`**: sin esto, el dashboard admin no tiene sentido — no puedes "controlar lo que vendes" sin saber cuánto tienes
- **`coverImageUrl` en `Product` en vez de un flag `isCover` en `ProductImage`**: el catálogo consulta solo `Product` sin JOIN para mostrar la portada (más simple y rápido), y elimina la posibilidad de tener dos imágenes marcadas como portada al mismo tiempo
- **`Brand` como tabla separada de `Category`**: permite que un admin agregue una nueva marca (ej. "Steam") desde el dashboard sin tocar código — si el color/logo de marca estuviera hardcodeado en el frontend (como probablemente estaba en la versión CRA), cada marca nueva requeriría un deploy
- **`Customer` como extensión 1:1 de `User` (no una tabla de usuarios paralela)**: el login, email y rol siguen centralizados en `User` (así lo espera Auth.js), y `Customer` solo guarda lo que es exclusivo de clientes (puntos de lealtad, teléfono) — evita duplicar identidad entre dos tablas de "usuario"
- **`Address` separada de `Customer` (no campos de dirección inline)**: un cliente real tiene más de una dirección (casa, oficina); meterlo como tabla evita rehacer el schema cuando se necesite soportar múltiples direcciones o una libreta de direcciones
- **`role` en `User`**: patrón estándar para distinguir admin de cliente sin tabla separada
- **`Wishlist` con `@@unique([userId, productId])`**: la restricción de "no duplicados" vive en la base de datos, no solo en el cliente — evita condiciones de carrera si el usuario hace doble clic en el corazón

---

## 5. ORDEN DE EJECUCIÓN SUGERIDO (Semanas 1-3 detalladas)

**Semana 1 — Fundación**
- Días 1-2: Next.js + Prisma + schema completo arriba + migrations + seed
- Días 3-4: Catálogo + detalle de producto desde DB, **incluyendo explícitamente:**
  - Header con logo/branding de GeekStore (no genérico)
  - Navbar inferior mobile con recorte y botón flotante (ver `GeekStore_Instrucciones_Frontend.md`, sección "Caso especial")
  - Carousel de banner en home (presente en GeekStore-Demo original)
  - Cards de producto replicando la estructura visual original (logo de marca superpuesto, franja diagonal de color, carátula centrada) — corrigiendo solo jerarquía/botones, no reinterpretando el diseño desde cero
- Día 5: Auth (Credentials + Google OAuth)

**Semana 2 — Transacciones**
- Días 6-7: Carrito (persistido en DB vía `CartItem`)
- Día 8: Cuenta de usuario (mockup 10) — **necesario antes de checkout, que depende de `Address` existente:**
  - Perfil editable (`Customer`: nombre, apellido, correo, teléfono)
  - Direcciones: crear, editar, marcar predeterminada (mockup 05) — desbloquea el checkout
  - Mis pedidos y Lista de deseos: estado vacío real por ahora (aún no hay `Order` ni interacción con `Wishlist` en UI) — no se simulan datos falsos
  - Seguridad / zona de peligro: cerrar sesión, eliminar cuenta
- Días 9-10: Checkout + integración Stripe (modo test) — **Payment Element embebido en `/checkout` (no redirect a Stripe Checkout hospedado)**, con tarjetas guardadas vía `Customer.stripeCustomerId`
- Día 11: Webhook de Stripe → actualizar `Payment` y `Order.status`, **y descontar `Product.stock` por cada `OrderItem` de la orden** (dentro de la misma transacción, con verificación de idempotencia — Stripe puede reintentar el evento)

**Semana 3 — Admin + IA + Cierre**
- Días 12-13: Dashboard admin básico (CRUD productos y **categorías** — no solo marcas, ver/actualizar stock, ver órdenes) — incluye configurar Supabase Storage (buckets `brand-logos`, `product-images`) y el componente `ImageUpload`
- Día 14: Búsqueda básica de productos — el ícono de lupa en la Navbar no tenía funcionalidad detrás; búsqueda por nombre/descripción vía Prisma (`contains`, case-insensitive), resultados con el mismo componente de card del catálogo. **No confundir con la búsqueda avanzada (filtros combinados, semántica con embeddings) de Hito 3** — esto es solo texto simple.
- Día 15: Extensiones de catálogo (agregado durante desarrollo, no en el plan original):
  - **Género en videojuegos**: modelo `Genre`, relación muchos-a-muchos con `Product`, gestión CRUD en admin, filtro/badge en catálogo y detalle
  - **Carousel dinámico editable por admin**: modelo `Promotion` reemplaza el carousel estático — el admin sube banners (imagen + producto al que enlaza + orden + activo/inactivo), soporta N elementos, cada uno clickeable al detalle del producto
  - **Productos "estelares"**: `Product.isFeatured` + `Product.heroImageUrl` — layout de detalle alternativo estilo hero (inspirado en la página de PlayStation) para productos marcados, con panel de compra/calificación que se adapta al hacer scroll (Client Component, Intersection Observer)
- Día 16: Recomendaciones con Claude API — presentadas como comentario de la mascota v4 (control de videojuegos) en globo de diálogo junto al producto: "uno de nuestros más valorados" para usuarios sin historial, o personalizado ("la última vez compraste X, te encantará Y") para usuarios logueados con órdenes previas (`Order`/`OrderItem`)
- Día 17: Endurecimiento de seguridad y rendimiento (todas las rutas ya existen — revisión completa, no parcial):
  - **RLS (Row Level Security)** habilitado en Supabase como defensa en profundidad, aunque el acceso normal ya pasa exclusivamente por Prisma server-side
  - **Rate limiting** en login/registro (fuerza bruta), webhook de Stripe, y endpoint de recomendaciones con Claude API
  - **Source maps de producción**: confirmar `productionBrowserSourceMaps: false` en `next.config` (default de Next.js, verificar que nadie lo haya activado para debug)
  - **Estrategia de caché**: revisión de las 13 vistas — confirmar `revalidatePath`/`revalidateTag` correctos donde hay mutaciones (carrito, direcciones, admin), y que catálogo/producto usen caché apropiado sin mostrar stock/precio desactualizado
  - **Paginación**: catálogo, "Mis pedidos", y listas del admin (productos, órdenes) actualmente traen todos los registros sin límite (`findMany` sin `take`/`skip`) — agregar paginación real antes de que el volumen de datos lo vuelva notable
  - **Índices de base de datos** (`@@index` en `schema.prisma`): agregar a columnas consultadas frecuentemente sin índice — `Product.categoryId`, `Product.brandId`, `Order.userId`, `Order.status`, `CartItem.userId`, `Review.productId`, `Wishlist.userId`
- Día 18: Deploy + variables de entorno en producción — incluye configurar el webhook de Stripe DIRECTO en el Dashboard (Developers → Webhooks → Add endpoint, apuntando a la URL real de Vercel), que genera un `STRIPE_WEBHOOK_SECRET` distinto al de `stripe listen` local; también cambiar `AI_PROVIDER=claude` con `ANTHROPIC_API_KEY` real (Ollama no corre en Vercel)
- Día 19: README + preparar narrativa técnica para entrevistas

**Al final del Hito 1 (ahora ~16 días de trabajo efectivo) tienes todo listo — no es un plazo de calendario rígido, es el orden lógico de dependencias.**

---

## 6. Lo que NO se sacrifica (a diferencia del plan anterior)

- ✅ Dashboard admin — sí está, básico en Hito 1, completo en Hito 2
- ✅ Pagos reales — Stripe en Hito 1, Mercado Pago en Hito 2
- ✅ OAuth — Google en Hito 1, Microsoft en Hito 2 (no bloquea el lanzamiento)
- ✅ Roadmap — este documento
- ✅ Arquitectura definida — sección 3
- ✅ Schema sólido — sección 4 completa
- ✅ UI validada antes de escribir código — 13 pantallas mockeadas (sección 7), no se construye a ciegas

---

## 7. VISTAS VALIDADAS EN MOCKUPS (referencia UI)

Antes de tocar código se maquetaron 13 pantallas (`GeekStore_Mockups.html`) con la paleta real del tema Dark y los productos reales del seed, cubriendo layout, estados vacíos/error y edge cases (stock agotado, cantidad mínima). Esta tabla es el mapa entre cada mockup y lo que hay que construir.

| # | Vista | Ruta sugerida | Modelo(s) | Nota |
|---|-------|---------------|-----------|------|
| 01 | Detalle de producto | `/product/[id]` | `Product`, `ProductImage`, `Review`, `Wishlist` | Rediseño completo — hoy solo muestra marca+título+foto. Incluye "también te puede interesar" |
| 02 | Checkout | `/checkout` | `Order`, `OrderItem`, `Payment`, `Address` | No existe hoy. Mercado Pago se muestra deshabilitado (llega en Hito 2) |
| 03 | Confirmación de orden | `/order/[id]/confirmation` | `Order`, `Payment` | Se dispara cuando el webhook de Stripe marca `Payment.status = COMPLETED` |
| 04 | Mis pedidos | `/account/orders` | `Order`, `OrderItem` | Los 4 badges = `Order.status` (PENDING, PAID, SHIPPED, CANCELLED) |
| 05 | Direcciones | `/account/addresses` | `Address` | Libreta con dirección predeterminada + formulario nuevo |
| 06 | Reseñas (componente) | dentro de `/product/[id]` | `Review` | Distribución de estrellas + formulario para publicar |
| 07 | Dashboard admin | `/admin` | `Order`, `Product` | Stat tiles, ventas 7 días, top productos, órdenes recientes |
| 08 | Gestión de productos (admin) | `/admin/products` | `Product`, `Category`, `Brand` | CRUD completo — hoy `ProductRegister` solo crea |
| 09 | Página 404 | `/product/[id]/not-found.tsx` | — | Reemplaza el crash actual (`products.find` sin resultado) |
| 10 | Mi cuenta (mejorada) | `/account` | `User`, `Customer`, `Address`, `Order`, `Wishlist` | Header con pestañas hacia 04, 05 y 13; expone `Customer.loyaltyPoints` |
| 11 | Sobre nosotros | `/about` | — | Narrativa de marca; ver decisión de contenido en sección 8 |
| 12 | Carrito (mejorado) | `/cart` | `CartItem`, `Product` | Subtotal, total, barra de envío gratis, estado vacío, anatomía de card (eliminar/±cantidad) |
| 13 | Lista de deseos | `/account/wishlist` | `Wishlist`, `Product` | Comprar ahora / agregar al carrito / quitar; contempla producto agotado |

---

## 8. DECISIONES DE PRODUCTO Y UX

Decisiones tomadas durante el diseño de los mockups, documentadas aquí para no re-discutirlas a medio desarrollo.

- **"Sobre nosotros" vende la marca, no es un CV**: `/about` cuenta la historia de GeekStore (misión, stats, valores) — el crédito de autoría baja a una firma discreta al final (nombre + links a GitHub/LinkedIn), no a una sección con foto y puestos. Un recruiter que abre el demo lo ve primero como tienda.
- **Carrito: "−" se convierte en eliminar cuando `quantity === 1`**: en vez de permitir bajar a 0 (que no significa nada en un carrito), el botón de disminuir cambia a ícono de bote de basura en ese caso. El botón X de la esquina sigue disponible en paralelo para eliminar sin importar la cantidad.
- **El corazón de wishlist es un solo control, no dos botones**: outline = agregar, relleno = ya está guardado y quita al hacer clic (upsert/delete sobre `Wishlist`, ver sección 4).
- **Producto agotado en la lista de deseos**: se deshabilitan "Comprar ahora" y "Agregar al carrito", pero se conserva la opción de quitarlo — nunca se bloquea la salida.
- **Categoría separada de Marca en el admin**: el formulario de alta/edición de producto (pantalla 08) siempre pide `categoryId` y `brandId` por separado, aunque hoy la UI de CRA solo tiene selector de marca.
- **El admin puede comprar como cliente (cuenta dual)**: el Carrito se mantiene en la Navbar de tienda para todos los roles por igual, sin excepción para ADMIN. El acceso al Panel Admin es vía el dropdown de cuenta ("Panel admin"), no un slot dedicado en la Navbar — la tienda y el panel de gestión son experiencias separadas (ver `GeekStore_Instrucciones_Frontend.md` sección 6), pero la misma persona puede usar ambas.
- **Estructura de carpetas con route group `(store)/`**: las rutas de cliente (catálogo, carrito, cuenta, checkout) viven bajo un route group `(store)/` con su propio layout (Header+Navbar), hermano de `admin/` con su propio layout (sidebar). Se prefirió sobre renderizado condicional por pathname en un layout compartido — es el patrón estándar de Next.js App Router para layouts distintos entre secciones, más defendible en entrevista que una condición manual.
- **`Product.stock` se descuenta en el webhook (Día 11), no en el checkout**: solo cuando Stripe confirma `payment_intent.succeeded` — evita "reservar" inventario fantasma de compras nunca pagadas. Se hace dentro de una transacción de Prisma junto con la actualización de `Payment`/`Order`, y con verificación de idempotencia (`Payment.status` ya `COMPLETED` → no reprocesar) porque Stripe puede reintentar la entrega del mismo evento.
- **Navbar inferior visible en todos los breakpoints, Header simplificado a dropdown**: la Navbar (con su botón flotante distintivo) se mantiene en desktop además de mobile, por decisión estética explícita — no sigue el patrón estándar de "solo mobile". Para evitar duplicar navegación, el Header se reduce a logo + avatar (trigger de dropdown con cerrar sesión, idioma, y tema — este último migrado del botón flotante circular del proyecto legacy). Detalle técnico completo en `GeekStore_Instrucciones_Frontend.md` sección 4.
- **Tema claro/oscuro en localStorage, no en base de datos**: es preferencia de dispositivo, no dato de negocio — se detecta el tema del sistema por defecto (`next-themes`), sin campo en `User`.
- **Umbral de envío gratis: $4,000 MXN, envío pagado $99 MXN**: derivado de los números del mockup 12 (subtotal $3,850, "te faltan $150", envío $99). Constantes centralizadas (`FREE_SHIPPING_THRESHOLD`, `PAID_SHIPPING`) — se reutilizan en checkout (Días 8-9), no se recalculan ahí.
- **Pago con Stripe embebido (Payment Element), no redirect a Stripe Checkout**: el formulario de tarjeta vive dentro de `/checkout`, con el logo "Validado por Stripe" — sigue siendo 100% PCI-compliant porque el campo sensible corre en un iframe de Stripe, la app nunca toca el número de tarjeta. Se eligió sobre el Checkout hospedado para no sacar al usuario del flujo de la tienda.
- **Tarjetas guardadas vía Stripe Customer**: `Customer.stripeCustomerId` vincula al usuario con su Customer object en Stripe; ahí se listan/seleccionan métodos de pago guardados. La base de datos de GeekStore nunca almacena datos de tarjeta, solo la referencia al Customer de Stripe.
- **Proveedor de IA intercambiable (Ollama local / Claude en producción)**: se abstrae en `lib/ai/client.ts` vía Vercel AI SDK, seleccionado por `AI_PROVIDER` en variables de entorno. Ningún código de llamada (recomendaciones, sugerencia de `bannerColor`) referencia el proveedor directamente. Modelo local específico: `qwen2.5:3b` (no la variante `latest`/7B) — elegido por el hardware disponible (CPU sin GPU dedicada, i3), donde 7B resulta notablemente lento; 3B es el punto de equilibrio entre velocidad en CPU y confiabilidad de salida estructurada (JSON) para los casos de uso del proyecto (sugerencias cortas, no conversación larga). Ollama no corre en Vercel — el cambio a Claude es obligatorio antes del deploy (Día 16), no opcional. Se recomienda probar los prompts finales contra Claude antes del deploy, no asumir comportamiento idéntico entre modelos.
- **Sugerencia de `bannerColor` automática, no manual**: se dispara sola (debounced) al terminar de escribir el nombre de la marca, sin botón — el admin puede sobreescribir el resultado manualmente después si no le convence. La precisión de la sugerencia depende del modelo activo (menos consistente con `qwen2.5:3b` local que con Claude en producción); se mitiga con temperatura baja y ejemplos few-shot en el prompt, pero no se espera precisión perfecta hasta el cambio a Claude.
- **Formulario de producto en admin replica el layout de detalle de producto**: panel grande a la derecha con la portada (`coverImageUrl`) y, debajo, la galería secundaria (`ProductImage`) — el formulario original solo manejaba la portada, se corrige para exponer ambas.