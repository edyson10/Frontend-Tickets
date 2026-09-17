import { USE_MOCK } from './config.js'
import { http } from './http.js'
import { delay } from './mock/mockHelpers.js'
import { mockTickets, mockUsers } from './mock/mockData.js'

function groupCount(items, key) {
  const counts = {}
  for (const item of items) {
    counts[item[key]] = (counts[item[key]] ?? 0) + 1
  }
  return Object.entries(counts).map(([k, count]) => ({ [key]: k, count }))
}

function mockDashboard() {
  const byStatus = groupCount(mockTickets, 'status')
  const byPriority = groupCount(mockTickets, 'priority')
  const totalOpen = mockTickets.filter((t) => t.status === 'open').length

  const agents = mockUsers.filter((u) => u.role === 'agent')
  const openTicketsByAgent = agents
    .map((a) => ({
      agentId: a.id,
      agentName: a.name,
      openTickets: mockTickets.filter((t) => t.assignedTo === a.id && t.status === 'open').length,
    }))
    .sort((a, b) => b.openTickets - a.openTickets)

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  const last30 = mockTickets.filter((t) => new Date(t.createdAt).getTime() >= thirtyDaysAgo)
  const closedLast30 = last30.filter((t) => t.status === 'closed').length

  const resolved = mockTickets.filter((t) => t.resolvedAt)
  const byPriorityResolution = ['low', 'medium', 'high', 'critical'].map((priority) => {
    const items = resolved.filter((t) => t.priority === priority)
    if (items.length === 0) return { priority, avgResolutionHours: null }
    const avgMs =
      items.reduce((sum, t) => sum + (new Date(t.resolvedAt) - new Date(t.createdAt)), 0) /
      items.length
    return { priority, avgResolutionHours: Number((avgMs / 3600000).toFixed(2)) }
  })

  return {
    totalTickets: mockTickets.length,
    totalOpen,
    byStatus,
    byPriority,
    openTicketsByAgent,
    last30Days: {
      totalCreated: last30.length,
      totalClosed: closedLast30,
      closedPercentage: last30.length ? Number(((closedLast30 / last30.length) * 100).toFixed(2)) : 0,
    },
    avgResolutionHoursByPriority: byPriorityResolution,
  }
}

function mockOverdue(limit = 50) {
  const cutoff = Date.now() - 48 * 60 * 60 * 1000
  return mockTickets
    .filter((t) => t.status !== 'closed' && new Date(t.updatedAt).getTime() < cutoff)
    .sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
    .slice(0, limit)
}

export const metricsApi = {
  async dashboard() {
    if (USE_MOCK) {
      await delay()
      return mockDashboard()
    }
    const { data } = await http.get('/metrics/dashboard')
    return data.data
  },
  async overdue(limit = 50) {
    if (USE_MOCK) {
      await delay()
      return mockOverdue(limit)
    }
    const { data } = await http.get('/metrics/overdue', { params: { limit } })
    return data.data
  },
}
