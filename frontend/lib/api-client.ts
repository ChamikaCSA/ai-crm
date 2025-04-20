type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  let token: string | null = null
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';')
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='))
    if (tokenCookie) {
      token = tokenCookie.split('=')[1].trim()
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(endpoint, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'An error occurred')
  }

  return data
}

// Helper methods for common operations
export const api = {
  get: <T>(endpoint: string) => apiClient<T>(endpoint),
  post: <T>(endpoint: string, data: any) =>
    apiClient<T>(endpoint, { method: 'POST', body: data }),
  put: <T>(endpoint: string, data: any) =>
    apiClient<T>(endpoint, { method: 'PUT', body: data }),
  patch: <T>(endpoint: string, data: any) =>
    apiClient<T>(endpoint, { method: 'PATCH', body: data }),
  delete: <T>(endpoint: string) =>
    apiClient<T>(endpoint, { method: 'DELETE' }),
}