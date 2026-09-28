import Project, { IProject } from '../models/Project.model';
import User from '../models/User.model';
import { PROJECT_STATUS, ProjectStatus } from '../config/constants';
import { AppError } from '../utils/AppError';
import { parsePagination, buildPaginationMeta, PaginationMeta } from '../utils/pagination';
import {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQueryInput,
} from '../validators/project.validator';

const VALID_STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  [PROJECT_STATUS.PLANNING]: [PROJECT_STATUS.PLANNING, PROJECT_STATUS.ACTIVE],
  [PROJECT_STATUS.ACTIVE]: [PROJECT_STATUS.ACTIVE, PROJECT_STATUS.ON_HOLD, PROJECT_STATUS.COMPLETED],
  [PROJECT_STATUS.ON_HOLD]: [PROJECT_STATUS.ON_HOLD, PROJECT_STATUS.ACTIVE],
  [PROJECT_STATUS.COMPLETED]: [PROJECT_STATUS.COMPLETED],
};

export const createProject = async (input: CreateProjectInput): Promise<IProject> => {
  const existingProject = await Project.findOne({ code: input.code });
  if (existingProject) {
    throw new AppError(`Project with code '${input.code}' already exists`, 409);
  }

  const manager = await User.findById(input.managerId);
  if (!manager) {
    throw new AppError('Assigned project manager does not exist', 404);
  }

  const actualEndDate =
    input.status === PROJECT_STATUS.COMPLETED ? new Date() : null;

  const project = new Project({
    name: input.name,
    code: input.code,
    description: input.description,
    location: input.location,
    status: input.status,
    startDate: input.startDate,
    expectedEndDate: input.expectedEndDate,
    actualEndDate,
    budget: input.budget,
    managerId: manager._id,
  });

  await project.save();
  await project.populate('managerId', 'name email role');
  return project;
};

export const getProjects = async (
  query: ProjectQueryInput
): Promise<{ projects: IProject[]; meta: PaginationMeta }> => {
  const { page, limit, skip } = parsePagination(query);

  const filter: Record<string, any> = {};
  if (query.status) {
    filter['status'] = query.status;
  }

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate('managerId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Project.countDocuments(filter),
  ]);

  const meta = buildPaginationMeta(page, limit, total);
  return { projects, meta };
};

export const getProjectById = async (id: string): Promise<IProject> => {
  const project = await Project.findById(id).populate('managerId', 'name email role');
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return project;
};

export const updateProject = async (
  id: string,
  input: UpdateProjectInput
): Promise<IProject> => {
  const project = await Project.findById(id);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Business Rule 2: Status transitions
  if (input.status && input.status !== project.status) {
    const allowed = VALID_STATUS_TRANSITIONS[project.status] || [];
    if (!allowed.includes(input.status)) {
      throw new AppError(
        `Invalid status transition from '${project.status}' to '${input.status}'`,
        400
      );
    }
    project.status = input.status;
  }

  // Business Rule 3: Setting status to completed auto-fills actualEndDate
  if (project.status === PROJECT_STATUS.COMPLETED) {
    if (input.actualEndDate !== undefined) {
      project.actualEndDate = input.actualEndDate;
    } else if (!project.actualEndDate) {
      project.actualEndDate = new Date();
    }
  } else if (input.actualEndDate !== undefined) {
    project.actualEndDate = input.actualEndDate;
  }

  // Manager verification
  if (input.managerId && input.managerId !== project.managerId.toString()) {
    const manager = await User.findById(input.managerId);
    if (!manager) {
      throw new AppError('Assigned project manager does not exist', 404);
    }
    project.managerId = manager._id as any;
  }

  if (input.name !== undefined) project.name = input.name;
  if (input.description !== undefined) project.description = input.description;
  if (input.location !== undefined) project.location = input.location;
  if (input.startDate !== undefined) project.startDate = input.startDate;
  if (input.expectedEndDate !== undefined) project.expectedEndDate = input.expectedEndDate;
  if (input.budget !== undefined) project.budget = input.budget;

  await project.save();
  return project.populate('managerId', 'name email role');
};
