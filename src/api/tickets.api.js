import { USE_MOCK } from './config.js'
import { http } from './http.js'
import { delay, paginate } from './mock/mockHelpers.js'
import {
  mockTickets,
  mockComments,
  mockAssignmentHistory,
  mockStatusHistory,
  findUser,
  findClient,
  allocateTicketId,
  allocateCommentId,
} from './mock/mockData.js'

const CLOSED = 'closed'

function isAgent(user) {
  return user?.role === 'agent'
}
function isElevated(user) {
  return user?.role === 'admin' || user?.role === 'supervisor'
}

function visibleTickets(user) {
  if (!isAgent(user)) return mockTickets
  return mockTickets.filter((t) => t.assignedTo === user.id || t.createdBy === user.id)
}

function requireTicket(id) {
  const ticket = mockTickets.find((t) => t.id === Number(id))
  if (!ticket) throw new Error('Ticket no encontrado')
  return ticket
}

function assertVisible(user, ticket) {
  if (isAgent(user) && ticket.assignedTo !== user.id && ticket.createdBy !== user.id) {
    throw new Error('No tienes acceso a este ticket')
  }
}

async function mockList(params, user) {
  await delay()
  let items = visibleTickets(user)

  if (params.status) items = items.filter((t) => t.status === params.status)
  if (params.priority) items = items.filter((t) => t.priority === params.priority)
  if (params.clientId) items = items.filter((t) => t.clientId === Number(params.clientId))
  if (params.assignedTo) items = items.filter((t) => t.assignedTo === Number(params.assignedTo))
  if (params.search) {
    const term = params.search.toLowerCase()
    items = items.filter(
      (t) => t.title.toLowerCase().includes(term) || t.code.toLowerCase().includes(term),
    )
  }

  items = [...items].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

  const { data, meta } = paginate(items, {
    page: Number(params.page) || 1,
    pageSize: Number(params.pageSize) || 20,
  })
  return { data, meta }
}

async function mockGet(id, user) {
  await delay(200)
  const ticket = requireTicket(id)
  assertVisible(user, ticket)
  return ticket
}

async function mockCreate(payload, user) {
  await delay()
  const id = allocateTicketId()
  const ticket = {
    id,
    code: `TCK-${String(id).padStart(6, '0')}`,
    title: payload.title,
    description: payload.description ?? null,
    status: 'open',
    priority: payload.priority ?? 'medium',
    clientId: Number(payload.clientId),
    createdBy: user.id,
    assignedTo: payload.assignedTo ? Number(payload.assignedTo) : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    resolvedAt: null,
    closedAt: null,
  }
  ticket.clientName = findClient(ticket.clientId)?.name
  ticket.createdByName = user.name
  ticket.assignedToName = ticket.assignedTo ? findUser(ticket.assignedTo)?.name : null
  mockTickets.unshift(ticket)
  return ticket
}

async function mockUpdate(id, payload, user) {
  await delay()
  const ticket = requireTicket(id)
  assertVisible(user, ticket)
  const canEdit = user.role === 'admin' || (isAgent(user) && ticket.assignedTo === user.id)
  if (!canEdit) throw new Error('Solo un administrador o el agente asignado pueden editar el ticket')
  Object.assign(ticket, payload, { updatedAt: new Date().toISOString() })
  return ticket
}

async function mockChangeStatus(id, status, user) {
  await delay()
  const ticket = requireTicket(id)
  assertVisible(user, ticket)

  if (status === CLOSED || ticket.status === CLOSED) {
    throw new Error('Cerrar o reabrir un ticket solo puede hacerlo un administrador')
  }
  const canChange = user.role === 'admin' || (isAgent(user) && ticket.assignedTo === user.id)
  if (!canChange) throw new Error('Solo el administrador o el agente asignado pueden cambiar el estado')

  const oldStatus = ticket.status
  ticket.status = status
  ticket.updatedAt = new Date().toISOString()
  if (status === 'resolved') ticket.resolvedAt = new Date().toISOString()
  mockStatusHistory.push({
    id: mockStatusHistory.length + 1,
    ticketId: ticket.id,
    oldStatus,
    newStatus: status,
    changedBy: user.id,
    changedAt: ticket.updatedAt,
  })
  return ticket
}

async function mockClose(id, user) {
  await delay()
  if (user.role !== 'admin') throw new Error('Solo un administrador puede cerrar tickets')
  const ticket = requireTicket(id)
  if (ticket.status === CLOSED) throw new Error('El ticket ya esta cerrado')
  ticket.status = CLOSED
  ticket.closedAt = new Date().toISOString()
  ticket.updatedAt = ticket.closedAt
  return ticket
}

async function mockReopen(id, user) {
  await delay()
  if (user.role !== 'admin') throw new Error('Solo un administrador puede reabrir tickets')
  const ticket = requireTicket(id)
  if (ticket.status !== CLOSED) throw new Error('El ticket no esta cerrado')
  ticket.status = 'open'
  ticket.closedAt = null
  ticket.updatedAt = new Date().toISOString()
  return ticket
}

async function mockAssign(id, assignedTo, user) {
  await delay()
  if (!isElevated(user)) throw new Error('Solo un administrador o supervisor pueden asignar tickets')
  const ticket = requireTicket(id)
  const assignee = findUser(Number(assignedTo))
  if (!assignee) throw new Error('El usuario asignado no existe')

  mockAssignmentHistory.push({
    id: mockAssignmentHistory.length + 1,
    ticketId: ticket.id,
    oldAssignee: ticket.assignedTo,
    newAssignee: assignee.id,
    changedBy: user.id,
    changedAt: new Date().toISOString(),
  })

  ticket.assignedTo = assignee.id
  ticket.assignedToName = assignee.name
  ticket.updatedAt = new Date().toISOString()
  return ticket
}

async function mockListComments(id, user) {
  await delay(200)
  const ticket = requireTicket(id)
  assertVisible(user, ticket)
  const includeInternal = isElevated(user)
  return mockComments
    .filter((c) => c.ticketId === Number(id) && (includeInternal || !c.isInternal))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}

async function mockAddComment(id, payload, user) {
  await delay()
  const ticket = requireTicket(id)
  assertVisible(user, ticket)
  const isInternal = isElevated(user) ? Boolean(payload.isInternal) : false
  const comment = {
    id: allocateCommentId(),
    ticketId: Number(id),
    userId: user.id,
    userName: user.name,
    comment: payload.comment,
    isInternal,
    createdAt: new Date().toISOString(),
  }
  mockComments.push(comment)
  ticket.updatedAt = comment.createdAt
  return comment
}

async function mockHistory(id, user) {
  await delay(200)
  const ticket = requireTicket(id)
  assertVisible(user, ticket)
  return {
    statusHistory: mockStatusHistory.filter((h) => h.ticketId === Number(id)),
    assignmentHistory: mockAssignmentHistory.filter((h) => h.ticketId === Number(id)),
  }
}

export const ticketsApi = {
  async list(params, user) {
    if (USE_MOCK) return mockList(params, user)
    const { data } = await http.get('/tickets', { params })
    return data
  },
  async get(id, user) {
    if (USE_MOCK) return mockGet(id, user)
    const { data } = await http.get(`/tickets/${id}`)
    return data.data
  },
  async create(payload, user) {
    if (USE_MOCK) return mockCreate(payload, user)
    const { data } = await http.post('/tickets', payload)
    return data.data
  },
  async update(id, payload, user) {
    if (USE_MOCK) return mockUpdate(id, payload, user)
    const { data } = await http.patch(`/tickets/${id}`, payload)
    return data.data
  },
  async changeStatus(id, status, user) {
    if (USE_MOCK) return mockChangeStatus(id, status, user)
    const { data } = await http.patch(`/tickets/${id}/status`, { status })
    return data.data
  },
  async close(id, user) {
    if (USE_MOCK) return mockClose(id, user)
    const { data } = await http.patch(`/tickets/${id}/close`)
    return data.data
  },
  async reopen(id, user) {
    if (USE_MOCK) return mockReopen(id, user)
    const { data } = await http.patch(`/tickets/${id}/reopen`)
    return data.data
  },
  async assign(id, assignedTo, user) {
    if (USE_MOCK) return mockAssign(id, assignedTo, user)
    const { data } = await http.patch(`/tickets/${id}/assign`, { assignedTo })
    return data.data
  },
  async listComments(id, user) {
    if (USE_MOCK) return mockListComments(id, user)
    const { data } = await http.get(`/tickets/${id}/comments`)
    return data.data
  },
  async addComment(id, payload, user) {
    if (USE_MOCK) return mockAddComment(id, payload, user)
    const { data } = await http.post(`/tickets/${id}/comments`, payload)
    return data.data
  },
  async history(id, user) {
    if (USE_MOCK) return mockHistory(id, user)
    const { data } = await http.get(`/tickets/${id}/history`)
    return data.data
  },
}
