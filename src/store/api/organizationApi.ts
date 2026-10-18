import { baseApi } from './baseApi';
import type { ApiResponse, IOrgMemberRecord } from '../../types/auth.types';

export const organizationApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getOrganizationMembers: builder.query<
      ApiResponse<IOrgMemberRecord[]>,
      { orgId: string; page?: number; limit?: number; search?: string; role?: string }
    >({
      query: ({ orgId, ...params }) => ({
        url: `/organizations/${orgId}/members`,
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          search: params.search || undefined,
          role: params.role && params.role !== 'ALL' ? params.role : undefined,
        },
      }),
      providesTags: ['Organization', 'User'],
    }),

    updateMemberRole: builder.mutation<
      ApiResponse<unknown>,
      { orgId: string; memberId: string; orgRole: 'ADMIN' | 'AUDITOR' | 'MEMBER' | 'OWNER' }
    >({
      query: ({ orgId, memberId, orgRole }) => ({
        url: `/organizations/${orgId}/members/${memberId}`,
        method: 'PATCH',
        body: { orgRole },
      }),
      invalidatesTags: ['Organization', 'User'],
    }),

    removeMember: builder.mutation<
      ApiResponse<{ message: string }>,
      { orgId: string; memberId: string }
    >({
      query: ({ orgId, memberId }) => ({
        url: `/organizations/${orgId}/members/${memberId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Organization', 'User'],
    }),
  }),
});

export const {
  useGetOrganizationMembersQuery,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
} = organizationApi;
