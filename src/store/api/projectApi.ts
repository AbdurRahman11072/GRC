import { baseApi } from './baseApi';
import type { ApiResponse } from '../../types/auth.types';
import type { IProject, ICreateProjectPayload } from '../../types/project.types';

export const projectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<
      ApiResponse<IProject[]>,
      { search?: string; status?: string } | void
    >({
      query: (params) => ({
        url: '/projects',
        params: params || undefined,
      }),
      providesTags: ['Project'],
    }),

    getProjectById: builder.query<ApiResponse<IProject>, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Project', id }],
    }),

    createProject: builder.mutation<ApiResponse<IProject>, ICreateProjectPayload>({
      query: (body) => ({
        url: '/projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Project'],
    }),

    batchAddDepartments: builder.mutation<
      ApiResponse<unknown>,
      {
        projectId: string;
        departments: Array<{ name: string; code: string; description?: string }>;
      }
    >({
      query: ({ projectId, departments }) => ({
        url: `/projects/${projectId}/departments/batch`,
        method: 'POST',
        body: { departments },
      }),
      invalidatesTags: ['Department'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useBatchAddDepartmentsMutation,
} = projectApi;
