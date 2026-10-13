import { baseApi } from './baseApi';
import type { ApiResponse } from '../../types/auth.types';
import type { IDRTTicket, ICreateDRTTicketPayload } from '../../types/project.types';

export const drtApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getTickets: builder.query<
      ApiResponse<IDRTTicket[]>,
      { projectId: string; search?: string; status?: string }
    >({
      query: ({ projectId, ...params }) => ({
        url: `/drt/projects/${projectId}/tickets`,
        params,
      }),
      providesTags: ['DRT'],
    }),

    createTicket: builder.mutation<ApiResponse<IDRTTicket>, ICreateDRTTicketPayload>({
      query: (body) => ({
        url: '/drt/tickets',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['DRT', 'ToR'],
    }),
  }),
});

export const { useGetTicketsQuery, useCreateTicketMutation } = drtApi;
