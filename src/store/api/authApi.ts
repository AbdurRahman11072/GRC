import { baseApi } from './baseApi';
import { setCredentials, setOrganizations, logout, setLoading } from '../slices/authSlice';
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
          if (data.data) {
            dispatch(setOrganizations(data.data.organizations));
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
} = authApi;
