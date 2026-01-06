"use client";
import { useState, useEffect } from "react";
import { dictionary, type Language, type DictionaryContent } from "@/lib/dictionary";

interface StatsProps { lang: Language; month: keyof DictionaryContent; year: number; }
interface PaymentData { amount: number | string; status: string; }
interface ExpenseData { amount: number | string; date: string; }

export default function Stats({ lang, month, year }: StatsProps) {
  const t = dictionary[lang];
  const [summary, setSummary] = useState({ income: 0, expense: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pRes, eRes] = await Promise.all([
          fetch(`/api/payments?month=${month}&year=${year}`),
          fetch(`/api/expenses`)
        ]);
        const pData = await pRes.json();
        const eData = await eRes.json();

        if (pData.success && eData.success) {
          // --- ইনকাম হিসাব (পেইড ভাড়ার যোগফল) ---
          const totalIncome = (pData.data as PaymentData[] || [])
            .filter(p => p.status && p.status.toLowerCase() === "paid") // পেইড চেক
            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0); // নাম্বার কনভার্ট

          // --- এই মাসের খরচ হিসাব ---
          const totalExpense = (eData.data as ExpenseData[] || [])
            .filter(e => {
               const d = new Date(e.date);
               const mList = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
               return mList[d.getMonth()] === month && d.getFullYear() === year;
            })
            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

          setSummary({ income: totalIncome, expense: totalExpense });
        }
      } catch (err) {
        console.error("Stats Error:", err);
      }
    };
    fetchStats();
  }, [month, year]);

  const formatNum = (n: number) => `৳ ${n.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 border-l-[10px] border-l-green-500">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.monthlyIncome}</p>
        <h3 className="text-3xl font-black text-green-600">{formatNum(summary.income)}</h3>
        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{t[month]} {year}</p>
      </div>
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 border-l-[10px] border-l-red-500">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.monthlyExpense}</p>
        <h3 className="text-3xl font-black text-red-500">{formatNum(summary.expense)}</h3>
        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{t[month]} {year}</p>
      </div>
      <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-8 rounded-[40px] text-white shadow-xl">
        <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">{t.totalBalance}</p>
        <h3 className="text-3xl font-black">{formatNum(summary.income - summary.expense)}</h3>
        <p className="text-[9px] font-bold opacity-60 mt-1 uppercase">Net Monthly Balance</p>
      </div>
    </div>
  );
}