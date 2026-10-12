import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  BaseQueryApi,
} from '@reduxjs/toolkit/query/react';
import type { AuthState } from '../slices/authSlice';
import { setToken, logout } from '../slices/authSlice';
import type { ApiResponse, IRefreshResponseData } from '../../types/auth.types';

const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return '/api/v1';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
};

// Raw base query targeting /api/v1
const rawBaseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  credentials: 'include', // Automatically sends httpOnly cookies (e.g. refreshToken)
  prepareHeaders: (headers, { getState }) => {
    // Avoid circular dependency with RootState by querying auth state slice directly
    const state = getState() as { auth?: AuthState };
    const token = state.auth?.accessToken;
    const orgId = state.auth?.currentOrgId;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (orgId) {
      headers.set('x-org-id', orgId);
    }

    return headers;
  },
});

// Concurrency mutex lock to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (api: BaseQueryApi): Promise<string | null> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        api.dispatch(logout());
        return null;
      }

      const payload = (await response.json()) as ApiResponse<IRefreshResponseData>;
      const newAccessToken = payload.data?.accessToken;

      if (newAccessToken) {
        api.dispatch(setToken(newAccessToken));
        return newAccessToken;
      } else {
        api.dispatch(logout());
        return null;
      }
    } catch {
      api.dispatch(logout());
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Re-auth base query interceptor
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  // If 401 Unauthorized occurs, attempt silent token refresh and retry
  if (result.error && result.error.status === 401) {
    const url = typeof args === 'string' ? args : args.url;
    // Do not attempt refresh on auth endpoints to prevent recursion
    if (url.includes('/auth/refresh') || url.includes('/auth/login')) {
      return result;
    }

    const newAccessToken = await refreshAccessToken(api);

    if (newAccessToken) {
      // Retry the original request with the refreshed access token
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Organization',
    'CRM',
    'Project',
    'Department',
    'ToR',
    'DRT',
  ],
  endpoints: () => ({}),
});
