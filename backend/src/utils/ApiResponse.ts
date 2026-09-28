import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    statusCode: number = 200,
    message: string = 'Success',
    data?: T,
    meta?: PaginationMeta
  ): void {
    const response: any = {
      success: true,
      statusCode,
      message,
    };

    if (data !== undefined) {
      response.data = data;
    }

    if (meta) {
      response.meta = meta;
    }

    res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    statusCode: number = 500,
    message: string = 'Internal server error',
    errors?: Array<{ field: string; message: string }>
  ): void {
    const response: any = {
      success: false,
      statusCode,
      message,
    };

    if (errors && errors.length > 0) {
      response.errors = errors;
    }

    res.status(statusCode).json(response);
  }
}
