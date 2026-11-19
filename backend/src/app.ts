import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
//Routes
import propertyRouter from './routes/propertyRouter'; 
import listningRoutes from './routes/listningRoutes';
import userRouter from './routes/users';
import authRoutes from './routes/auth';
import bookingRouter from './routes/bookingRoutes';
import messageRoutes from './routes/messageRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import privacyRoutes from './routes/privacyRoutes';

//middleware
import errorHandler from './middleware/errorMiddleware';
import { notFound } from './middleware/notfoundMiddleware';
import { uploadDirectory } from './config/upload';
import {logger} from './logger/logger'


const pinoHttp = require('pino-http');
const crypto = require('crypto');


const app: Application = express();


//Pino HTTP logging
app.use(
  pinoHttp({
    logger,
    genReqId: (req:Request) => req.headers['x-request-id'] || crypto.randomUUID(),
    customLogLevel: (req:Request, res:Response, err: any) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    }
  })
);


//Security & Parser Middleware
app.use(cors({
  origin(origin, callback) {
    const allowedOrigins = (
      process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.split(',').map(value => value.trim()).filter(Boolean)
        : []
    ).concat([
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:8080'
    ]);

    const isLocalDevelopmentOrigin = origin
      ? /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      : false;

    if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma']
}));

app.use(express.json());


//Static Assests
app.use('/uploads', express.static(uploadDirectory));
app.use('/assets', express.static(path.join(__dirname, '../../frontend/src/assets')));
// app.use('/assets', express.static(path.join(process.cwd(), '../frontend/src/assets')));


//API Endpoints
app.use('/api/v1/properties', propertyRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/listnings', listningRoutes);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/privacy', privacyRoutes);


app.get('/', (req: Request, res: Response) => {
  res.send({ message: 'RentRight API is ready' });
});


//Error Interceptors
app.use(notFound);      
app.use(errorHandler);

export default app;