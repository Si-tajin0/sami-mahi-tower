import dbConnect from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import { NextResponse } from "next/server";

// ১. নির্দিষ্ট একজন ভাড়াটিয়ার তথ্য দেখা (GET)
export async function GET(
  _req: Request, // নামের আগে আন্ডারস্কোর দিলে 'unused' এরর আসবে না
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    // ডাটাবেস থেকে আইডি দিয়ে খোঁজা
    const tenant = await Tenant.findById(id);

    if (!tenant) {
      return NextResponse.json({ success: false, message: "ভাড়াটিয়া পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: tenant });
  } catch (err) {
    console.error("Fetch Detail Error:", err);
    return NextResponse.json({ success: false, message: "সার্ভারে সমস্যা হয়েছে" }, { status: 400 });
  }
}

// ২. ভাড়াটিয়ার তথ্য আপডেট/এডিট করা (PUT)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    // নতুন তথ্য দিয়ে আপডেট করা
    const updatedTenant = await Tenant.findByIdAndUpdate(id, body, { new: true });

    if (!updatedTenant) {
      return NextResponse.json({ success: false, message: "ভাড়াটিয়া পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedTenant });
  } catch (err) {
    console.error("Update Error:", err);
    return NextResponse.json({ success: false, message: "আপডেট করা সম্ভব হয়নি" }, { status: 400 });
  }
}

// ৩. ভাড়াটিয়া মুছে ফেলা (DELETE)
export async function DELETE(
  _req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const deletedTenant = await Tenant.findByIdAndDelete(id);

    if (!deletedTenant) {
      return NextResponse.json({ success: false, message: "ভাড়াটিয়া পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "সফলভাবে মুছে ফেলা হয়েছে" });
  } catch (err) {
    console.error("Delete Error:", err);
    return NextResponse.json({ success: false, message: "মুছে ফেলা সম্ভব হয়নি" }, { status: 400 });
  }
}