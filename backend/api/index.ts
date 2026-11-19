import mongoose from 'mongoose';
import app from '../src/app';
import { connectToDatabase } from '../src/config/database';

export default async function handler(req: any, res: any) {
  if (mongoose.connection.readyState === 0) {
    await connectToDatabase();
  }

  return app(req, res);
}
