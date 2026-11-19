
import { Request, Response, NextFunction } from 'express';

// export const notFound = (req: Request, res: Response, next: NextFunction) => {
//     const error = new Error(`Inte hittat - ${req.originalUrl}`);
//     res.status(404);
//     next(error);
// };

export const notFound = (req: Request, res: Response, next: NextFunction) => {
    // End the request lifecycle here by sending the 404 response directly
    res.status(404).json({
        success: false,
        status: 404,
        message: `Inte hittat - ${req.originalUrl}`
    });
};