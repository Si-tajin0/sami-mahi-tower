import dbConnect from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params; // ইউআরএল থেকে আইডি নেওয়া
    const tenant = await Tenant.findById(id);

    if (!tenant) {
      return NextResponse.json({ success: false, message: "ভাড়াটিয়া পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: tenant });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}