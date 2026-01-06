import dbConnect from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
import { NextResponse } from "next/server";

// ১. পস্ট রিকোয়েস্টের জন্য ইন্টারফেস (টাইপ সেফটি)
interface LogRequestBody {
  action: string;
  details: string;
}

export async function GET() {
  try {
    await dbConnect();
    // ডাটাবেস থেকে শেষ ৫০টি লগ নিয়ে আসা
    const logs = await ActivityLog.find({}).sort({ createdAt: -1 }).limit(50);
    
    return NextResponse.json({ 
      success: true, 
      data: logs 
    });
  } catch (err: unknown) {
    // এরর কনসোলে প্রিন্ট করা হলো যাতে ESLint এরর না দেয়
    console.error("Log Fetch Error:", err);
    return NextResponse.json({ 
      success: false, 
      message: "লগ আনতে সমস্যা হয়েছে" 
    }, { status: 500 });
  }
}

// ২. লগ সেভ করার জন্য POST মেথড
export async function POST(req: Request) {
  try {
    await dbConnect();
    
    // ডাটা পড়ার সময় টাইপ ডিক্লেয়ার করা
    const body: LogRequestBody = await req.json();
    const { action, details } = body;

    if (!action || !details) {
      return NextResponse.json({ 
        success: false, 
        message: "অ্যাকশন এবং ডিটেইলস প্রয়োজন" 
      }, { status: 400 });
    }

    await ActivityLog.create({ 
      action, 
      details,
      createdAt: new Date() // নিশ্চিত করা হলো সঠিক সময় সেভ হচ্ছে
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    // এরর কনসোলে প্রিন্ট করা হলো
    console.error("Log Post Error:", err);
    return NextResponse.json({ 
      success: false, 
      message: "লগ সেভ করা সম্ভব হয়নি" 
    }, { status: 500 });
  }
}