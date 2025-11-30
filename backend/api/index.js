import serverless from 'serverless-http';
import { app } from '../src/app.js';
import { connectDB } from '../src/config/db.js';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const expressHandler = serverless(app);

export default async function handler(req, res) {
  if (!MONGO_URI) {
    console.error('❌ MongoDB URI is not configured (MONGODB_URI / MONGO_URI missing).');
    return res.status(500).json({ message: 'Database unavailable.' });
  }

  try {
    await connectDB(MONGO_URI);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    return res.status(500).json({ message: 'Database unavailable.' });
  }

  return expressHandler(req, res);
}
