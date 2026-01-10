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

    // ডাটাবেস থেকে পেমেন্ট হিস্ট্রি খোঁজা
    const history = await Payment.find({ tenantId: id }).sort({ year: -1, month: -1 });

    // ডাটা না থাকলেও অন্তত খালি একটি JSON লিস্ট পাঠান, যাতে HTML এরর না আসে
    return NextResponse.json({ 
      success: true, 
      data: history || [] 
    });

  } catch (err: unknown) {
    console.error("Payment API Error:", err);
    return NextResponse.json({ 
      success: false, 
      data: [], 
      error: "পেমেন্ট ডাটা পাওয়া যায়নি" 
    }, { status: 500 });
  }
}