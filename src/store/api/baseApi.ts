import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  BaseQueryApi,
} from '@reduxjs/toolkit/query/react';
import type { AuthState } from '../slices/authSlice';
import { setToken, setUser, setOrganizations, logout } from '../slices/authSlice';
import type { ApiResponse, IRefreshResponseData, IUserProfile, IUserOrgMembership } from '../../types/auth.types';

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

    // Robust active orgId resolution:
    // 1. Current orgId in Redux state
    // 2. First organization in user's memberships
    // 3. Fallback to localStorage 'zio_current_org_id'
    let orgId = state.auth?.currentOrgId || state.auth?.organizations?.[0]?.orgId;
    if ((!orgId || orgId === 'undefined' || orgId === 'null') && typeof window !== 'undefined') {
      const stored = localStorage.getItem('zio_current_org_id');
      if (stored && stored !== 'undefined' && stored !== 'null' && stored.trim() !== '') {
        orgId = stored.trim();
      } else {
        orgId = undefined;
      }
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (orgId && orgId !== 'undefined' && orgId !== 'null' && orgId.trim() !== '') {
      headers.set('x-org-id', orgId.trim());
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

        // Restore user profile and organization list immediately
        try {
          const meResponse = await fetch(`${getBaseUrl()}/auth/me`, {
            headers: {
              Authorization: `Bearer ${newAccessToken}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          if (meResponse.ok) {
            const meData = (await meResponse.json()) as any;
            if (meData?.data) {
              const raw = meData.data;
              const userProfile: IUserProfile = raw.user || {
                id: raw.id,
                email: raw.email,
                name: raw.name,
                phone: raw.phone,
                nid: raw.nid,
                designation: raw.designation,
                isSuperAdmin: !!raw.isSuperAdmin,
                isActive: raw.isActive !== undefined ? !!raw.isActive : true,
                createdAt: raw.createdAt || new Date().toISOString(),
                updatedAt: raw.updatedAt || new Date().toISOString(),
              };

              const orgList: IUserOrgMembership[] =
                raw.organizations ||
                (raw.orgMemberships || []).map((m: any) => ({
                  orgId: m.orgId,
                  orgName: m.organization?.orgName || 'Workspace',
                  orgRole: m.orgRole,
                }));

              api.dispatch(setUser(userProfile));
              if (orgList.length > 0) {
                api.dispatch(setOrganizations(orgList));
              }
            }
          }
        } catch {
          // Non-blocking for refresh
        }

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
