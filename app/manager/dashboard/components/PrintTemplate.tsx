"use client";
import { DictionaryContent, type Language } from "@/lib/dictionary";

// ইন্টারফেসগুলো আপডেট করা হয়েছে যাতে page.tsx এর সাথে হুবহু মিলে যায়
interface Tenant { _id: string; name: string; flatNo: string; rentAmount: number; }
interface Payment { tenantId: string; status: string; amount: number; }
interface Expense { 
  _id: string; 
  description: string; 
  amount: number; 
  type: "Construction" | "Maintenance"; // এটি গুরুত্বপূর্ণ
  date: string; 
}

interface PrintProps {
  lang: Language;
  t: DictionaryContent;
  month: keyof DictionaryContent;
  year: number;
  tenants: Tenant[];
  payments: Payment[];
  expenses: Expense[];
  income: number;
  expense: number;
}

export default function PrintTemplate({ lang, t, month, year, tenants, payments, expenses, income, expense }: PrintProps) {
  const formatNum = (n: number) => `৳ ${n.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`;

  return (
    <div className="hidden print:block p-10 bg-white text-black font-sans">
      {/* লেটারহেড */}
      <div className="text-center border-b-4 border-double border-slate-900 pb-6 mb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Sami & Mahi Tower</h1>
        <p className="text-sm font-bold uppercase tracking-widest text-slate-600">Monthly Financial Report</p>
        <div className="mt-4 inline-block px-6 py-1 bg-slate-900 text-white rounded-full font-black text-sm uppercase">
          {t[month]} {year}
        </div>
      </div>

      {/* সামারি কার্ডস */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="border-2 border-slate-200 p-4 rounded-3xl text-center">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{t.monthlyIncome}</p>
          <p className="text-xl font-black text-green-700">{formatNum(income)}</p>
        </div>
        <div className="border-2 border-slate-200 p-4 rounded-3xl text-center">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{t.monthlyExpense}</p>
          <p className="text-xl font-black text-red-600">{formatNum(expense)}</p>
        </div>
        <div className="bg-slate-50 border-2 border-slate-200 p-4 rounded-3xl text-center">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{t.totalBalance}</p>
          <p className="text-xl font-black text-blue-800">{formatNum(income - expense)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-10">
        {/* ভাড়ার তালিকা */}
        <div>
          <h3 className="text-sm font-black uppercase border-b-2 border-slate-900 mb-4 pb-1">{t.rentDetails}</h3>
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-left border-b border-slate-300">
                <th className="py-2">Flat</th>
                <th>Name</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(tenant => {
                const isPaid = payments.some(p => p.tenantId.toString() === tenant._id.toString() && p.status === "Paid");
                return (
                  <tr key={tenant._id} className="border-b border-slate-100">
                    <td className="py-2 font-bold">{tenant.flatNo}</td>
                    <td>{tenant.name}</td>
                    <td className={`text-right font-black ${isPaid ? 'text-green-600' : 'text-red-500'}`}>
                      {isPaid ? t.paid : t.unpaid}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* খরচের তালিকা */}
        <div>
          <h3 className="text-sm font-black uppercase border-b-2 border-slate-900 mb-4 pb-1">{t.expenseDetails}</h3>
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-left border-b border-slate-300">
                <th className="py-2">Type</th>
                <th>Description</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp._id} className="border-b border-slate-100">
                  <td className="py-2 opacity-50 uppercase text-[8px] font-bold">{exp.type}</td>
                  <td className="py-2 font-medium">{exp.description}</td>
                  <td className="py-2 text-right font-black">{formatNum(exp.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-20 flex justify-between items-center pt-10 border-t border-dashed border-slate-300">
        <div className="text-[10px] text-slate-400 font-bold uppercase italic">Report Generated: {new Date().toLocaleString()}</div>
        <div className="text-center">
          <div className="w-40 border-b border-slate-900 mb-2"></div>
          <p className="text-[10px] font-black uppercase tracking-widest">{t.authorizedSign}</p>
        </div>
      </div>
    </div>
  );
}