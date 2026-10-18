import { baseApi } from './baseApi';
import type { ApiResponse } from '../../types/auth.types';
import type {
  ICrmEntity,
  ICreateCrmEntityPayload,
  IEntityContact,
  ICreateEntityContactPayload,
} from '../../types/project.types';

export const crmApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getEntities: builder.query<
      ApiResponse<ICrmEntity[]>,
      { entityType?: 'CLIENT' | 'AUDITEE'; type?: 'CLIENT' | 'AUDITEE'; search?: string } | void
    >({
      query: (params) => {
        if (!params) return { url: '/crm/entities' };
        return {
          url: '/crm/entities',
          params: {
            entityType: params.entityType || params.type,
            search: params.search,
          },
        };
      },
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

    updateEntity: builder.mutation<
      ApiResponse<ICrmEntity>,
      { id: string; body: Partial<ICreateCrmEntityPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/crm/entities/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['CRM', 'Project'],
    }),

    getEntityContacts: builder.query<
      ApiResponse<IEntityContact[]>,
      { entityId: string; department?: string; search?: string }
    >({
      query: ({ entityId, ...params }) => ({
        url: `/crm/entities/${entityId}/contacts`,
        params,
      }),
      providesTags: ['CRM'],
    }),

    createEntityContact: builder.mutation<
      ApiResponse<IEntityContact>,
      ICreateEntityContactPayload
    >({
      query: ({ entityId, ...body }) => ({
        url: `/crm/entities/${entityId}/contacts`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CRM'],
    }),

    deleteEntityContact: builder.mutation<
      ApiResponse<{ message: string }>,
      { entityId: string; contactId: string }
    >({
      query: ({ entityId, contactId }) => ({
        url: `/crm/entities/${entityId}/contacts/${contactId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CRM'],
    }),
  }),
});

export const {
  useGetEntitiesQuery,
  useCreateEntityMutation,
  useUpdateEntityMutation,
  useGetEntityContactsQuery,
  useCreateEntityContactMutation,
  useDeleteEntityContactMutation,
} = crmApi;
