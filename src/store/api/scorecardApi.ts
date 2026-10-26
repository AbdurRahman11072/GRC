import { baseApi } from './baseApi';
import type { ApiResponse } from '../../types/auth.types';
import type {
  IProjectScorecard,
  IUpdateProjectWeightsPayload,
  IEvaluatePmPayload,
} from '../../types/scorecard.types';

export const scorecardApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProjectScorecard: builder.query<ApiResponse<IProjectScorecard>, string>({
      query: (projectId) => `/projects/${projectId}/scorecard`,
      providesTags: (_result, _error, projectId) => [
        { type: 'Project', id: projectId },
        { type: 'ToR', id: `SCORECARD_${projectId}` },
      ],
    }),

    updateProjectWeights: builder.mutation<
      ApiResponse<IProjectScorecard>,
      { projectId: string; body: IUpdateProjectWeightsPayload }
    >({
      query: ({ projectId, body }) => ({
        url: `/projects/${projectId}/weights`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: projectId },
        { type: 'ToR', id: `SCORECARD_${projectId}` },
        'ToR',
      ],
    }),

    evaluatePmDiscretionary: builder.mutation<
      ApiResponse<IProjectScorecard>,
      { projectId: string; body: IEvaluatePmPayload }
    >({
      query: ({ projectId, body }) => ({
        url: `/projects/${projectId}/pm-evaluation`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: projectId },
        { type: 'ToR', id: `SCORECARD_${projectId}` },
      ],
    }),

    recalculateProjectMarks: builder.mutation<ApiResponse<IProjectScorecard>, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/recalculate-marks`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, projectId) => [
        { type: 'Project', id: projectId },
        { type: 'ToR', id: `SCORECARD_${projectId}` },
        'ToR',
        'DRT',
      ],
    }),
  }),
});

export const {
  useGetProjectScorecardQuery,
  useUpdateProjectWeightsMutation,
  useEvaluatePmDiscretionaryMutation,
  useRecalculateProjectMarksMutation,
} = scorecardApi;
