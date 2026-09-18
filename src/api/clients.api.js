import { http } from './http.js'

export const clientsApi = {
  async list(params = {}) {
    const { data } = await http.get('/clients', { params })
    return data.data
  },
  async create(payload) {
    const { data } = await http.post('/clients', payload)
    return data.data
  },
}
