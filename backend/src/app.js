import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import memberRoutes from './routes/members.js';

dotenv.config();

export function createApp() {
  const app = express();

  const normalizeOrigin = (origin) => origin?.replace(/\/+$/, '');
  const parseOrigins = (value = '') =>
    value
      .split(',')
      .map((origin) => normalizeOrigin(origin.trim()))
      .filter(Boolean);

  // Default localhost origins for development
  const defaultLocalhostOrigins = [
    'http://localhost:3000',
    'http://localhost:4173',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:4173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ].map(normalizeOrigin);

  const configuredOrigins = [
    ...parseOrigins(process.env.CLIENT_ORIGIN),
    ...parseOrigins(process.env.CLIENT_ORIGINS),
  ];

  // Vercel provides the deployment hostname; include it automatically for previews
  const vercelOrigin = process.env.VERCEL_URL
    ? [normalizeOrigin(`https://${process.env.VERCEL_URL}`)]
    : [];

  // Combine configured origins with default localhost origins
  const allOrigins = [
    ...new Set([...defaultLocalhostOrigins, ...configuredOrigins, ...vercelOrigin]),
  ];

  // Always allow localhost origins so local dev can reach hosted APIs without CORS failures
  const corsOrigin = allOrigins.length > 0 ? allOrigins : true;

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
