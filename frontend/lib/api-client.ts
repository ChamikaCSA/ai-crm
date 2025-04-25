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
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // If the token is expired and we have a refresh token, try to refresh
  if (response.status === 401 && refreshToken && typeof window !== "undefined") {
    try {
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshResponse.ok) {
        const { access_token, refresh_token } = await refreshResponse.json();

        // Update cookies
        document.cookie = `token=${access_token}; path=/; max-age=900`; // 15 minutes
        document.cookie = `refresh_token=${refresh_token}; path=/; max-age=604800`; // 7 days

        // Retry the original request with the new token
        headers["Authorization"] = `Bearer ${access_token}`;
        const retryResponse = await fetch(endpoint, {
          method: options.method || "GET",
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        const data = await retryResponse.json();
        if (!retryResponse.ok) {
          throw new ApiError(retryResponse.status, data.error || "An error occurred");
        }
        return data;
      }
    } catch (error) {
      console.error('API Client - Refresh failed:', error);
      // If refresh fails, clear tokens and redirect to login
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.href = '/auth/login';
      throw error;
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
