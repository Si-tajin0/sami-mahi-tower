import dbConnect from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import { NextResponse } from "next/server";

// মঙ্গোডিবি এরর এর জন্য একটি টাইপ ইন্টারফেস
interface MongoError {
  code?: number;
  message?: string;
}

// ১. সব ভাড়াটিয়ার তালিকা নিয়ে আসা (GET)
export async function GET() {
  try {
    await dbConnect();
    // ডাটাবেস থেকে সব ভাড়াটিয়াকে খোঁজা হচ্ছে
    const tenants = await Tenant.find({}).sort({ joinedDate: -1 });
    return NextResponse.json({ success: true, data: tenants });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Fetch Error:", error.message);
    return NextResponse.json({ success: false, error: "তথ্য পাওয়া যায়নি" }, { status: 400 });
  }
}

// ২. নতুন ভাড়াটিয়া ডাটাবেসে সেভ করা (POST)
export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();

    const newTenant = await Tenant.create({
      name: data.name,
      phone: data.phone,
      nid: data.nid || "",
      occupation: data.occupation || "",
      flatNo: data.flatNo,
      rentAmount: Number(data.rentAmount),
      securityDeposit: Number(data.securityDeposit) || 0,
      tenantId: data.tenantId,
      emergencyContact: data.emergencyContact || ""
    });

    return NextResponse.json({ success: true, data: newTenant }, { status: 201 });
  } catch (err: unknown) {
    // এখানে any এর বদলে MongoError ইন্টারফেস ব্যবহার করা হয়েছে
    const error = err as MongoError;
    console.error("Save Error Details:", error.message);
    
    // ডুপ্লিকেট আইডি (MongoDB code 11000) চেক
    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        error: "এই আইডিটি ইতিমধ্যে ব্যবহার করা হয়েছে!" 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: "ভাড়াটিয়া যোগ করতে সমস্যা হয়েছে!" 
    }, { status: 400 });
  }
}