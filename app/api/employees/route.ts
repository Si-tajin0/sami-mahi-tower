import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const employees = await Employee.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: employees });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const employee = await Employee.create(body);
    return NextResponse.json({ success: true, data: employee });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to add staff" }, { status: 500 });
  }
}