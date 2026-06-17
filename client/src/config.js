// Strip any trailing slash so manual URL concatenation (e.g. image src) never
// produces a double slash like ".../app//uploads/..." which 404s.
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/+$/, '')
