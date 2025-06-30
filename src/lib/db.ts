import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// Define proper types for the cached connection
interface CachedConnection {
  conn: typeof import('mongoose') | null;
  promise: Promise<typeof import('mongoose')> | null;
}

// Use proper typing instead of 'any' and declare as const since we modify properties
const cached: CachedConnection = (
  global as typeof globalThis & {
    mongoose?: CachedConnection;
  }
).mongoose || { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: 'todoApp',
      bufferCommands: false
    });
  }

  cached.conn = await cached.promise;

  // Store the cached connection globally for reuse
  (
    global as typeof globalThis & {
      mongoose?: CachedConnection;
    }
  ).mongoose = cached;

  return cached.conn;
}

export default connectDB;
