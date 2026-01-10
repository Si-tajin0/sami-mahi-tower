import dbConnect from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import { NextResponse } from "next/server";

// নির্দিষ্ট একজনকে দেখা
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const tenant = await Tenant.findById(id);
    if (!tenant) return NextResponse.json({ success: false, message: "ভাড়াটিয়া পাওয়া যায়নি" }, { status: 404 });
    return NextResponse.json({ success: true, data: tenant });
  } catch (err) {
    const error = err as Error;
    console.error("Update Error:", error.message);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

// ভাড়াটিয়া এডিট/আপডেট করা (PATCH)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    
     // ডাটা কনভার্সন
    if (body.rentAmount) body.rentAmount = Number(body.rentAmount);
    if (body.securityDeposit) body.securityDeposit = Number(body.securityDeposit);

    const updatedTenant = await Tenant.findByIdAndUpdate(id, body, { new: true });

    if (!updatedTenant) {
      return NextResponse.json({ success: false, message: "ভাড়াটিয়া পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedTenant });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Update Error:", error.message);
    return NextResponse.json({ success: false, message: "আপডেট ফেইল" }, { status: 400 });
  }
}

// ভাড়াটিয়া ডিলিট করা
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    await Tenant.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (err) {
    const error = err as Error;
    console.error("Update Error:", error.message);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}