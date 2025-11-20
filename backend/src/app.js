import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import memberRoutes from './routes/members.js';

dotenv.config();

export function createApp() {
  const app = express();

  // Default localhost origins for development
  const defaultLocalhostOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ];

  const configuredOrigins = process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [];

  // Combine configured origins with default localhost origins
  const allOrigins = [...new Set([...defaultLocalhostOrigins, ...configuredOrigins])];

  // In development, allow all localhost origins; in production, use configured origins
  const corsOrigin =
    process.env.NODE_ENV === 'production' && configuredOrigins.length > 0
      ? configuredOrigins
      : allOrigins.length > 0
        ? allOrigins
        : true;

  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    })
  );

  app.use(express.json());

  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      message: 'CSIET backend is running. Use /api routes for data access.',
    });
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/members', memberRoutes);

  return app;
}

export const app = createApp();
export default app;
