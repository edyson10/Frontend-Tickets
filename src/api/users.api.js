import { USE_MOCK } from './config.js'
import { http } from './http.js'
import { delay } from './mock/mockHelpers.js'
import { mockUsers, allocateUserId } from './mock/mockData.js'

async function mockCreate({ name, email, password, role }) {
  await delay()
  if (!password || password.length < 8) {
    throw new Error('La contrasena debe tener al menos 8 caracteres')
  }
  const exists = mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())
  if (exists) throw new Error('Ya existe un usuario con ese correo electronico')

  const user = { id: allocateUserId(), name, email, role, isActive: true }
  mockUsers.push(user)
  return user
}

export const usersApi = {
  async list(params = {}) {
    if (USE_MOCK) {
      await delay(200)
      return params.role ? mockUsers.filter((u) => u.role === params.role) : mockUsers
    }
    const { data } = await http.get('/users', { params })
    return data.data
  },
  async create(payload) {
    if (USE_MOCK) return mockCreate(payload)
    const { data } = await http.post('/users', payload)
    return data.data
  },
}
