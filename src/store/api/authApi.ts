import { baseApi } from './baseApi';
import { setCredentials, setUser, setOrganizations, logout, setLoading } from '../slices/authSlice';
import type {
  ApiResponse,
  ILoginPayload,
  ILoginResponseData,
  IRegisterPayload,
  IRegisterResponseData,
  IUserProfile,
  IUserOrgMembership,
  IProvisionUserPayload,
  IProvisionUserResponseData,
  IUpdateMePayload,
} from '../../types/auth.types';

export const authApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // 1. User login (returns accessToken + user + organizations)
    login: builder.mutation<ApiResponse<ILoginResponseData>, ILoginPayload>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User', 'Organization'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.data) {
            dispatch(
              setCredentials({
                user: data.data.user,
                accessToken: data.data.accessToken,
                organizations: data.data.organizations,
              })
            );
          }
        } catch {
          // Handled by component error boundary
        }
      },
    }),

    // 2. Organization Owner self-registration
    register: builder.mutation<ApiResponse<IRegisterResponseData>, IRegisterPayload>({
      query: (payload) => ({
        url: '/auth/register',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['User', 'Organization'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.data) {
            const orgs: IUserOrgMembership[] = data.data.organization
              ? [
                  {
                    orgId: data.data.organization.id,
                    orgName: data.data.organization.orgName,
                    orgRole: data.data.organization.role,
                  },
                ]
              : [];
            dispatch(
              setCredentials({
                user: data.data.user,
                accessToken: data.data.accessToken,
                organizations: orgs,
              })
            );
          }
        } catch {
          // Handled by component error boundary
        }
      },
    }),

    // 3. Get currently authenticated profile with associated organizations
    getMe: builder.query<
      ApiResponse<{ user: IUserProfile; organizations: IUserOrgMembership[] }>,
      void
    >({
      query: () => '/auth/me',
      providesTags: ['User'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            const raw = data.data as any;
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
              projectMemberships: raw.projectMemberships || [],
            };

            if (raw.user && raw.projectMemberships && !userProfile.projectMemberships) {
              userProfile.projectMemberships = raw.projectMemberships;
            }

            const orgList: IUserOrgMembership[] =
              raw.organizations ||
              (raw.orgMemberships || []).map((m: any) => ({
                orgId: m.orgId,
                orgName: m.organization?.orgName || 'Workspace',
                orgRole: m.orgRole,
              }));

            dispatch(setUser(userProfile));
            if (orgList.length > 0) {
              dispatch(setOrganizations(orgList));
            }
          }
        } catch {
          dispatch(logout());
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),

    // 4. Logout user and invalidate session
    logoutUser: builder.mutation<ApiResponse<{ message: string }>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(logout());
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),

    // 5. Org Admin direct user provisioning
    createUser: builder.mutation<ApiResponse<IProvisionUserResponseData>, IProvisionUserPayload>({
      query: (payload) => ({
        url: '/auth/create-user',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['User', 'Organization'],
    }),

    // 6. Update user's personal profile
    updateMe: builder.mutation<ApiResponse<IUserProfile>, IUpdateMePayload>({
      query: (payload) => ({
        url: '/users/me',
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['User'],
    }),

    // 7. Change password
    changePassword: builder.mutation<ApiResponse<{ message: string }>, { currentPassword: string; newPassword: string }>({
      query: (payload) => ({
        url: '/users/change-password',
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useLogoutUserMutation,
  useCreateUserMutation,
  useUpdateMeMutation,
  useChangePasswordMutation,
} = authApi;

