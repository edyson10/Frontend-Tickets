// Dataset mock que refleja 1:1 el seed.sql del backend (mismos usuarios,
// clientes y distribucion de tickets) para que la experiencia visual sea
// identica antes y despues de conectar el backend real.

function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()
}

export const MOCK_PASSWORD = 'Password123!'

export const mockUsers = [
  { id: 1, name: 'Ana Administradora', email: 'admin@demo.com', role: 'admin', isActive: true },
  { id: 2, name: 'Sofia Supervisora', email: 'supervisor@demo.com', role: 'supervisor', isActive: true },
  { id: 3, name: 'Carlos Agente', email: 'agente1@demo.com', role: 'agent', isActive: true },
  { id: 4, name: 'Laura Agente', email: 'agente2@demo.com', role: 'agent', isActive: true },
  { id: 5, name: 'Diego Agente', email: 'agente3@demo.com', role: 'agent', isActive: true },
]

export const mockClients = [
  { id: 1, name: 'Contacto Acme', email: 'contacto@acme.com', company: 'Acme Corp', phone: '+57 300 100 0001' },
  { id: 2, name: 'Contacto Globex', email: 'contacto@globex.com', company: 'Globex Inc', phone: '+57 300 100 0002' },
  { id: 3, name: 'Contacto Initech', email: 'contacto@initech.com', company: 'Initech', phone: '+57 300 100 0003' },
  { id: 4, name: 'Contacto Umbrella', email: 'contacto@umbrella.com', company: 'Umbrella Corp', phone: '+57 300 100 0004' },
  { id: 5, name: 'Contacto Soylent', email: 'contacto@soylent.com', company: 'Soylent Corp', phone: '+57 300 100 0005' },
  { id: 6, name: 'Contacto Stark', email: 'contacto@stark.com', company: 'Stark Industries', phone: '+57 300 100 0006' },
  { id: 7, name: 'Contacto Wayne', email: 'contacto@wayne.com', company: 'Wayne Enterprises', phone: '+57 300 100 0007' },
]

const rawTickets = [
  [1, 1, 1, 3, 'resolved', 'critical', 'Caida total del servicio de facturacion', 40, 35, 35, null],
  [2, 1, 3, 3, 'closed', 'high', 'Error 500 al generar reportes', 25, 20, 21, 20],
  [3, 1, 1, 4, 'open', 'medium', 'Solicitud de nuevo usuario', 10, 5, null, null],
  [4, 1, 3, 3, 'in_progress', 'high', 'Lentitud en el modulo de pagos', 6, 3, null, null],
  [5, 1, 4, 5, 'pending_customer', 'critical', 'Fuga de datos reportada por cliente', 4, 1, null, null],
  [6, 2, 1, 3, 'resolved', 'high', 'Integracion API caida', 15, 9, 9, null],
  [7, 2, 3, 4, 'open', 'critical', 'No cargan los dashboards', 3, 3, null, null],
  [8, 2, 4, 4, 'in_progress', 'medium', 'Ajuste de permisos', 2, 1, null, null],
  [9, 2, 1, 5, 'closed', 'high', 'Fallo de autenticacion SSO', 50, 44, 45, 44],
  [10, 3, 1, 3, 'open', 'critical', 'Servidor de correo caido', 7, 7, null, null],
  [11, 3, 3, 4, 'resolved', 'high', 'Reporte de facturacion incorrecto', 20, 14, 14, null],
  [12, 3, 4, 5, 'in_progress', 'high', 'Migracion de datos incompleta', 5, 4, null, null],
  [13, 3, 1, 3, 'closed', 'critical', 'Perdida de datos en modulo contable', 60, 55, 56, 55],
  [14, 3, 4, 4, 'pending_customer', 'high', 'Consulta sobre licenciamiento', 8, 2, null, null],
  [15, 4, 1, 5, 'open', 'high', 'Bloqueo de cuenta administrador', 9, 9, null, null],
  [16, 4, 3, 3, 'resolved', 'critical', 'Exposicion de credenciales', 18, 12, 12, null],
  [17, 4, 4, 4, 'in_progress', 'low', 'Duda sobre factura', 3, 1, null, null],
  [18, 5, 1, 3, 'open', 'critical', 'Corrupcion de base de datos de inventario', 6, 6, null, null],
  [19, 5, 3, 3, 'resolved', 'medium', 'Ajustes de reporte mensual', 22, 19, 19, null],
  [20, 5, 4, 5, 'closed', 'low', 'Consulta general de uso', 70, 65, 66, 65],
  [21, 6, 1, 3, 'open', 'critical', 'Fuga de informacion confidencial de contratos', 5, 5, null, null],
  [22, 6, 3, 4, 'in_progress', 'high', 'Caida de API de pagos', 4, 3, null, null],
  [23, 6, 4, 5, 'resolved', 'critical', 'Vulnerabilidad reportada por cliente', 16, 10, 10, null],
  [24, 6, 1, 3, 'pending_customer', 'high', 'Reporte de facturacion duplicado', 3, 2, null, null],
  [25, 6, 3, 4, 'closed', 'critical', 'Perdida de acceso a plataforma', 30, 25, 26, 25],
  [26, 6, 4, 5, 'open', 'high', 'Errores intermitentes en checkout', 3, 3, null, null],
  [27, 7, 1, 4, 'open', 'medium', 'Solicitud de capacitacion', 4, 1, null, null],
  [28, 7, 3, 5, 'resolved', 'low', 'Ajuste menor en UI', 12, 8, 8, null],
]

function findUser(id) {
  return mockUsers.find((u) => u.id === id) ?? null
}
function findClient(id) {
  return mockClients.find((c) => c.id === id) ?? null
}

export const mockTickets = rawTickets.map(
  ([id, clientId, createdBy, assignedTo, status, priority, title, createdD, updatedD, resolvedD, closedD]) => ({
    id,
    code: `TCK-${String(id).padStart(6, '0')}`,
    title,
    description: `Descripcion detallada del caso: ${title.toLowerCase()}.`,
    status,
    priority,
    clientId,
    clientName: findClient(clientId)?.name,
    createdBy,
    createdByName: findUser(createdBy)?.name,
    assignedTo,
    assignedToName: findUser(assignedTo)?.name,
    createdAt: daysAgo(createdD),
    updatedAt: daysAgo(updatedD),
    resolvedAt: resolvedD === null ? null : daysAgo(resolvedD),
    closedAt: closedD === null ? null : daysAgo(closedD),
  }),
)

export const mockComments = [
  { id: 1, ticketId: 1, userId: 3, comment: 'Se escalo al equipo de infraestructura, en investigacion.', isInternal: false, createdAt: daysAgo(38) },
  { id: 2, ticketId: 1, userId: 3, comment: 'Causa raiz: saturacion del pool de conexiones a la base de datos.', isInternal: true, createdAt: daysAgo(36) },
  { id: 3, ticketId: 1, userId: 1, comment: 'Confirmado con el cliente que el servicio ya esta operativo.', isInternal: false, createdAt: daysAgo(35) },
  { id: 4, ticketId: 2, userId: 3, comment: 'Se identifico un null pointer en el generador de reportes.', isInternal: true, createdAt: daysAgo(22) },
  { id: 5, ticketId: 10, userId: 2, comment: 'Reasignando a Carlos por disponibilidad del equipo.', isInternal: true, createdAt: daysAgo(5) },
  { id: 6, ticketId: 10, userId: 3, comment: 'Estamos validando la configuracion del servidor SMTP.', isInternal: false, createdAt: daysAgo(4) },
  { id: 7, ticketId: 21, userId: 2, comment: 'Prioridad critica: notificar a seguridad de la informacion.', isInternal: true, createdAt: daysAgo(5) },
].map((c) => ({ ...c, userName: findUser(c.userId)?.name }))

export const mockAssignmentHistory = [
  { id: 1, ticketId: 10, oldAssignee: null, newAssignee: 4, changedBy: 1, changedAt: daysAgo(7) },
  { id: 2, ticketId: 10, oldAssignee: 4, newAssignee: 5, changedBy: 2, changedAt: daysAgo(6) },
  { id: 3, ticketId: 10, oldAssignee: 5, newAssignee: 3, changedBy: 2, changedAt: daysAgo(5) },
  { id: 4, ticketId: 22, oldAssignee: null, newAssignee: 3, changedBy: 1, changedAt: daysAgo(4) },
  { id: 5, ticketId: 22, oldAssignee: 3, newAssignee: 4, changedBy: 2, changedAt: daysAgo(3) },
]

export const mockStatusHistory = mockTickets
  .filter((t) => t.status !== 'open')
  .map((t, index) => ({
    id: index + 1,
    ticketId: t.id,
    oldStatus: 'open',
    newStatus: t.status,
    changedBy: t.assignedTo ?? t.createdBy,
    changedAt: t.updatedAt,
  }))

let nextTicketId = mockTickets.length + 1
let nextCommentId = mockComments.length + 1
let nextUserId = mockUsers.length + 1
let nextClientId = mockClients.length + 1

export function allocateTicketId() {
  return nextTicketId++
}
export function allocateCommentId() {
  return nextCommentId++
}
export function allocateUserId() {
  return nextUserId++
}
export function allocateClientId() {
  return nextClientId++
}
export { findUser, findClient }
