import mongoose from 'mongoose';

const globalScope = globalThis;
const CACHE_KEY = '__CSIET_DB_CACHE';
if (!globalScope[CACHE_KEY]) {
  globalScope[CACHE_KEY] = { conn: null, promise: null };
}
const cache = globalScope[CACHE_KEY];

export async function connectDB(uri) {
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 5000 })
      .then((conn) => {
        cache.conn = conn;
        console.log(`[SUCCESS] MongoDB connected: ${conn.connection.host}`);
        return conn;
      })
      .catch((err) => {
        cache.promise = null;
        
        // Provide helpful error messages for common MongoDB Atlas authentication issues
        if (err.code === 8000 || err.codeName === 'AtlasError' || err.message?.includes('bad auth')) {
          console.error('\n[ERROR] MongoDB Atlas Authentication Failed!\n');
          console.error('Common causes:');
          console.error('  1. Incorrect username or password in connection string');
          console.error('  2. Special characters in password need URL encoding (e.g., @ → %40, # → %23)');
          console.error('  3. IP address not whitelisted in Atlas Network Access');
          console.error('  4. Database user permissions not configured correctly\n');
          console.error('Check your MONGO_URI in backend/.env');
          console.error('Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?\n');
        }
        
        throw err;
      });
  }

  return cache.promise;
}
