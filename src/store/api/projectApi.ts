import { baseApi } from './baseApi';
import type { ApiResponse } from '../../types/auth.types';
import type {
  IProject,
  ICreateProjectPayload,
  IProjectDepartment,
  IProjectMember,
  IAddProjectMemberPayload,
} from '../../types/project.types';

export const projectApi = baseApi.injectEndpoints({
  overrideExisting: true,
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

    updateProject: builder.mutation<
      ApiResponse<IProject>,
      { id: string; body: Partial<ICreateProjectPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/projects/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Project', id }, 'Project'],
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

    getProjectDepartments: builder.query<ApiResponse<IProjectDepartment[]>, string>({
      query: (projectId) => `/projects/${projectId}/departments`,
      providesTags: ['Department'],
    }),

    addProjectDepartment: builder.mutation<
      ApiResponse<IProjectDepartment>,
      { projectId: string; name: string; code: string; description?: string }
    >({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/departments`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Department'],
    }),

    getProjectMembers: builder.query<ApiResponse<IProjectMember[]>, string>({
      query: (projectId) => `/projects/${projectId}/members`,
      providesTags: ['User', 'Project'],
    }),

    addProjectMember: builder.mutation<ApiResponse<IProjectMember>, IAddProjectMemberPayload>({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/members`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User', 'Project'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useBatchAddDepartmentsMutation,
  useGetProjectDepartmentsQuery,
  useAddProjectDepartmentMutation,
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
} = projectApi;
