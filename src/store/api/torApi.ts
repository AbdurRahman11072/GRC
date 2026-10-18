import { baseApi } from './baseApi';
import type { ApiResponse } from '../../types/auth.types';
import type {
  ITorNode,
  ICreateTorPayload,
  ISetStreamWeightPayload,
} from '../../types/tor.types';

export const torApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getTorTree: builder.query<ApiResponse<ITorNode[]>, string>({
      query: (projectId) => `/tors/project/${projectId}/tree`,
      providesTags: ['ToR'],
    }),

    getTors: builder.query<
      ApiResponse<ITorNode[]>,
      { projectId: string; parentId?: string; search?: string }
    >({
      query: ({ projectId, ...params }) => ({
        url: `/tors/project/${projectId}`,
        params,
      }),
      providesTags: ['ToR'],
    }),

    createTor: builder.mutation<ApiResponse<ITorNode>, ICreateTorPayload>({
      query: (body) => ({
        url: '/tors',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ToR'],
    }),

    setStreamWeights: builder.mutation<ApiResponse<unknown>, ISetStreamWeightPayload>({
      query: ({ torId, weights }) => ({
        url: `/tors/${torId}/stream-weights`,
        method: 'POST',
        body: { weights },
      }),
      invalidatesTags: ['ToR'],
    }),

    deleteTor: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/tors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ToR'],
    }),

    assignMemberToTor: builder.mutation<
      ApiResponse<unknown>,
      { torId: string; userId: string }
    >({
      query: ({ torId, userId }) => ({
        url: `/tors/${torId}/members`,
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: ['ToR'],
    }),

    assignTrioMembers: builder.mutation<
      ApiResponse<unknown>,
      import('../../types/tor.types').IAssignTrioPayload
    >({
      query: ({ torId, ...body }) => ({
        url: `/tors/${torId}/assign-trio`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ToR'],
    }),

    removeMemberFromTor: builder.mutation<
      ApiResponse<unknown>,
      { torId: string; userId: string }
    >({
      query: ({ torId, userId }) => ({
        url: `/tors/${torId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ToR'],
    }),

    submitTorDocument: builder.mutation<
      ApiResponse<unknown>,
      {
        torId: string;
        fileName: string;
        fileUrl?: string;
        fileSize?: number;
        fileType?: string;
        notes?: string;
      }
    >({
      query: ({ torId, ...body }) => ({
        url: `/tors/${torId}/documents`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ToR'],
    }),

    updateDocumentStatus: builder.mutation<
      ApiResponse<unknown>,
      { torId: string; docId: string; status: string }
    >({
      query: ({ torId, docId, status }) => ({
        url: `/tors/${torId}/documents/${docId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['ToR'],
    }),

    checkTorDocument: builder.mutation<
      ApiResponse<unknown>,
      import('../../types/tor.types').ICheckTorDocumentPayload
    >({
      query: ({ torId, docId, status, reviewNotes }) => ({
        url: `/tors/${torId}/documents/${docId}/check`,
        method: 'PATCH',
        body: { status, reviewNotes },
      }),
      invalidatesTags: ['ToR'],
    }),
  }),
});

export const {
  useGetTorTreeQuery,
  useGetTorsQuery,
  useCreateTorMutation,
  useSetStreamWeightsMutation,
  useDeleteTorMutation,
  useAssignMemberToTorMutation,
  useAssignTrioMembersMutation,
  useRemoveMemberFromTorMutation,
  useSubmitTorDocumentMutation,
  useUpdateDocumentStatusMutation,
  useCheckTorDocumentMutation,
} = torApi;
