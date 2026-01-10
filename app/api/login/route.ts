import dbConnect from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // ১. ইনপুট ট্রিম করা (যাতে ভুল করে স্পেস দিলেও লগইন হয়)
    const userId = body.userId?.toString().trim();
    const password = body.password?.toString().trim();

    if (!userId || !password) {
      return NextResponse.json({ success: false, message: "আইডি এবং পাসওয়ার্ড প্রয়োজন" }, { status: 400 });
    }

    // ২. মালিক এবং ম্যানেজারের জন্য চেক
    if (userId === "owner" && password === "admin123") {
      return NextResponse.json({ success: true, role: "owner" });
    }
    if (userId === "manager" && password === "manager123") {
      return NextResponse.json({ success: true, role: "manager" });
    }

    // ৩. ভাড়াটিয়ার জন্য চেক
    // লজিক: স্ট্যাটাস "Exited" না হলেই তাকে লগইন করতে দিবে (পুরনো ডাটার ক্ষেত্রেও কাজ করবে)
    const tenant = await Tenant.findOne({ 
      tenantId: userId, 
      password: password,
      status: { $ne: "Exited" } // যাদের স্ট্যাটাস 'Exited' নয় তারা সবাই লগইন করতে পারবে
    });

    if (tenant) {
      return NextResponse.json({ 
        success: true, 
        role: "tenant", 
        id: tenant._id 
      });
    }

    // ৪. যদি ভাড়াটিয়া 'Exited' হয়
    const exitedTenant = await Tenant.findOne({ tenantId: userId, password: password, status: "Exited" });
    if (exitedTenant) {
      return NextResponse.json({ 
        success: false, 
        message: "আপনি এই বিল্ডিং ছেড়ে দিয়েছেন।" 
      }, { status: 403 });
    }

    return NextResponse.json({ success: false, message: "ভুল আইডি বা পাসওয়ার্ড" }, { status: 401 });

  } catch (err: unknown) {
    const error = err as Error;
    console.error("Login Error:", error.message);
    return NextResponse.json({ success: false, message: "সার্ভারে সমস্যা হয়েছে" }, { status: 500 });
  }
}