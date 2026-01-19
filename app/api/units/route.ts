import dbConnect from "@/lib/mongodb";
import Unit from "@/models/Unit";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();
  const units = await Unit.find({});
  return NextResponse.json({ success: true, data: units });
}

export async function PATCH(req: Request) {
  await dbConnect();
  const { flatNo, ...updateData } = await req.json();
  const unit = await Unit.findOneAndUpdate({ flatNo }, updateData, { upsert: true, new: true });
  return NextResponse.json({ success: true, data: unit });
}