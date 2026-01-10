import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const payments = await Payment.find({}); // সব পেমেন্ট
    return NextResponse.json({ success: true, data: payments });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}