import dbConnect from "@/lib/mongodb";
import Tenant, { ITenant } from "@/models/Tenant";
import Expense, { IExpense } from "@/models/Expense";
import Payment, { IPayment } from "@/models/Payment";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    const [tenants, expenses, payments] = await Promise.all([
      Tenant.find({}).sort({ flatNo: 1 }),
      Expense.find({}).sort({ date: -1 }),
      Payment.find({}).populate("tenantId").sort({ year: -1, month: -1 })
    ]);

    // নির্দিষ্ট টাইপে কাস্ট করা (No Any)
    const tenantsList = tenants as unknown as ITenant[];
    const expensesList = expenses as unknown as IExpense[];
    const paymentsList = payments as unknown as (IPayment & { tenantId: ITenant })[];

    const totalConstruction = expensesList
      .filter(e => e.type === "Construction")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalMaintenance = expensesList
      .filter(e => e.type === "Maintenance")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalIncome = paymentsList
      .filter(p => p.status === "Paid")
      .reduce((acc, curr) => acc + curr.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalTenants: tenantsList.length,
          totalConstruction,
          totalMaintenance,
          totalIncome,
          netBalance: totalIncome - (totalConstruction + totalMaintenance)
        },
        tenants: tenantsList,
        expenses: expensesList,
        payments: paymentsList
      }
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Owner API Error:", error.message);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}