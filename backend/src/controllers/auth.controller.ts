import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { ApiResponse } from '../utils/ApiResponse';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
} from '../services/auth.service';
import { RegisterInput, LoginInput, UpdateRoleInput, UpdateStatusInput } from '../validators/auth.validator';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const input: RegisterInput = req.body;
  const result = await registerUser(input);
  ApiResponse.success(res, 201, 'User registered successfully', result);
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const input: LoginInput = req.body;
  const result = await loginUser(input);
  ApiResponse.success(res, 200, 'Login successful', result);
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  const user = await getCurrentUser(req.user.userId);
  ApiResponse.success(res, 200, 'User profile retrieved', user);
};

export const listUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  const users = await getAllUsers();
  ApiResponse.success(res, 200, 'Users retrieved successfully', users);
};

export const updateRole = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (typeof id !== 'string') {
    throw new Error('Invalid ID');
  }
  const input: UpdateRoleInput = req.body;
  const user = await updateUserRole(id, input);
  ApiResponse.success(res, 200, 'User role updated successfully', user);
};

export const updateStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (typeof id !== 'string') {
    throw new Error('Invalid ID');
  }
  const input: UpdateStatusInput = req.body;
  const user = await updateUserStatus(id, input);
  ApiResponse.success(res, 200, 'User status updated successfully', user);
};
