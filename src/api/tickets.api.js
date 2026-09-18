import { http } from './http.js'

export const ticketsApi = {
  async list(params) {
    const { data } = await http.get('/tickets', { params })
    return data
  },
  async get(id) {
    const { data } = await http.get(`/tickets/${id}`)
    return data.data
  },
  async create(payload) {
    const { data } = await http.post('/tickets', payload)
    return data.data
  },
  async update(id, payload) {
    const { data } = await http.patch(`/tickets/${id}`, payload)
    return data.data
  },
  async changeStatus(id, status) {
    const { data } = await http.patch(`/tickets/${id}/status`, { status })
    return data.data
  },
  async close(id) {
    const { data } = await http.patch(`/tickets/${id}/close`)
    return data.data
  },
  async reopen(id) {
    const { data } = await http.patch(`/tickets/${id}/reopen`)
    return data.data
  },
  async assign(id, assignedTo) {
    const { data } = await http.patch(`/tickets/${id}/assign`, { assignedTo })
    return data.data
  },
  async listComments(id) {
    const { data } = await http.get(`/tickets/${id}/comments`)
    return data.data
  },
  async addComment(id, payload) {
    const { data } = await http.post(`/tickets/${id}/comments`, payload)
    return data.data
  },
  async history(id) {
    const { data } = await http.get(`/tickets/${id}/history`)
    return data.data
  },
}
