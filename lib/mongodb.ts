import mongoose from "mongoose";

// .env.local ফাইল থেকে ডাটাবেস লিঙ্কটি নিবে
const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("দয়া করে .env.local ফাইলে MONGODB_URI সেট করুন");
}

// কানেকশন ক্যাশ (বারবার কানেক্ট হওয়া রোধ করতে)
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// গ্লোবাল ভ্যারিয়েবল ডিক্লেয়ার করা
const globalWithMongoose = global as typeof globalThis & {
  mongoose: MongooseCache;
};

let cached = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("✅ ডাটাবেস কানেক্ট হয়েছে!");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;