import dbConnect from "@/lib/mongodb";
import Complaint from "@/models/Complaint";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { status } = await req.json();

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updatedComplaint });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}