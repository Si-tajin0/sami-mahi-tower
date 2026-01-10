import dbConnect from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const { id, currentPassword, newPassword } = await req.json();

    // ১. ভাড়াটিয়াকে খুঁজে বের করা
    const tenant = await Tenant.findById(id);

    if (!tenant) {
      return NextResponse.json({ success: false, message: "ভাড়াটিয়া পাওয়া যায়নি" }, { status: 404 });
    }

    // ২. বর্তমান পাসওয়ার্ড চেক করা
    if (tenant.password !== currentPassword) {
      return NextResponse.json({ success: false, message: "বর্তমান পাসওয়ার্ড ভুল" }, { status: 401 });
    }

    // ৩. নতুন পাসওয়ার্ড সেভ করা
    tenant.password = newPassword;
    await tenant.save();

    return NextResponse.json({ success: true, message: "পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে" });
  } catch (err: unknown) {
    console.error("Password Change Error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}