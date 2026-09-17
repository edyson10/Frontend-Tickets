// Interruptor central mock/real. Ver README.md seccion "Frontend con datos mockeados".
export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? 'true') === 'true'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1'

export const MOCK_LATENCY_MS = 350
