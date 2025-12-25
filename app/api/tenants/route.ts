import dbConnect from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import { NextResponse } from "next/server";

// ১. নির্দিষ্ট একজনের তথ্য দেখা (GET)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const tenant = await Tenant.findById(id);
    if (!tenant) return NextResponse.json({ success: false }, { status: 404 });
    return NextResponse.json({ success: true, data: tenant });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

// ২. তথ্য সংশোধন করা (PUT)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const data = await req.json();
    const updated = await Tenant.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

// ৩. ভাড়াটিয়া ডিলিট করা (DELETE)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    await Tenant.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}