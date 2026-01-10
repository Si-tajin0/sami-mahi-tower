import dbConnect from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
import { NextResponse } from "next/server";

// ১. পেমেন্ট বা ভাড়াটিয়া পরিবর্তনের সুক্ষ্ম ডাটার জন্য ইন্টারফেস
interface LogChange {
  field: string;
  old: string | number;
  new: string | number;
}

// ২. রিকোয়েস্ট বডির ইন্টারফেস আপডেট
interface LogRequestBody {
  action: string;
  details: string;
  changes?: LogChange[]; // এটি অপশনাল, কারণ সব লগে পরিবর্তন নাও থাকতে পারে
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
    const error = err as Error;
    console.error("Log Fetch Error:", error.message);
    return NextResponse.json({ 
      success: false, 
      message: "লগ আনতে সমস্যা হয়েছে" 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    // ডাটা পড়ার সময় নতুন ইন্টারফেস ব্যবহার
    const body: LogRequestBody = await req.json();
    const { action, details, changes } = body;

    if (!action || !details) {
      return NextResponse.json({ 
        success: false, 
        message: "অ্যাকশন এবং ডিটেইলস প্রয়োজন" 
      }, { status: 400 });
    }

    // ডাটাবেসে সেভ করা
    await ActivityLog.create({ 
      action, 
      details,
      changes: changes || [], // যদি কোনো পরিবর্তন না থাকে তবে খালি অ্যারে
      performedBy: "Manager",
      createdAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Log Post Error:", error.message);
    return NextResponse.json({ 
      success: false, 
      message: "লগ সেভ করা সম্ভব হয়নি" 
    }, { status: 500 });
  }
}