# Support Desk — Frontend

Interfaz web en React para la plataforma de gestión de tickets de soporte
(prueba técnica Tech Lead Full Stack JavaScript). Este README cubre solo el
frontend; para el backend ver
[`https://github.com/edyson10/Backend-Tickets`](../backend/README.md).

> **Despliegue**: este frontend se ejecuta con `npm` (dev o build estático)
> y está pensado para desplegarse en **Vercel**, apuntando por
> `VITE_API_URL` al backend (que corre en Docker/AWS, ver `backend/README.md`).
> No depende de Docker para nada — se ejecuta "aparte" del backend.

---

## Índice

1. [Stack y decisiones de arquitectura](#1-stack-y-decisiones-de-arquitectura)
2. [Arquitectura de la aplicación](#2-arquitectura-de-la-aplicación)
3. [Cómo ejecutar el frontend](#3-cómo-ejecutar-el-frontend)
4. [Variables de entorno](#4-variables-de-entorno)
5. [Credenciales de acceso (todos los roles)](#5-credenciales-de-acceso-todos-los-roles)
6. [Vistas y navegación por rol](#6-vistas-y-navegación-por-rol)

---

## 1. Stack y decisiones de arquitectura

| Pieza | Tecnología | Por qué |
|---|---|---|
| Framework | React 19 + Vite | Pedido explícito en el enunciado. Vite da un dev server rápido y un build de producción óptimo para Vercel. |
| Lenguaje | JavaScript (JSX) | Mismo criterio que el backend: maximizar tiempo en cubrir el alcance funcional. |
| Estilos | Tailwind CSS v4 (`@tailwindcss/vite`) | UI limpio y consistente sin escribir una capa de CSS propia. |
| Enrutado | React Router v7 | Estándar de facto en SPAs React; `RequireAuth`/`RequireRole` protegen rutas por sesión y por rol. |
| Estado de servidor | TanStack Query (`@tanstack/react-query`) | Cache, reintentos y estados de carga/error "gratis" para las llamadas a la API. |
| Cliente HTTP | axios | Interceptor único para adjuntar el JWT y normalizar errores. |

### Capa de datos: mock ⇄ real con un solo interruptor

Cada recurso (`src/api/*.api.js`) expone las mismas funciones sin importar
el origen de los datos: internamente decide entre un dataset **mockeado en
memoria** (`src/api/mock/`) o llamadas **reales** a la API con axios, según
la variable `VITE_USE_MOCK`. El dataset mock replica 1:1 los mismos
usuarios/clientes/tickets del seed del backend (mismas reglas de
autorización por rol incluidas), para que la experiencia visual sea
idéntica antes y después de conectar el backend real — así se construyó y
validó el frontend primero de forma aislada. Ver `src/api/config.js`.

---

## 2. Arquitectura de la aplicación

```
frontend/
├── src/
│   ├── api/
│   │   ├── config.js         # interruptor VITE_USE_MOCK + VITE_API_URL
│   │   ├── http.js            # instancia axios (JWT + manejo de 401)
│   │   ├── auth.api.js, tickets.api.js, users.api.js, clients.api.js, metrics.api.js
│   │   └── mock/               # dataset y reglas de autorizacion en memoria
│   ├── auth/
│   │   ├── AuthContext.jsx     # sesion (login/logout), persistida en localStorage
│   │   ├── useAuth.js
│   │   └── RequireAuth.jsx     # <RequireAuth/> (sesion) y <RequireRole roles={[...]}/>
│   ├── components/
│   │   ├── layout/              # Sidebar (nav filtrada por rol), Topbar, AppLayout
│   │   ├── ui/                    # Button, Card, Badge, Pagination, EmptyState...
│   │   └── tickets/                # TicketTable, TicketFilters, CommentList, CommentForm
│   ├── pages/                       # LoginPage, DashboardPage, TicketsPage, TicketDetailPage,
│   │                                 # TicketCreatePage, ClientsPage, UsersPage, NotFoundPage
│   ├── utils/                        # constantes (estados/prioridades/roles), formatters
│   └── App.jsx                        # rutas + QueryClientProvider + AuthProvider
├── index.html
├── vite.config.js
├── Dockerfile + nginx.conf              # opcional: containerizar el frontend (no se usa para Vercel)
└── .env.example
```

El enforcement de permisos por rol se aplica en **3 capas** consistentes
con el backend: el ítem no aparece en el menú si el rol no tiene acceso
(`Sidebar.jsx`), la ruta bloquea el acceso directo por URL
(`<RequireRole>`), y la capa de datos (mock o real) también lo valida.

---

## 3. Cómo ejecutar el frontend

Solo necesitas Node.js — no requiere Docker ni el backend corriendo (modo
mock por defecto).

```bash
cd frontend
cp .env.example .env     # VITE_USE_MOCK=true por defecto
npm install
npm run dev                # http://localhost:5173
```

### Apuntar a un backend real (local o desplegado)

Editar `.env`:

```bash
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:4000/api/v1   # o la URL del backend en AWS
```

> Vite "quema" estas variables en el bundle en **build time**, no en
> runtime. Cualquier cambio requiere reiniciar `npm run dev` o, en Vercel,
> un **redeploy**.

### Build de producción

```bash
npm run build      # genera dist/
npm run preview    # sirve dist/ localmente para verificar el build
```

---

## 4. Variables de entorno

Copiar `.env.example` → `.env`:

| Variable | Descripción | Default local |
|---|---|---|
| `VITE_USE_MOCK` | `true` = datos mockeados en memoria (sin backend). `false` = consume la API real. | `true` |
| `VITE_API_URL` | URL base de la API (solo aplica si `VITE_USE_MOCK=false`) | `http://localhost:4000/api/v1` |

---

## 5. Credenciales de acceso (todos los roles)

Contraseña para **todos** los usuarios de demo: `Password123!`

| Rol | Email | Qué puede hacer (resumen) |
|---|---|---|
| **Administrador** | `admin@demo.com` | Acceso total: crear/editar/cerrar/reabrir/asignar tickets, crear usuarios y clientes, ver todas las métricas. |
| **Supervisor / Líder operativo** | `supervisor@demo.com` | Ver todos los tickets, reasignar, comentarios internos, métricas y tickets vencidos. No crea/edita tickets ni usuarios. |
| **Agente de soporte** | `agente1@demo.com` | Solo tickets asignados a él o creados por él: crear, editar y cambiar estado de los suyos, comentar (siempre público). |
| Agente de soporte (alterno) | `agente2@demo.com` | Igual que arriba, útil para probar reasignación entre agentes. |
| Agente de soporte (alterno) | `agente3@demo.com` | Igual que arriba. |

Estos mismos usuarios existen tanto en el dataset mock del frontend como en
el seed (`V2__seed_demo_data.sql`) del backend. En modo mock, la pantalla de
login incluye botones de acceso rápido para Administrador / Supervisor /
Agente que autocompletan el formulario.

---

## 6. Vistas y navegación por rol

| Vista | Ruta | Quién la ve | Notas |
|---|---|---|---|
| Inicio de sesión | `/login` | Público | Validación básica, manejo de errores, redirección según sesión. |
| Dashboard operativo | `/` | Todos los roles | Totales por estado/prioridad, tickets abiertos por agente, % cerrados últimos 30 días. Tickets vencidos (+48h) solo visible para admin/supervisor. |
| Listado de tickets | `/tickets` | Todos los roles | Tabla + filtros (estado, prioridad, búsqueda) + paginación. El agente solo ve los suyos. |
| Detalle de ticket | `/tickets/:id` | Todos los roles (con acceso al ticket) | Info completa, comentarios (internos ocultos para agentes), historial de estado/reasignaciones, acciones según rol (editar, cambiar estado, asignar, cerrar/reabrir). |
| Creación de ticket | `/tickets/new` | admin, agent | Formulario con validaciones de campos. |
| Clientes | `/clients` | Todos los roles (lectura); crear solo admin | — |
| Usuarios | `/users` | admin, supervisor (lectura); crear solo admin | No aparece en el menú ni es accesible por URL para el rol agente. |

---