import { baseApi } from './baseApi';
import type { ApiResponse } from '../../types/auth.types';
import type { ICrmEntity, ICreateCrmEntityPayload } from '../../types/project.types';

export const crmApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEntities: builder.query<
      ApiResponse<ICrmEntity[]>,
      { type?: 'CLIENT' | 'AUDITEE'; search?: string } | void
    >({
      query: (params) => ({
        url: '/crm/entities',
        params: params || undefined,
      }),
      providesTags: ['CRM'],
    }),

    createEntity: builder.mutation<ApiResponse<ICrmEntity>, ICreateCrmEntityPayload>({
      query: (body) => ({
        url: '/crm/entities',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CRM'],
    }),
  }),
});

export const { useGetEntitiesQuery, useCreateEntityMutation } = crmApi;
