"use client";
import { useState, useEffect } from "react"; // useState এবং useEffect যোগ করা হয়েছে
import { DictionaryContent, type Language } from "@/lib/dictionary";

interface Expense { 
  _id: string; 
  description: string; 
  amount: number; 
  type: "Construction" | "Maintenance"; 
  date: string; 
}

interface PrintProps {
  lang: Language;
  t: DictionaryContent;
  month: keyof DictionaryContent;
  year: number;
  tenants: { _id: string; name: string; flatNo: string; rentAmount: number; }[];
  payments: { tenantId: string; status: string; amount: number; }[];
  expenses: Expense[];
  income: number;
  expense: number;
}

export default function PrintTemplate({ lang, t, month, year, expenses, income, expense }: PrintProps) {
  const [mounted, setMounted] = useState(false); // মাউন্ট স্টেট
  const formatNum = (n: number) => `৳ ${n.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`;

  // কম্পোনেন্টটি ব্রাউজারে লোড হলে mounted true হবে
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="hidden print:block p-10 bg-white text-black font-sans">
      {/* ১. প্রফেশনাল লেটারহেড */}
      <div className="text-center border-b-4 border-double border-slate-900 pb-6 mb-10">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Sami & Mahi Tower</h1>
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Monthly Financial Report</p>
        <div className="mt-4 inline-block px-8 py-1.5 bg-slate-900 text-white rounded-full font-black text-sm uppercase">
          {t[month]} {year}
        </div>
      </div>

      {/* ২. সামারি কার্ডস */}
      <div className="grid grid-cols-3 gap-8 mb-12">
        <div className="border-2 border-slate-200 p-6 rounded-[35px] text-center">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-2">{t.monthlyIncome}</p>
          <p className="text-2xl font-black text-green-700">{formatNum(income)}</p>
        </div>
        <div className="border-2 border-slate-200 p-6 rounded-[35px] text-center">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-2">{t.monthlyExpense}</p>
          <p className="text-2xl font-black text-red-600">{formatNum(expense)}</p>
        </div>
        <div className="bg-slate-50 border-2 border-slate-300 p-6 rounded-[35px] text-center shadow-inner">
          <p className="text-[10px] font-black uppercase text-slate-500 mb-2">{t.totalBalance}</p>
          <p className="text-2xl font-black text-blue-900">{formatNum(income - expense)}</p>
        </div>
      </div>

      {/* ৩. খরচের তালিকা */}
      <div className="mb-12">
        <h3 className="text-lg font-black uppercase border-b-2 border-slate-900 mb-4 pb-1">{t.expenseDetails}</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-300 text-[11px] font-black uppercase">
              <th className="py-2">Type</th>
              <th>Description</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(exp => (
              <tr key={exp._id} className="border-b border-slate-100">
                <td className="py-3 text-[9px] font-bold text-slate-400 uppercase">{exp.type}</td>
                <td className="py-3 font-medium text-sm">{exp.description}</td>
                <td className="py-3 text-right font-black text-sm">{formatNum(exp.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ৪. ফুটার ও স্বাক্ষর */}
      <div className="mt-24 flex justify-between items-end border-t border-dashed border-slate-300 pt-10">
        <div className="space-y-1">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em]">Official Document</p>
          
          {/* এখানে লজিক পরিবর্তন করা হয়েছে যাতে হাইড্রেশন এরর না হয় */}
          <p className="text-[10px] font-bold text-slate-600 italic">
            Printed on: {mounted ? new Date().toLocaleString() : ""}
          </p>
          
          <p className="text-[10px] font-bold text-slate-600 italic uppercase">
            Ref: SMI-MAHI/{month.toUpperCase()}-{year}
          </p>
        </div>
        
        <div className="text-center w-64">
          <div className="w-full h-px bg-slate-900 mb-3 opacity-20"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">{t.authorizedSign}</p>
        </div>
      </div>
    </div>
  );
}