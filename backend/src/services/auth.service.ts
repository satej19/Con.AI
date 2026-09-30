import User from '../models/User.model';
import type { IUser } from '../models/User.model';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { RegisterInput, LoginInput, UpdateRoleInput, UpdateStatusInput } from '../validators/auth.validator';
import { env } from '../config/env';

export const registerUser = async (input: RegisterInput): Promise<{ user: Partial<IUser>; token: string }> => {
  const { name, email, password, role } = input;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  // If email matches ADMIN_EMAIL, assign admin role (override request)
  // Otherwise, use requested role or default to 'user'
  let userRole = role || 'user';
  if (env.ADMIN_EMAIL && email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase()) {
    userRole = 'admin';
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: userRole,
  });

  const token = signToken({ userId: user._id.toString(), role: user.role });

  const userResponse = user.toObject();
  const { password: _, ...userWithoutPassword } = userResponse;

  return { user: userWithoutPassword, token };
};

export const loginUser = async (input: LoginInput): Promise<{ user: Partial<IUser>; token: string }> => {
  const { email, password } = input;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', 403);
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = signToken({ userId: user._id.toString(), role: user.role });

  const userResponse = user.toObject();
  const { password: _, ...userWithoutPassword } = userResponse;

  return { user: userWithoutPassword, token };
};

export const getCurrentUser = async (userId: string): Promise<Partial<IUser>> => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const userResponse = user.toObject();
  const { password: _, ...userWithoutPassword } = userResponse;

  return userWithoutPassword;
};

export const getAllUsers = async (): Promise<Partial<IUser>[]> => {
  const users = await User.find().select('-password');
  return users.map(user => user.toObject());
};

export const updateUserRole = async (userId: string, input: UpdateRoleInput): Promise<Partial<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.role = input.role;
  await user.save();

  const userResponse = user.toObject();
  const { password: _, ...userWithoutPassword } = userResponse;

  return userWithoutPassword;
};

export const updateUserStatus = async (userId: string, input: UpdateStatusInput): Promise<Partial<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.isActive = input.isActive;
  await user.save();

  const userResponse = user.toObject();
  const { password: _, ...userWithoutPassword } = userResponse;

  return userWithoutPassword;
};
