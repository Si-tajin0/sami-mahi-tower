import dbConnect from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import { NextResponse } from "next/server";

// ১. নির্দিষ্ট একজনকে দেখা (GET)
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
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Fetch Error:", error.message);
    return NextResponse.json({ success: false, error: "তথ্য পাওয়া যায়নি" }, { status: 400 });
  }
}

// ২. ভাড়াটিয়া এডিট/আপডেট করা (PATCH)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    
    // ডাটা ক্লিনআপ: _id এবং tenantId বাদ দেওয়ার জন্য delete ব্যবহার করা হলো
    // এতে "assigned a value but never used" এররটি আর আসবে না
    const updateData = { ...body };
    delete updateData._id;
    delete updateData.tenantId;

    // ডাটা কনভার্সন নিশ্চিত করা হলো
    if (updateData.rentAmount !== undefined) updateData.rentAmount = Number(updateData.rentAmount);
    if (updateData.securityDeposit !== undefined) updateData.securityDeposit = Number(updateData.securityDeposit);
    
    // পরিবার সদস্য সংখ্যা আপডেট লজিক
    if (updateData.familyMembers !== undefined) {
      updateData.familyMembers = Number(updateData.familyMembers);
    }

    const updatedTenant = await Tenant.findByIdAndUpdate(
      id, 
      { $set: updateData }, 
      { new: true }
    );

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

// ৩. ভাড়াটিয়া ডিলিট করা (DELETE)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    await Tenant.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Delete Error:", error.message);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}