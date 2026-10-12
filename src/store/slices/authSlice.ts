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

const getInitialOrgId = (): string | null => {
  if (typeof window !== 'undefined') {
    const val = localStorage.getItem('zio_current_org_id');
    if (val && val !== 'undefined' && val !== 'null' && val.trim() !== '') {
      return val.trim();
    }
  }
  return null;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  organizations: [],
  currentOrgId: getInitialOrgId(),
  isAuthenticated: false,
  isLoading: true,
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

      if (organizations && organizations.length > 0) {
        state.organizations = organizations;
        const orgExists = state.organizations.some((o) => o.orgId === state.currentOrgId);
        if (!state.currentOrgId || !orgExists) {
          state.currentOrgId = organizations[0].orgId;
          if (typeof window !== 'undefined') {
            localStorage.setItem('zio_current_org_id', organizations[0].orgId);
          }
        }
      }
    },
    setUser: (state, action: PayloadAction<IUserProfile>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
    },
    setCurrentOrgId: (state, action: PayloadAction<string>) => {
      state.currentOrgId = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('zio_current_org_id', action.payload);
      }
    },
    setOrganizations: (state, action: PayloadAction<IUserOrgMembership[]>) => {
      state.organizations = action.payload;
      if (action.payload.length > 0) {
        const orgExists = state.organizations.some((o) => o.orgId === state.currentOrgId);
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
