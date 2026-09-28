import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { ApiResponse } from '../utils/ApiResponse';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
} from '../services/project.service';
import {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQueryInput,
} from '../validators/project.validator';

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  const input: CreateProjectInput = req.body;
  const project = await createProject(input);
  ApiResponse.success(res, 201, 'Project created successfully', project);
};

export const list = async (req: AuthRequest, res: Response): Promise<void> => {
  const query = req.query as unknown as ProjectQueryInput;
  const { projects, meta } = await getProjects(query);
  ApiResponse.success(res, 200, 'Projects retrieved successfully', projects, meta);
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const project = await getProjectById(id as string);
  ApiResponse.success(res, 200, 'Project retrieved successfully', project);
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const input: UpdateProjectInput = req.body;
  const project = await updateProject(id as string, input);
  ApiResponse.success(res, 200, 'Project updated successfully', project);
};
