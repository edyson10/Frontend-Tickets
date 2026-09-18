# Support Desk — Frontend

Interfaz web en React para la plataforma de gestión de tickets de soporte
(prueba técnica Tech Lead Full Stack JavaScript). Este README cubre solo el
frontend; para el backend ver
[`../backend/README.md`](https://github.com/edyson10/Backend-Tickets).

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

### Capa de datos

Cada recurso (`src/api/*.api.js`) expone funciones simples que llaman a la
API real con axios (`src/api/http.js`, con interceptor de JWT). La única
variable de configuración es `VITE_API_URL` (`src/api/config.js`), que
decide contra qué backend habla el frontend — local o AWS, ver sección 3.

---

## 2. Arquitectura de la aplicación

```
frontend/
├── src/
│   ├── api/
│   │   ├── config.js         # API_BASE_URL (desde VITE_API_URL)
│   │   ├── http.js            # instancia axios (JWT + manejo de 401)
│   │   └── auth.api.js, tickets.api.js, users.api.js, clients.api.js, metrics.api.js
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
├── .env                                  # npm run dev -> backend local
├── .env.aws                               # npm run dev:aws -> backend en AWS
└── .env.example
```

El enforcement de permisos por rol se aplica en **2 capas** consistentes
con el backend: el ítem no aparece en el menú si el rol no tiene acceso
(`Sidebar.jsx`) y la ruta bloquea el acceso directo por URL
(`<RequireRole>`). El backend es la autoridad final en todos los casos.

---

## 3. Cómo ejecutar el frontend

Solo necesitas Node.js — no requiere Docker. El frontend **siempre habla
con un backend real** (no hay modo mock); solo cambia a cuál apunta:

| Comando | Apunta a | Archivo de env |
|---|---|---|
| `npm run dev` | Backend en tu máquina (`localhost:4000`, con o sin Docker) | `.env` |
| `npm run dev:aws` | Backend desplegado en AWS | `.env.aws` |

```bash
cd frontend
npm install

npm run dev        # http://localhost:5173, contra tu backend local en :4000
npm run dev:aws     # idem, pero contra el backend real en AWS
```

Para que `npm run dev` funcione, tu backend debe estar corriendo en
`localhost:4000` (ver `backend/README.md`, sección 5).

> ⚠️ **`npm run dev:aws` requiere que el backend en AWS permita el origen
> `http://localhost:5173` en su `CORS_ORIGIN`.** Si no, el navegador
> bloquea la petición con un error de CORS (aunque `curl` "funcione", el
> navegador sí lo exige). Ver el aviso completo mas abajo en esta sección.

Build de producción (para Vercel usa las variables de entorno del
dashboard de Vercel, no el archivo `.env` del repo):

```bash
npm run build      # genera dist/ (usa .env -> apunta a localhost:4000)
npm run preview    # sirve dist/ localmente para verificar el build
```

> Vite "quema" estas variables en el bundle en **build time**, no en
> runtime — cualquier cambio de URL requiere volver a correr el comando
> (`dev` o `build`), no alcanza con recargar la pagina.

### ⚠️ CORS: cómo permitir que el frontend local hable con el backend de AWS

El backend valida el header `Origin` de cada request contra su variable
`CORS_ORIGIN` (ver `backend/README.md`). Si el stack de AWS se desplegó
solo con la URL de Vercel (o con el valor de ejemplo de la plantilla),
`http://localhost:5173` **no** va a estar permitido y `npm run dev:aws`
fallará en el navegador con:

```
Access to XMLHttpRequest ... has been blocked by CORS policy: ...
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

Para arreglarlo, agregar `http://localhost:5173` a la lista de orígenes
permitidos (separados por coma) del backend en AWS. La forma más rápida es
editar la variable de entorno `CORS_ORIGIN` directamente en la Task
Definition de ECS (consola de AWS → ECS → Task Definitions → nueva
revisión → actualizar el Service), o mantenerlo versionado redesplegando
el stack de CloudFormation:

```bash
aws cloudformation deploy \
  --template-file infra/cloudformation/backend-stack.yaml \
  --stack-name support-tickets-backend \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    CorsOrigin="http://localhost:5173,https://<tu-app>.vercel.app" \
    VpcId=<el-mismo-que-usaste> SubnetIds=<las-mismas> \
    ImageUri=<la-misma> DbPassword=<la-misma> JwtSecret=<el-mismo>
```

(hay que repetir los mismos valores de los demás parámetros que se usaron
en el deploy original — `aws cloudformation describe-stacks --stack-name
support-tickets-backend` los muestra).

---

## 4. Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API del backend |

No hace falta editar nada a mano para cambiar de backend — cada comando
tiene su propio archivo, ya versionado en el repo (ninguno tiene secretos,
son solo URLs):

| Archivo | Usado por |
|---|---|
| `.env` | `npm run dev` / `npm run build` (backend local, `localhost:4000`) |
| `.env.aws` | `npm run dev:aws` (backend real en AWS) |
| `.env.example` | Plantilla de referencia |

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

Estos usuarios existen en el seed del backend (`V2__seed_demo_data.sql`) —
tienen que existir ahí para poder iniciar sesión, sea que el backend
corra local o en AWS.

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