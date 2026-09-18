import { http } from './http.js'

export const metricsApi = {
  async dashboard() {
    const { data } = await http.get('/metrics/dashboard')
    return data.data
  },
  async overdue(limit = 50) {
    const { data } = await http.get('/metrics/overdue', { params: { limit } })
    return data.data
  },
}
