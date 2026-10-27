import { baseApi } from './baseApi';
import type { ApiResponse } from '../../types/auth.types';
import type {
  IDRTTicket,
  ICreateDRTTicketPayload,
  IUpdateDRTTicketPayload,
  IDRTDocument,
  DRTPartySide,
  PeriodEvidenceStatus,
} from '../../types/project.types';

export const drtApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getTickets: builder.query<
      ApiResponse<IDRTTicket[]>,
      { projectId: string; search?: string; status?: string; torId?: string; department?: string }
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

    assignSquad: builder.mutation<
      ApiResponse<IDRTTicket>,
      {
        id: string;
        supervisorId?: string | null;
        fieldMemberId?: string | null;
        clientContactId?: string | null;
        auditeeContactId?: string | null;
        expectedDateOfReceipt?: string | null;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/drt/tickets/${id}/squad`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['DRT', 'ToR'],
    }),

    uploadDrtDocument: builder.mutation<
      ApiResponse<IDRTDocument>,
      {
        ticketId: string;
        partySide: DRTPartySide;
        fileName: string;
        fileUrl?: string | null;
        fileSize?: number | null;
        fileType?: string | null;
        referenceNumber?: string | null;
        receivedDate?: string | null;
        notes?: string | null;
        periodLabel?: string | null;
        periodStatus?: PeriodEvidenceStatus | null;
        periodRemark?: string | null;
      }
    >({
      query: ({ ticketId, ...body }) => ({
        url: `/drt/tickets/${ticketId}/documents`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['DRT', 'ToR'],
    }),

    reviewDrtDocument: builder.mutation<
      ApiResponse<IDRTDocument>,
      {
        docId: string;
        status: 'ACCEPTED' | 'REVISION_REQUESTED';
        reviewNotes?: string | null;
      }
    >({
      query: ({ docId, ...body }) => ({
        url: `/drt/documents/${docId}/review`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['DRT', 'ToR'],
    }),

    updatePeriodStatuses: builder.mutation<
      ApiResponse<IDRTTicket>,
      {
        ticketId: string;
        statuses: Array<{
          periodId?: string | null;
          periodLabel: string;
          evidenceStatus: string;
          remark?: string | null;
        }>;
      }
    >({
      query: ({ ticketId, statuses }) => ({
        url: `/drt/tickets/${ticketId}/period-statuses`,
        method: 'PUT',
        body: { statuses },
      }),
      invalidatesTags: ['DRT', 'ToR'],
    }),

    mapToRs: builder.mutation<
      ApiResponse<IDRTTicket>,
      { ticketId: string; torIds: string[]; action?: 'SET' | 'ADD' | 'REMOVE' }
    >({
      query: ({ ticketId, ...body }) => ({
        url: `/drt/tickets/${ticketId}/tor-mappings`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['DRT', 'ToR'],
    }),

    updateTicket: builder.mutation<
      ApiResponse<IDRTTicket>,
      { id: string; body: IUpdateDRTTicketPayload }
    >({
      query: ({ id, body }) => ({
        url: `/drt/tickets/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['DRT', 'ToR'],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useAssignSquadMutation,
  useUploadDrtDocumentMutation,
  useReviewDrtDocumentMutation,
  useUpdatePeriodStatusesMutation,
  useMapToRsMutation,
} = drtApi;

