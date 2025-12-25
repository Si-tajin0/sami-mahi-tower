import dbConnect from "@/lib/mongodb";
import Expense from "@/models/Expense";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();
    const newExpense = await Expense.create(data);
    return NextResponse.json({ success: true, data: newExpense });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const expenses = await Expense.find({}).sort({ date: -1 });
    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}