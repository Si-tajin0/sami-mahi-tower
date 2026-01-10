import dbConnect from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const { tenantId, newPassword } = await req.json();

    if (!tenantId || !newPassword) {
      return NextResponse.json({ success: false, message: "সব তথ্য দিন" }, { status: 400 });
    }

    // পাসওয়ার্ড আপডেট করা হচ্ছে
    const updatedTenant = await Tenant.findByIdAndUpdate(
      tenantId,
      { password: newPassword }, // যদি পাসওয়ার্ড হ্যাশ করেন তবে এখানে হ্যাশ করে দিবেন
      { new: true }
    );

    if (!updatedTenant) {
      return NextResponse.json({ success: false, message: "ভাড়াটিয়া পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "পাসওয়ার্ড সফলভাবে রিসেট হয়েছে" });
  } catch {
    return NextResponse.json({ success: false, message: "সার্ভারে সমস্যা হয়েছে" }, { status: 500 });
  }
}