import { http } from './http.js'

export const authApi = {
  async login(credentials) {
    const { data } = await http.post('/auth/login', credentials)
    return data.data
  },
  async me() {
    const { data } = await http.get('/auth/me')
    return data.data
  },
}
