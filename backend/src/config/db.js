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
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
        return conn;
      })
      .catch((err) => {
        cache.promise = null;
        throw err;
      });
  }

  return cache.promise;
}
