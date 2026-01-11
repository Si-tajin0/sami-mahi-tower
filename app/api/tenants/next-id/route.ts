import dbConnect from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    // সর্বোচ্চ tenantId খুঁজে বের করা
    const lastTenant = await Tenant.findOne().sort({ tenantId: -1 });
    const nextId = lastTenant ? Number(lastTenant.tenantId) + 1 : 101; // শুরুতে ১০১ থেকে শুরু হবে

    return NextResponse.json({ success: true, nextId });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}