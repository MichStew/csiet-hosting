import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('[ERROR] Missing MONGO_URI or MONGODB_URI. Add it to backend/.env first.');
  process.exit(1);
}

async function runHealthCheck() {
  console.log('[INFO] Connecting to MongoDB...');

  const connection = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });

  const { host, port, name: dbName } = connection.connection;
  console.log(`[SUCCESS] Connected to ${host}:${port}/${dbName}`);

  await mongoose.disconnect();
  console.log('[INFO] Connection closed.');
}

runHealthCheck().catch((err) => {
  console.error('\n[ERROR] MongoDB connection failed\n');
  
  // Provide helpful guidance for MongoDB Atlas authentication errors
  if (err.code === 8000 || err.codeName === 'AtlasError' || err.message?.includes('bad auth')) {
    console.error('MongoDB Atlas Authentication Error Detected!\n');
    console.error('Troubleshooting steps:');
    console.error('  1. Verify username and password in your connection string');
    console.error('  2. URL-encode special characters in password:');
    console.error('     - @ → %40');
    console.error('     - # → %23');
    console.error('     - / → %2F');
    console.error('     - : → %3A');
    console.error('     - ? → %3F');
    console.error('     - = → %3D');
    console.error('  3. Check Atlas Network Access - ensure your IP is whitelisted');
    console.error('     (Or use 0.0.0.0/0 for development only - not recommended for production)');
    console.error('  4. Verify database user exists and has correct permissions\n');
    console.error('Example connection string format:');
    console.error('  MONGO_URI=mongodb+srv://username:encodedPassword@cluster.mongodb.net/dbname?retryWrites=true&w=majority\n');
  } else {
    console.error('Error details:');
    console.error(err);
  }
  
  process.exit(1);
});

