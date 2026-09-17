import { MOCK_LATENCY_MS } from '../config.js'

export function delay(ms = MOCK_LATENCY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function paginate(items, { page = 1, pageSize = 20 } = {}) {
  const total = items.length
  const start = (page - 1) * pageSize
  const data = items.slice(start, start + pageSize)
  return { data, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } }
}
