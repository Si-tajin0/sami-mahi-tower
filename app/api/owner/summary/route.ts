import dbConnect from "@/lib/mongodb";
import Tenant, { ITenant } from "@/models/Tenant";
import Expense, { IExpense } from "@/models/Expense";
import Payment, { IPayment } from "@/models/Payment";
import { NextResponse } from "next/server";

// ১. পেমেন্টের জন্য সুনির্দিষ্ট ইন্টারফেস তৈরি
interface PopulatedPayment extends Omit<IPayment, 'tenantId'> {
  tenantId: ITenant;
  amount?: number; 
}

export async function GET() {
  try {
    await dbConnect();

    const [tenants, expenses, payments] = await Promise.all([
      Tenant.find({}).sort({ flatNo: 1 }),
      Expense.find({}).sort({ date: -1 }),
      Payment.find({}).populate("tenantId").sort({ year: -1, month: -1 })
    ]);

    const tenantsList = tenants as ITenant[];
    const expensesList = expenses as IExpense[];
    const paymentsList = payments as unknown as PopulatedPayment[]; 

    // ২. সর্বমোট ভাড়া ও সার্ভিস চার্জ হিসাব
    const totalRentIncome = paymentsList
      .filter(p => p.status && p.status.toString().toLowerCase().includes("paid"))
      .reduce((acc, curr) => {
        const val = curr.rentAmount || curr.amount || 0;
        return acc + Number(val);
      }, 0);

    const totalServiceCharge = paymentsList
      .filter(p => p.status && p.status.toString().toLowerCase().includes("paid"))
      .reduce((acc, curr) => acc + (Number(curr.serviceCharge) || 0), 0);

    const totalSecurityDeposit = tenantsList.reduce((acc, curr) => acc + (Number(curr.securityDeposit) || 0), 0);

    // ৩. খরচ হিসাব (Salary সহ আপডেট করা হয়েছে)
    const totalConstruction = expensesList
      .filter(e => e.type === "Construction")
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    const totalMaintenance = expensesList
      .filter(e => e.type === "Maintenance")
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // নতুন: মোট বেতন (Salary) হিসাব
    const totalSalary = expensesList
      .filter(e => e.type === "Salary")
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalTenants: tenantsList.length,
          totalConstruction,
          totalMaintenance,
          totalSalary, // মালিকের পোর্টালে দেখানোর জন্য পাঠানো হলো
          totalRentIncome,
          totalServiceCharge,
          totalSecurityDeposit,
          // মোট লাভ = (ভাড়া + সার্ভিস চার্জ + সিকিউরিটি ডিপোজিট) - (নির্মাণ + মেইনটেন্যান্স + বেতন)
          netBalance: (totalRentIncome + totalServiceCharge + totalSecurityDeposit) - 
                       (totalConstruction + totalMaintenance + totalSalary)
        },
        tenants: tenantsList,
        expenses: expensesList,
        payments: paymentsList
      }
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Owner API Error:", error.message);
    return NextResponse.json({ success: false, message: "সার্ভারে সমস্যা হয়েছে" }, { status: 500 });
  }
}