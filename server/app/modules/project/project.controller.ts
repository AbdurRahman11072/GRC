import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/sendResponse';
import { ProjectService } from './project.service';

const createProject = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const createdById = req.user!.userId;
  const result = await ProjectService.createProject(orgId, createdById, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Project created successfully',
    data: result,
  });
});

const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const result = await ProjectService.getProjects(
    orgId,
    req.query as any,
    req.user?.userId,
    req.orgRole
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Projects retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const id = req.params.id as string;
  const result = await ProjectService.getProjectById(orgId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Project retrieved successfully',
    data: result,
  });
});

const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const id = req.params.id as string;
  const result = await ProjectService.updateProject(orgId, id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Project updated successfully',
    data: result,
  });
});

const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const id = req.params.id as string;
  const result = await ProjectService.deleteProject(orgId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const createDepartment = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const projectId = req.params.id as string;
  const result = await ProjectService.createDepartment(orgId, projectId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Department created successfully',
    data: result,
  });
});

const batchCreateDepartments = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const projectId = req.params.id as string;
  const result = await ProjectService.batchCreateDepartments(
    orgId,
    projectId,
    req.body.departments
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: `Batch department creation complete: ${result.createdCount} created, ${result.skippedCount} skipped`,
    data: result,
  });
});

const getDepartments = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const projectId = req.params.id as string;
  const result = await ProjectService.getDepartments(orgId, projectId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Departments retrieved successfully',
    data: result,
  });
});

const updateDepartment = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const projectId = req.params.id as string;
  const deptId = req.params.deptId as string;
  const result = await ProjectService.updateDepartment(orgId, projectId, deptId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Department updated successfully',
    data: result,
  });
});

const deleteDepartment = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const projectId = req.params.id as string;
  const deptId = req.params.deptId as string;
  const result = await ProjectService.deleteDepartment(orgId, projectId, deptId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const addMember = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const projectId = req.params.id as string;
  const result = await ProjectService.addMember(orgId, projectId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Project member assigned successfully',
    data: result,
  });
});

const batchAddMembers = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const projectId = req.params.id as string;
  const result = await ProjectService.batchAddMembers(orgId, projectId, req.body.members);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: `Batch member assignment complete: ${result.assignedCount} members assigned`,
    data: result,
  });
});

const getMembers = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const projectId = req.params.id as string;
  const result = await ProjectService.getMembers(orgId, projectId, req.query as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Project members retrieved successfully',
    data: result,
  });
});

const updateMember = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const projectId = req.params.id as string;
  const memberId = req.params.memberId as string;
  const result = await ProjectService.updateMember(orgId, projectId, memberId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Project member updated successfully',
    data: result,
  });
});

const deleteMember = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const projectId = req.params.id as string;
  const memberId = req.params.memberId as string;
  const result = await ProjectService.deleteMember(orgId, projectId, memberId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const ProjectController = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  createDepartment,
  batchCreateDepartments,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  addMember,
  batchAddMembers,
  getMembers,
  updateMember,
  deleteMember,
};


