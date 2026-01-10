import dbConnect from "@/lib/mongodb";
import Complaint from "@/models/Complaint";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();
    const newComplaint = await Complaint.create(data);
    return NextResponse.json({ success: true, data: newComplaint });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Complaint Save Error:", error.message);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const complaints = await Complaint.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: complaints });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Complaint Fetch Error:", error.message);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}