import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { app } from './app.js';

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGO_URI =
  process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/csiet';

export async function startServer(port = PORT, mongoUri = MONGO_URI) {
  await connectDB(mongoUri);
  return app.listen(port, () => {
    console.log(`🚀 Backend listening on http://localhost:${port}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('[ERROR] Failed to start backend server');
    
    if (err.code === 8000 || err.codeName === 'AtlasError' || err.message?.includes('bad auth')) {
      console.error('\nMongoDB Atlas authentication error detected.');
      console.error('Please verify your connection string in backend/.env\n');
    } else {
      console.error(err);
    }
    
    process.exit(1);
  });
}
