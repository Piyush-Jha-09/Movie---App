import { Request, Response } from "express";

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: {
      message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
      status: 404,
    },
  });
};
