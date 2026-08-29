# GeekStore — Instrucciones de Estándares de Frontend

Estas reglas aplican a **todo** el desarrollo del frontend en Cursor, desde el Día 1 del roadmap. No son features puntuales — son estándares transversales que se siguen en cada componente/vista que se construya.

---

## 1. Diseño responsivo e interactivo (Mobile-First)

- Diseñar primero para mobile, expandir a tablet/desktop — no al revés. Con Tailwind, esto significa definir estilos base para mobile y usar los prefijos (`md:`, `lg:`) para escalar hacia arriba, nunca al contrario.
- Toda vista debe verse y funcionar correctamente en al menos 3 breakpoints: mobile (~375px), tablet (~768px), desktop (~1280px+).
- Interacciones (hover, focus, active, loading states) deben tener retroalimentación visual clara — nunca un botón que "no hace nada" visualmente al presionarlo mientras carga.
- Evitar layouts que solo funcionen con mouse (hover-only) — deben ser usables con touch.

### Caso especial: Navbar flotante con recorte (notched navbar)

La barra de navegación inferior —con el botón circular flotante y el contorno ondulado a su alrededor (sube, forma dos protuberancias laterales, y baja hacia el hueco del botón)— se construye 100% con Tailwind + SVG. No requiere styled-components ni ninguna librería CSS-en-JS para la forma.

**Visible en TODOS los breakpoints (mobile y desktop), decisión de diseño intencional** — no se oculta en desktop aunque no sea el patrón más común ahí; es un elemento distintivo del proyecto.

- **Forma del contorno:** un único `<svg><path>` con curvas Bézier (`C`), no `clip-path` simple — un notch cóncavo básico no reproduce el rebote hacia arriba a los lados del botón.
- **Botón circular flotante:** posicionamiento absoluto sobre el SVG (`absolute -top-6 left-1/2 -translate-x-1/2`), estilizado con Tailwind normal.
- **Íconos (home, buscar, carrito):** posicionados encima del SVG como elementos normales estilizados con Tailwind.

**Animación al cambiar de ícono activo (ej. Home → Búsqueda):**
- **Librería:** Framer Motion (se instala como `framer-motion`) — es el estándar actual en el ecosistema React/Next.js para animaciones de entrada/salida (enter/exit), que CSS puro no puede resolver por sí solo cuando un elemento se remueve del DOM.
- Usar `<AnimatePresence mode="wait">` envolviendo el ícono activo, con `initial`/`animate`/`exit` para el efecto de desvanecer/mover mientras cambia de opción.
- Este componente (el que maneja qué ícono está activo y su animación) requiere `"use client"` — ya estaba contemplado, porque el estado de ruta activa de por sí lo requería. Framer Motion no se usa como reemplazo de Tailwind para estilos generales, solo quirúrgicamente en este componente puntual de animación.

---

## 2. Internacionalización (i18n) — Español/Inglés sin duplicar vistas

- **Librería:** `next-intl` (estándar actual para Next.js App Router — no usar `next-i18next`, que es del patrón antiguo de Pages Router).
- **Estructura de URL con prefijo de idioma:** `/es/producto/x` y `/en/producto/x` — mejor para SEO (cada idioma indexable por separado) y es el patrón por defecto que espera `next-intl`.
- **Traducciones en archivos separados por idioma**, nunca hardcodeadas en los componentes:
  ```
  /messages/es.json
  /messages/en.json
  ```
- Un mismo componente/vista sirve para ambos idiomas — el contenido cambia, la estructura y lógica no se duplican.
- Selector de idioma visible y persistente (guardar preferencia, ej. cookie o localStorage) para que no reinicie en cada visita.

---

## 3. Accesibilidad (a11y)

- **HTML semántico:** usar las etiquetas correctas según su propósito (`<header>`, `<main>`, `<section>`, `<nav>`, `<form>`, `<h1>`-`<h6>` en orden jerárquico real, no por tamaño visual deseado).
- **Labels asociados correctamente a inputs:** siempre `<label htmlFor="id">` conectado al `id` del input — nunca solo texto visualmente cerca sin la asociación real (esto es un problema que ya se encontró en las vistas actuales de login/signup).
- **Navegación por teclado:** todo elemento interactivo (botones, links, inputs) debe ser alcanzable con `Tab` y tener un estado de `focus` visible — no remover el outline de focus sin reemplazarlo por una alternativa visible.
- **Contraste de color adecuado:** especialmente relevante con las bandas de color por marca (PlayStation azul, Xbox verde, Nintendo rojo) — validar que el texto sobre esos fondos cumpla contraste legible en modo claro y oscuro.
- **Imágenes con `alt` descriptivo real:** usar siempre el componente `<Image>` de Next.js (que exige `alt` por diseño). El texto debe describir el contenido real (ej. "PlayStation 5 con control DualSense"), no genérico (ej. "imagen producto") — esto sirve tanto para lectores de pantalla como de fallback visual si la imagen no carga.

---

## 4. Header — Dropdown de configuración (avatar)

El Header **no duplica navegación que ya vive en la Navbar** (catálogo, cuenta). Se limita a: logo "GeekStore" + avatar del usuario, donde el avatar es un **trigger de dropdown** (no un link directo a `/account`).

**Contenido del dropdown:**
- Cerrar sesión
- Selector de idioma (ES/EN) — vive aquí, no como botones sueltos junto al header
- Selector de tema (Dark/Light/Sistema) — migrado del botón flotante circular del proyecto legacy, ya no existe como elemento suelto en pantalla

**Persistencia del tema:** vive en `localStorage` (vía `next-themes`), **no en base de datos**. Es una preferencia de dispositivo, no un dato de negocio — se detecta `prefers-color-scheme` del sistema por defecto, con override manual del usuario guardado localmente. No requiere campo en el modelo `User`.

**Accesibilidad:** el dropdown es navegable por teclado (`Tab`, `Escape` para cerrar), con `aria-expanded` en el trigger — mismo estándar que el resto de la sección 3.

---

## 5. Header fusionado con menú de pestañas (regla general, todo el sitio)

Donde exista un header con una fila de pestañas/menú justo debajo (navegación de sección), ambos se fusionan visualmente en un solo bloque — mismo color de fondo, sin barra ni separación entre header y pestañas. Aplica a catálogo/home y cuenta de usuario (Perfil/Direcciones/Mis pedidos/Lista de deseos/Seguridad) — **el Dashboard admin NO usa este patrón, ver sección 6.**

- **Pestaña activa:** usa el color de acento del tema activo (Dark/Light), tomado de la configuración de Tailwind ya existente (migrada de `Themes.jsx`) — nunca un hex nuevo hardcodeado por sección.
- **Breadcrumb en vistas de detalle:** cuando el usuario entra a un nivel de detalle dentro de una sección (ej. editar un producto, editar una dirección), la fila completa de pestañas se reemplaza por un breadcrumb de jerarquía (ej. "Dashboard → Productos → Spider-Man 2"), con un botón "← Volver" visible junto a él. Las pestañas completas solo se muestran en las vistas de nivel superior de cada sección.

---

## 6. Panel Admin (`/admin/*`) — layout completamente separado, sidebar en vez de Navbar

El admin es una herramienta de trabajo, no la experiencia de marca del cliente — no comparte el patrón de Navbar flotante con recorte ni el header fusionado con pestañas. Tiene su propio `layout.tsx` en `app/[locale]/admin/`.

**Estructura:**
- **Sidebar fija** (izquierda en desktop, colapsable a drawer/hamburguesa en breakpoints mobile) con links directos: Dashboard, Productos, Categorías, Marcas, Órdenes — cada uno como texto claro, resaltando el activo con el color de acento del tema (mismo criterio que la sección 5), no íconos ambiguos que haya que adivinar
- **Header superior simplificado**: reutiliza el dropdown de cuenta ya construido (cerrar sesión, idioma, tema) — sin "Catálogo", sin nada orientado a cliente
- **Sin Navbar inferior, sin botón flotante estilo mascota** — cualquier acción rápida (ej. "Nuevo producto") es un botón normal dentro de la página correspondiente, no un elemento flotante de navegación global
- **`/account` (perfil personal del usuario, sea admin o cliente) NO es parte de este layout** — sigue usando el Header+Navbar normal de cliente, ya que ahí el admin actúa como usuario, no como herramienta de gestión

---

## Nota para Cursor

Estas 3 categorías (responsivo/interactivo, i18n, accesibilidad) se validan en **cada** componente nuevo que se construya durante el roadmap — no son una fase aparte al final. Si un componente no cumple alguno de estos puntos, se corrige antes de continuar al siguiente, no se deja pendiente para "pulir después".

**Sobre estilos:** el proyecto usa Tailwind CSS como sistema de estilos único. No se usa styled-components ni otra librería CSS-en-JS — cualquier componente que use CSS-en-JS con runtime se vuelve automáticamente Client Component en Next.js App Router, lo cual entra en conflicto con la arquitectura de Server Components ya definida. La única excepción es Framer Motion, usado exclusivamente para animaciones puntuales (como la navbar), nunca para estilos generales.