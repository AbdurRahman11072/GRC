import { Response } from 'express';

export type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
  data: T;
};

export const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    pagination: data.pagination,
    data: data.data,
  });
};

export default sendResponse;
