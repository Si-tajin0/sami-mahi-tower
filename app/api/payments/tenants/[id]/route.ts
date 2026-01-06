import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    // ঐ নির্দিষ্ট ভাড়াটিয়ার সব পেমেন্ট খোঁজা
    const history = await Payment.find({ tenantId: id }).sort({ year: -1, month: -1 });

    return NextResponse.json({ 
      success: true, 
      data: history || [] 
    });
  } catch (err) {
    console.error("Payment API error:", err);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}