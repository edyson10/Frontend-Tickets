import { http } from './http.js'

export const usersApi = {
  async list(params = {}) {
    const { data } = await http.get('/users', { params })
    return data.data
  },
  async create(payload) {
    const { data } = await http.post('/users', payload)
    return data.data
  },
}
