import serverless from 'serverless-http';
import { app } from '../src/app.js';
import { connectDB } from '../src/config/db.js';

const MONGO_URI = process.env.MONGODB_URI;

const expressHandler = serverless(app);

export default async function handler(req, res) {
  try {
    await connectDB(MONGO_URI);
  } catch (err) {
    if (err.code === 8000 || err.codeName === 'AtlasError' || err.message?.includes('bad auth')) {
      console.error('[ERROR] MongoDB Atlas authentication failed. Check your MONGODB_URI environment variable.');
    } else {
      console.error('[ERROR] MongoDB connection error:', err.message);
    }
    return res.status(500).json({ message: 'Database unavailable.' });
  }

  return expressHandler(req, res);
}
