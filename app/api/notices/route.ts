import dbConnect from "@/lib/mongodb";
import Notice from "@/models/Notice";
import { NextResponse } from "next/server";

// ১. গেট মেথড (নোটিশ পড়ার জন্য)
export async function GET() {
  try {
    await dbConnect();
    // ডাটাবেস থেকে সর্বশেষ ৫টি নোটিশ নিয়ে আসা
    const notices = await Notice.find({}).sort({ createdAt: -1 }).limit(5);
    
    return NextResponse.json({ success: true, data: notices });
  } catch (err: unknown) {
    // এখানে 'err' ব্যবহার করা হলো যাতে ESLint এরর না দেয়
    console.error("Notice Fetch Error:", err);
    return NextResponse.json({ success: false, message: "নোটিশ আনতে সমস্যা হয়েছে" }, { status: 500 });
  }
}

// ২. পোস্ট মেথড (নতুন নোটিশ সেভ করার জন্য)
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { title, message } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, message: "টাইটেল এবং মেসেজ প্রয়োজন" }, { status: 400 });
    }

    const notice = await Notice.create({ title, message });
    return NextResponse.json({ success: true, data: notice });
  } catch (err: unknown) {
    // এখানেও 'err' ব্যবহার করা হলো
    console.error("Notice Create Error:", err);
    return NextResponse.json({ success: false, message: "নোটিশ সেভ করা সম্ভব হয়নি" }, { status: 500 });
  }
}