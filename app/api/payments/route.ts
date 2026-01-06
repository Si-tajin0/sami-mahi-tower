import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { NextResponse } from "next/server";

// ১. নির্দিষ্ট মাস ও বছরের পেমেন্ট লিস্ট দেখা
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = Number(searchParams.get("year"));

    const payments = await Payment.find({ month, year });
    return NextResponse.json({ success: true, data: payments });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

// ২. পেমেন্ট স্ট্যাটাস পরিবর্তন করা (Paid/Unpaid)
export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const { tenantId, month, year, amount, status } = await req.json();

    const updatedPayment = await Payment.findOneAndUpdate(
      { tenantId, month, year },
      { amount: Number(amount), // এখানে স্ট্রিং আসলে সেটি নাম্বার হয়ে যাবে
    status: status },
      { upsert: true, new: true } // যদি রেকর্ড না থাকে তবে নতুন তৈরি করবে
    );

    return NextResponse.json({ success: true, data: updatedPayment });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}