import { app } from '../src/app.js';
import { connectDB } from '../src/config/db.js';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const connectWithTimeout = async (uri) => {
  const timeoutMs = 8000;
  return Promise.race([
    connectDB(uri),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out connecting to MongoDB after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
};

export default async function handler(req, res) {
  if (!MONGO_URI) {
    console.error('❌ MongoDB URI is not configured (MONGODB_URI / MONGO_URI missing).');
    return res.status(500).json({ message: 'Database unavailable.' });
  }

  try {
    await connectWithTimeout(MONGO_URI);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    return res.status(500).json({ message: 'Database unavailable.' });
  }

  // Invoke Express directly; @vercel/node already provides req/res.
  return app(req, res);
}
