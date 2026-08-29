# GeekStore — Reglas de Migración para Cursor

Este archivo es el punto de partida que Cursor debe leer antes de tocar cualquier archivo del proyecto. No reemplaza a los otros tres documentos — los conecta y establece el orden en que mandan quando hay conflicto.

**Los 4 documentos del proyecto, y para qué sirve cada uno:**

| Documento | Para qué se consulta |
|-----------|----------------------|
| `GeekStore_Reglas_Cursor.md` (este archivo) | Reglas de comportamiento: qué preservar, qué actualizar, cómo resolver conflictos |
| `GeekStore_Roadmap_y_Schema.md` | Fases (Hito 1/2/3), arquitectura Next.js, schema completo de Prisma, mapa de vistas → rutas → modelos (sección 7), decisiones de UX (sección 8) |
| `GeekStore_Mockups.html` | Layout visual, copy, estados (vacío, error, agotado) de las 13 pantallas — ábrelo en navegador antes de construir cualquiera de esas vistas |
| `GeekStore_Instrucciones_Frontend.md` | Estándares transversales: mobile-first, i18n (`next-intl`), accesibilidad — aplican a **todo** componente, no son features puntuales |

**Sugerencia práctica:** además de mantenerlo como `.md` de referencia, vale la pena copiar el contenido de este archivo a `.cursor/rules/geekstore.mdc` (o a un `.cursorrules` en la raíz) para que Cursor lo cargue automáticamente en cada sesión sin tener que pegarlo manualmente cada vez.

---

## 1. Regla de oro: esto es una migración, no una reescritura desde cero

El proyecto actual (Create React App + styled-components + localStorage) tiene lógica de negocio que **ya funciona correctamente** y que no debe perderse solo porque cambia el framework. La tarea es **migrar el comportamiento**, no reinventarlo — salvo que el roadmap o los mockups indiquen explícitamente un cambio de diseño o UX.

Antes de escribir una vista o componente nuevo en Next.js, Cursor debe:
1. Buscar si existe una versión equivalente en `src/Pages` o `src/Components` del proyecto CRA actual.
2. Si existe, leerla y extraer la **lógica de negocio** (reglas de validación, condiciones, cálculos) — no el código en sí, que usa un stack que se está reemplazando.
3. Reimplementar esa lógica en el componente nuevo, en Tailwind + Server/Client Components según corresponda.

### Lo que sí debe conservarse tal cual (mismas reglas, nueva implementación)

- **Validaciones de formulario** (`src/Validations/Validations.js`): nombre mín. 3 caracteres, email mín. 8 caracteres + `@` + `.`, teléfono exactamente 10 dígitos, contraseña mín. 9 caracteres, confirmación de contraseña debe coincidir. Migrar a Zod (o el validador que se use con los formularios de Next.js) manteniendo los mismos umbrales, no unos nuevos "razonables".
- **Control de stock en cantidad**: el patrón de `handleQuantityChange` en `ShoppingCard/index.js` (no permitir cantidad mayor a `stock`) se conserva en el carrito nuevo — solo se le agrega el feedback visual que hoy falta (ver mockup 12).
- **Distinción de roles cliente/administrador**: la lógica de "solo administrador ve `/productRegister`" (hoy en `ProductRegister.jsx` vía `useSession`) se traduce a protección de rutas `/admin/*` con Auth.js, mismo criterio de negocio.
- **Paleta de colores del tema Dark/Light**: los valores exactos en `Components/UI/Themes.jsx` (`#19222D`, `#0E141A`, `#94D32E`, `#FF914D`, etc.) son los que ya se usaron para diseñar los 13 mockups — se llevan tal cual a la configuración de Tailwind, no se reinterpretan.
- **Productos y usuarios semilla existentes**: Spider-Man 2 / Gears of War 4 / Super Mario Bros. Wonder con sus precios y fotos reales (`src/assets/Images/*_fisico.jpg`) son los datos que ya se usaron en los mockups — el `seed.ts` de Prisma debe reutilizarlos, no inventar productos nuevos de placeholder.

### Lo que NO se migra — son bugs conocidos, no comportamiento a preservar

- El typo en `SignIn/Signing.jsx` línea 219 (`errorLastName.name.error` en vez de `.lastName.error`).
- El bug de `localStorage.setItem('users', JSON.stringify(props.updateUsers))` en `SignIn/Signing.jsx` línea 137 — guarda una función, no el arreglo de usuarios.
- El botón "Eliminar cuenta" en `Account.jsx` sin `onClick` (línea 41).
- La búsqueda por `startsWith` en `Search.jsx` en vez de coincidencia parcial.
- Contraseñas en texto plano comparadas en `Login.jsx` — se reemplaza por completo con Auth.js + bcrypt, no se preserva ni el patrón ni el dato.
- Los bloques de código comentado en `Search.jsx` (líneas 48-96) — se eliminan, no se migran "por si acaso".

---

## 2. Regla de actualización: lo que sí cambia por completo

Esto no es opcional ni incremental — es lo que ya se decidió en `GeekStore_Roadmap_y_Schema.md` y se validó visualmente en `GeekStore_Mockups.html`:

- **Framework**: CRA → Next.js 15 (App Router, TypeScript).
- **Persistencia**: `localStorage` → PostgreSQL vía Prisma (schema completo en sección 4 del roadmap, incluyendo `Wishlist` que no existía en el proyecto original).
- **Estilos**: styled-components → Tailwind CSS. Ningún componente nuevo usa CSS-en-JS (excepción única: Framer Motion para la navbar animada, ver `GeekStore_Instrucciones_Frontend.md` sección 1).
- **Auth**: comparación manual de arrays → Auth.js (Credentials + Google OAuth en Hito 1, Microsoft en Hito 2).
- **13 vistas nuevas o rediseñadas**: ver tabla completa en la sección 7 de `GeekStore_Roadmap_y_Schema.md`. Ninguna se construye sin antes abrir su mockup correspondiente en `GeekStore_Mockups.html`.

### Favicon y títulos de página

- **Favicon:** reemplazar el ícono default de Next.js por el logo de GeekStore, colocado como `icon.png` en `app/[locale]/` (o la carpeta raíz de `app/` si aplica a toda la app) — Next.js lo detecta por convención de archivo, sin configuración manual.
- **Títulos por vista:** cada ruta define su propio `<title>` vía `generateMetadata()` (no `document.title` manual, que rompe con Server Components), con el patrón `GeekStore | [Nombre de la vista o producto]` — ej. `GeekStore | Inicio`, `GeekStore | Spider-Man 2`, `GeekStore | Carrito`. Debe ser compatible con `next-intl` (el "Inicio"/"Home" cambia según idioma, "GeekStore" y el nombre del producto no).

---

## 3. Orden de precedencia cuando hay conflicto

Si el código legacy de CRA, el roadmap, los mockups y los estándares de frontend se contradicen entre sí, este es el orden que manda:

1. **`GeekStore_Roadmap_y_Schema.md`** — arquitectura, schema, y decisiones de UX (sección 8) son la autoridad final.
2. **`GeekStore_Mockups.html`** — manda sobre layout visual, copy exacto y manejo de estados (vacío/error/agotado).
3. **`GeekStore_Instrucciones_Frontend.md`** — manda sobre cómo se construye (responsive, i18n, a11y), no sobre qué se construye.
4. **Código legacy en `src/`** — última prioridad, y solo como referencia de **comportamiento de negocio** a preservar (sección 1 de este documento). Nunca como referencia de stack técnico: CRA + styled-components es exactamente lo que se está reemplazando.

---

## 4. Flujo por cada vista nueva (checklist)

Antes de dar una vista por terminada, Cursor confirma en orden:

1. ¿Se leyó el mockup numerado correspondiente en `GeekStore_Mockups.html`? (layout, estados, copy)
2. ¿Se identificó el/los modelo(s) de Prisma involucrados? (tabla de la sección 7 del roadmap)
3. ¿Existe una vista equivalente en el CRA legacy cuya lógica de negocio deba preservarse? (sección 1 de este documento)
4. ¿Cumple mobile-first, con los 3 breakpoints mínimos? (`GeekStore_Instrucciones_Frontend.md` sección 1)
5. ¿Tiene textos preparados para `next-intl` (sin strings hardcodeados)? (sección 2)
6. ¿Labels asociados, navegación por teclado, `alt` reales en imágenes? (sección 3)
7. ¿Título de la pestaña vía `generateMetadata()` siguiendo el patrón `GeekStore | [Vista]`? (sección 2)
8. ¿Se cubrieron los estados no felices? (vacío, error 404, agotado, loading) — varios mockups los incluyen explícitamente (04, 09, 12, 13), no son opcionales.

Si una vista no cumple alguno de estos puntos, se corrige antes de pasar a la siguiente — no se deja "pendiente para pulir después" (mismo principio que ya establece `GeekStore_Instrucciones_Frontend.md`).

---

## 5. Cuando algo no está documentado

El roadmap ya establece la regla del proyecto: *"cada feature se construye completa o no se construye"*. Si Cursor encuentra un caso no cubierto por ninguno de los 3 documentos de referencia (un estado de UI no mockeado, un campo de schema ambiguo, una regla de negocio no escrita), la instrucción es **señalar la ambigüedad y proponer una opción**, no asumir en silencio y seguir construyendo. Es preferible una pausa de dos líneas preguntando, que una vista completa construida sobre un supuesto incorrecto.