import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ Missing MONGO_URI or MONGODB_URI. Add it to backend/.env first.');
  process.exit(1);
}

async function runHealthCheck() {
  console.log('🔍 Connecting to MongoDB...');

  const connection = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });

  const { host, port, name: dbName } = connection.connection;
  console.log(`✅ Connected to ${host}:${port}/${dbName}`);

  await mongoose.disconnect();
  console.log('👋 Connection closed.');
}

runHealthCheck().catch((err) => {
  console.error('❌ MongoDB connection failed:');
  console.error(err);
  process.exit(1);
});

