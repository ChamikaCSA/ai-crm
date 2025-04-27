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
  let token: string | null = null;
  let refreshToken: string | null = null;

  // Try to get tokens from cookies in both server and client environments
  if (typeof window !== "undefined") {
    // Client-side
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("token=")
    );
    const refreshTokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("refresh_token=")
    );
    if (tokenCookie) {
      token = tokenCookie.split("=")[1].trim();
    }
    if (refreshTokenCookie) {
      refreshToken = refreshTokenCookie.split("=")[1].trim();
    }
  } else {
    // Server-side
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    token = cookieStore.get('token')?.value || null;
    refreshToken = cookieStore.get('refresh_token')?.value || null;
  }

  const headers: Record<string, string> = {
    ...options.headers,
  };

  // Only set Content-Type to application/json if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    method: options.method || "GET",
    headers,
    body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
    credentials: 'include',
  });

  // If the token is expired and we have a refresh token, try to refresh
  if (response.status === 401 && refreshToken && typeof window !== "undefined") {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const { access_token, refresh_token } = await refreshTokens(refreshToken);

        // Notify all subscribers
        onRefreshComplete(access_token);

        // Retry the original request with the new token
        headers["Authorization"] = `Bearer ${access_token}`;
        const retryResponse = await fetch(endpoint, {
          method: options.method || "GET",
          headers,
          body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
          credentials: 'include', // Important: Include cookies in the request
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
    } else {
      // If a refresh is already in progress, wait for it to complete
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          headers["Authorization"] = `Bearer ${newToken}`;
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
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || "An error occurred");
  }

  return data;
}

// Helper methods for common operations
export const api = {
  get: <T>(endpoint: string) => apiClient<T>(endpoint),
  post: <T>(endpoint: string, data: any) =>
    apiClient<T>(endpoint, { method: "POST", body: data }),
  put: <T>(endpoint: string, data: any) =>
    apiClient<T>(endpoint, { method: "PUT", body: data }),
  patch: <T>(endpoint: string, data: any) =>
    apiClient<T>(endpoint, { method: "PATCH", body: data }),
  delete: <T>(endpoint: string) => apiClient<T>(endpoint, { method: "DELETE" }),
};
