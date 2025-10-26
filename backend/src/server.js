import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/csiet';

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',').map((origin) => origin.trim()) || '*',
    credentials: true,
  })
);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);

const start = async () => {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => {
    console.log(`🚀 Backend listening on http://localhost:${PORT}`);
  });
};

start();
