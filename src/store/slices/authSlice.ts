import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { IUserProfile, IUserOrgMembership } from '../../types/auth.types';

export interface AuthState {
  user: IUserProfile | null;
  accessToken: string | null;
  organizations: IUserOrgMembership[];
  currentOrgId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const val = localStorage.getItem('zio_access_token');
    return val && val !== 'undefined' && val !== 'null' ? val.trim() : null;
  }
  return null;
};

const getStoredUser = (): IUserProfile | null => {
  if (typeof window !== 'undefined') {
    try {
      const val = localStorage.getItem('zio_user_profile');
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  }
  return null;
};

const getStoredOrgs = (): IUserOrgMembership[] => {
  if (typeof window !== 'undefined') {
    try {
      const val = localStorage.getItem('zio_organizations');
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const getInitialOrgId = (): string | null => {
  if (typeof window !== 'undefined') {
    const val = localStorage.getItem('zio_current_org_id');
    if (val && val !== 'undefined' && val !== 'null' && val.trim() !== '') {
      return val.trim();
    }
  }
  return null;
};

const storedToken = getStoredToken();
const storedUser = getStoredUser();
const storedOrgs = getStoredOrgs();

const initialState: AuthState = {
  user: storedUser,
  accessToken: storedToken,
  organizations: storedOrgs,
  currentOrgId: getInitialOrgId() || (storedOrgs.length > 0 ? storedOrgs[0].orgId : null),
  isAuthenticated: Boolean(storedToken && storedUser),
  isLoading: !storedToken,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: IUserProfile;
        accessToken: string;
        organizations?: IUserOrgMembership[];
      }>
    ) => {
      const { user, accessToken, organizations } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;

      const orgList = organizations || [];
      state.organizations = orgList;

      if (typeof window !== 'undefined') {
        localStorage.setItem('zio_access_token', accessToken);
        localStorage.setItem('zio_user_profile', JSON.stringify(user));
        localStorage.setItem('zio_organizations', JSON.stringify(orgList));
      }

      if (orgList.length > 0) {
        const orgExists = orgList.some((o) => o.orgId === state.currentOrgId);
        if (!state.currentOrgId || !orgExists) {
          state.currentOrgId = orgList[0].orgId;
          if (typeof window !== 'undefined') {
            localStorage.setItem('zio_current_org_id', orgList[0].orgId);
          }
        }
      } else {
        state.currentOrgId = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('zio_current_org_id');
        }
      }
    },
    setUser: (state, action: PayloadAction<IUserProfile>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('zio_user_profile', JSON.stringify(action.payload));
      }
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('zio_access_token', action.payload);
      }
    },
    setCurrentOrgId: (state, action: PayloadAction<string>) => {
      state.currentOrgId = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('zio_current_org_id', action.payload);
      }
    },
    setOrganizations: (state, action: PayloadAction<IUserOrgMembership[]>) => {
      state.organizations = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('zio_organizations', JSON.stringify(action.payload));
      }
      if (action.payload.length > 0) {
        const orgExists = action.payload.some((o) => o.orgId === state.currentOrgId);
        if (!state.currentOrgId || !orgExists) {
          state.currentOrgId = action.payload[0].orgId;
          if (typeof window !== 'undefined') {
            localStorage.setItem('zio_current_org_id', action.payload[0].orgId);
          }
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.organizations = [];
      state.currentOrgId = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('zio_access_token');
        localStorage.removeItem('zio_user_profile');
        localStorage.removeItem('zio_organizations');
        localStorage.removeItem('zio_current_org_id');
      }
    },
  },
});

export const {
  setCredentials,
  setUser,
  setToken,
  setCurrentOrgId,
  setOrganizations,
  setLoading,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
