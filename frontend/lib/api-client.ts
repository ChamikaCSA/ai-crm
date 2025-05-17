type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Add refresh queue to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshComplete(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

async function refreshTokens(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
  try {
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      credentials: 'include',
    });

    if (!refreshResponse.ok) {
      const error = await refreshResponse.json();
      throw new Error(error.error || 'Failed to refresh token');
    }

    return await refreshResponse.json();
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    ...options.headers,
  };

  // Only set Content-Type to application/json if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(endpoint, {
    method: options.method || "GET",
    headers,
    body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
    credentials: 'include',
  });

  // If the token is expired, try to refresh
  if (response.status === 401 && typeof window !== "undefined") {
    // Only attempt refresh if we're in dashboard routes
    if (!window.location.pathname.startsWith('/dashboard')) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (!refreshResponse.ok) {
          const error = await refreshResponse.json();
          throw new Error(error.error || 'Failed to refresh token');
        }

        const { access_token } = await refreshResponse.json();

        // Notify all subscribers
        onRefreshComplete(access_token);

        // Retry the original request
        const retryResponse = await fetch(endpoint, {
          method: options.method || "GET",
          headers,
          body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
          credentials: 'include',
        });

        if (!retryResponse.ok) {
          const data = await retryResponse.json();
          throw new ApiError(retryResponse.status, data.error || "An error occurred");
        }

        const data = await retryResponse.json();
        return data;
      } catch (error) {
        console.error('API Client - Refresh failed:', error);
        // If refresh fails, redirect to login
        window.location.href = '/auth/login';
        throw error;
      } finally {
        isRefreshing = false;
      }
    }
    // If a refresh is already in progress, wait for it to complete
    return new Promise((resolve, reject) => {
      subscribeTokenRefresh((newToken) => {
        fetch(endpoint, {
          method: options.method || "GET",
          headers,
          body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
          credentials: 'include',
        })
          .then(response => response.json())
          .then(data => {
            if (!response.ok) {
              reject(new ApiError(response.status, data.error || "An error occurred"));
            } else {
              resolve(data);
            }
          })
          .catch(reject);
      });
    });
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || "An error occurred");
  }

  return data;
}

// Helper methods for common operations
export const api = {
  get: <T>(endpoint: string, options?: { headers?: Record<string, string> }) =>
    apiClient<T>(endpoint, { ...options }),
  post: <T>(endpoint: string, data: any, options?: { headers?: Record<string, string> }) =>
    apiClient<T>(endpoint, { method: "POST", body: data, ...options }),
  put: <T>(endpoint: string, data: any, options?: { headers?: Record<string, string> }) =>
    apiClient<T>(endpoint, { method: "PUT", body: data, ...options }),
  patch: <T>(endpoint: string, data: any, options?: { headers?: Record<string, string> }) =>
    apiClient<T>(endpoint, { method: "PATCH", body: data, ...options }),
  delete: <T>(endpoint: string, options?: { headers?: Record<string, string> }) =>
    apiClient<T>(endpoint, { method: "DELETE", ...options }),
};
