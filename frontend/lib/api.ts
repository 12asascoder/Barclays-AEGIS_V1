import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  if (globalThis.window !== undefined) {
    const token = localStorage.getItem('aegis_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Auth API
export const authAPI = {
  login: (username: string, password: string) => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },
  register: (data: any) => api.post('/auth/register', data),
}

// Cases API
export const casesAPI = {
  list: () => api.get('/cases'),
  get: (id: number) => api.get(`/cases/${id}`),
  create: (data: any) => api.post('/cases', data),
}

// SAR API
export const sarAPI = {
  list: () => api.get('/sar'),
  get: (id: number) => api.get(`/sar/${id}`),
  generate: (caseId: number) => api.post('/sar/generate', { case_id: caseId }),
  approve: (id: number) => api.post(`/sar/${id}/approve`),
}

// Dashboard API
export const dashboardAPI = {
  metrics: () => api.get('/dashboard/metrics'),
}

// Audit API
export const auditAPI = {
  list: () => api.get('/audit'),
}

// Admin API
export const adminAPI = {
  listUsers: () => api.get('/admin/users'),
  deactivateUser: (userId: number) => api.post(`/admin/users/${userId}/deactivate`),
}
