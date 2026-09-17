import { USE_MOCK } from './config.js'
import { http } from './http.js'
import { delay } from './mock/mockHelpers.js'
import { mockClients, allocateClientId } from './mock/mockData.js'

async function mockCreate({ name, email, company, phone }) {
  await delay()
  const exists = mockClients.some((c) => c.email.toLowerCase() === email.toLowerCase())
  if (exists) throw new Error('Ya existe un cliente con ese correo electronico')

  const client = { id: allocateClientId(), name, email, company: company ?? null, phone: phone ?? null }
  mockClients.push(client)
  return client
}

export const clientsApi = {
  async list(params = {}) {
    if (USE_MOCK) {
      await delay(200)
      if (!params.search) return mockClients
      const term = params.search.toLowerCase()
      return mockClients.filter(
        (c) => c.name.toLowerCase().includes(term) || c.company?.toLowerCase().includes(term),
      )
    }
    const { data } = await http.get('/clients', { params })
    return data.data
  },
  async create(payload) {
    if (USE_MOCK) return mockCreate(payload)
    const { data } = await http.post('/clients', payload)
    return data.data
  },
}
