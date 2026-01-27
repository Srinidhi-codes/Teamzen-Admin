import axios from "axios";
import { API_ENDPOINTS } from "./endpoints";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/";

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ✅ REQUIRED for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ----------------------------------
   Token Refresh Management
---------------------------------- */
let isRefreshing = false;
let refreshTokenPromise: Promise<void> | null = null;
let failedQueue: {
  resolve: () => void;
  reject: (error: any) => void;
}[] = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((p) => {
    error ? p.reject(error) : p.resolve();
  });
  failedQueue = [];
};

/* ----------------------------------
   Proactive Token Refresh
---------------------------------- */
let tokenRefreshTimer: NodeJS.Timeout | null = null;

const scheduleTokenRefresh = (expiresIn: number = 3600) => {
  // Clear existing timer
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
  }

  // Schedule refresh 5 minutes before expiration (or 80% of token lifetime)
  const refreshTime = Math.max((expiresIn * 1000 * 0.8), (expiresIn * 1000) - 300000);
  
  tokenRefreshTimer = setTimeout(async () => {
    try {
      await refreshAuthToken();
    } catch (error) {
      console.error("Scheduled token refresh failed:", error);
      // Don't logout here, let the interceptor handle it on next request
    }
  }, refreshTime);
};

/* ----------------------------------
   Response Interceptor
---------------------------------- */
client.interceptors.response.use(
  (response) => {
    // Check if response contains token expiration info
    if (response.data?.expires_in) {
      scheduleTokenRefresh(response.data.expires_in);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config as any;

    // Don't retry if it's a refresh endpoint or already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes(API_ENDPOINTS.REFRESH)
    ) {
      // ⏳ If refresh already happening → queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(client(originalRequest)),
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 🔄 Refresh token (cookies auto-sent)
        await client.post(API_ENDPOINTS.REFRESH);

        processQueue();
        return client(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError);

        // ❌ Refresh failed → session expired
        // Clear scheduled refresh
        if (tokenRefreshTimer) {
          clearTimeout(tokenRefreshTimer);
          tokenRefreshTimer = null;
        }

        // Clear global store
        if (typeof window !== "undefined") {
          import("@/lib/store/useStore").then(({ useStore }) => {
            useStore.getState().logoutUser();
          });
          
          // Only redirect if not already on login page
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/* ----------------------------------
   Manual Token Refresh
---------------------------------- */
export const refreshAuthToken = async () => {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshTokenPromise) {
    return refreshTokenPromise;
  }

  // If refresh is queued, wait in queue
  if (isRefreshing) {
    return new Promise<void>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  refreshTokenPromise = (async () => {
    try {
      const response = await client.post(API_ENDPOINTS.REFRESH);
      
      // Schedule next refresh if expiration info is provided
      if (response.data?.expires_in) {
        scheduleTokenRefresh(response.data.expires_in);
      }
      
      processQueue();
    } catch (error) {
      processQueue(error);
      
      // Clear scheduled refresh on error
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
        tokenRefreshTimer = null;
      }
      
      throw error;
    } finally {
      isRefreshing = false;
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
};

/* ----------------------------------
   Initialize Token Refresh
---------------------------------- */
export const initializeTokenRefresh = async () => {
  try {
    // Try to refresh token on app initialization
    await refreshAuthToken();
    return true;
  } catch (error) {
    console.log("No valid session found");
    return false;
  }
};

/* ----------------------------------
   Cleanup on logout
---------------------------------- */
export const cleanupTokenRefresh = () => {
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }
  isRefreshing = false;
  refreshTokenPromise = null;
  failedQueue = [];
};

export default client;