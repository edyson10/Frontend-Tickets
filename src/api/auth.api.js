import { USE_MOCK } from './config.js'
import { http } from './http.js'
import { delay } from './mock/mockHelpers.js'
import { mockUsers, MOCK_PASSWORD } from './mock/mockData.js'

function fakeToken(user) {
  return `mock-token.${user.id}.${Date.now()}`
}

async function mockLogin({ email, password }) {
  await delay()
  const user = mockUsers.find((u) => u.email.toLowerCase() === String(email).toLowerCase())
  if (!user || password !== MOCK_PASSWORD) {
    throw new Error('Credenciales invalidas')
  }
  return { token: fakeToken(user), user }
}

async function mockMe(currentUser) {
  await delay(150)
  if (!currentUser) throw new Error('No autenticado')
  return currentUser
}

export const authApi = {
  async login(credentials) {
    if (USE_MOCK) return mockLogin(credentials)
    const { data } = await http.post('/auth/login', credentials)
    return data.data
  },
  async me(currentUserForMock) {
    if (USE_MOCK) return mockMe(currentUserForMock)
    const { data } = await http.get('/auth/me')
    return data.data
  },
}
