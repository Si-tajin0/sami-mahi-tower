import dbConnect from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import { NextResponse } from "next/server";

// মঙ্গোডিবি এরর ইন্টারফেস
interface MongoError {
  code?: number;
  message?: string;
}

// ১. সব ভাড়াটিয়ার তালিকা নিয়ে আসা
export async function GET() {
  try {
    await dbConnect();
    const tenants = await Tenant.find({}).sort({ joinedDate: -1 });
    return NextResponse.json({ success: true, data: tenants });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Fetch Error:", error.message);
    return NextResponse.json({ success: false, error: "তথ্য পাওয়া যায়নি" }, { status: 400 });
  }
}

// ২. নতুন ভাড়াটিয়া যোগ করা (familyMembers সহ আপডেট করা হয়েছে)
export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();

    // চেক করার জন্য টার্মিনালে ডাটা প্রিন্ট হবে
    console.log("Incoming Tenant Data:", data);

    const newTenant = await Tenant.create({
      name: data.name,
      phone: data.phone,
      nid: data.nid || "",
      occupation: data.occupation || "",
      flatNo: data.flatNo,
      rentAmount: Number(data.rentAmount),
      securityDeposit: Number(data.securityDeposit) || 0,
      profilePic: data.profilePic || "", 
      nidPhoto: data.nidPhoto || "",     
      tenantId: data.tenantId,
      // পরিবার সদস্য সংখ্যা যোগ করা হলো (ডিফল্ট ১ জন ধরা হয়েছে)
      familyMembers: Number(data.familyMembers) || 1, 
      password: data.password || "123456",
      emergencyContact: data.emergencyContact || "",
      status: "Active", 
    });

    return NextResponse.json({ success: true, data: newTenant }, { status: 201 });
  } catch (err: unknown) {
    const error = err as MongoError;
    console.error("Save Error Details:", error.message);
    
    // ডুপ্লিকেট আইডি এরর হ্যান্ডলিং
    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        error: "এই আইডিটি ইতিমধ্যে ব্যবহার করা হয়েছে!" 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: "ভাড়াটিয়া যোগ করতে সমস্যা হয়েছে! ডাটাবেস চেক করুন।" 
    }, { status: 400 });
  }
}