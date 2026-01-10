import dbConnect from "@/lib/mongodb";
import Handover from "@/models/Handover";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { amount, note } = await req.json();
    const record = await Handover.create({ amount: Number(amount), note });
    return NextResponse.json({ success: true, data: record });
  } catch (err: unknown) {
     const error = err as Error;
    console.error("", error.message);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const records = await Handover.find({}).sort({ createdAt: -1 });
    // ডাটা না থাকলেও success: true এবং খালি অ্যারে [] পাঠাবে
    return NextResponse.json({ success: true, data: records || [] });
  } catch (err) {
     const error = err as Error;
    console.error("", error.message);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const { id, status } = await req.json(); // ফ্রন্টএন্ড থেকে আইডি এবং নতুন স্ট্যাটাস আসবে

    const updatedRecord = await Handover.findByIdAndUpdate(
      id, 
      { status: status }, 
      { new: true }
    );

    if (!updatedRecord) {
      return NextResponse.json({ success: false, message: "রেকর্ড পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedRecord });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Handover Confirm Error:", error.message);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}