"use client";
import { useState, useEffect } from "react";
import { dictionary, type Language, type DictionaryContent } from "@/lib/dictionary";

// ১. টাইপ ইন্টারফেসসমূহ
interface StatsProps { 
  lang: Language; 
  month: keyof DictionaryContent; 
  year: number; 
}

interface TenantData { 
  securityDeposit: number; 
}

interface PaymentData { 
  rentAmount?: number; 
  serviceCharge?: number; 
  amount?: number; 
  status: string; 
}

interface ExpenseData { 
  amount: number; 
  date: string; 
}

export default function Stats({ lang, month, year }: StatsProps) {
  const t = dictionary[lang];
  const [summary, setSummary] = useState({ income: 0, expense: 0, deposit: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const timestamp = new Date().getTime();
        // ৩টি এপিআই থেকে ডাটা আনা হচ্ছে
        const [tenantRes, pRes, eRes] = await Promise.all([
          fetch(`/api/tenants?t=${timestamp}`),
          fetch(`/api/payments?month=${month}&year=${year}&t=${timestamp}`),
          fetch(`/api/expenses?t=${timestamp}`)
        ]);
        
        const tData = await tenantRes.json();
        const pData = await pRes.json();
        const eData = await eRes.json();

        if (tData.success && pData.success && eData.success) {
          // --- ১. মোট জামানত হিসাব (সব ভাড়াটিয়া থেকে) ---
          const totalDeposit = (tData.data as TenantData[] || [])
            .reduce((acc, curr) => acc + (Number(curr.securityDeposit) || 0), 0);

          // --- ২. এই মাসের ইনকাম হিসাব (পেইড ভাড়া + সার্ভিস চার্জ) ---
          const totalIncome = (pData.data as PaymentData[] || [])
            .filter(p => p.status?.toLowerCase().trim() === "paid") 
            .reduce((acc, curr) => {
              const rent = Number(curr.rentAmount) || Number(curr.amount) || 0;
              const sc = Number(curr.serviceCharge) || 0;
              return acc + rent + sc;
            }, 0);

          // --- ৩. এই মাসের খরচ হিসাব ---
          const totalExpense = (eData.data as ExpenseData[] || [])
            .filter(e => {
               const d = new Date(e.date);
               const mList = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
               return mList[d.getMonth()] === month && d.getFullYear() === year;
            })
            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

          setSummary({ income: totalIncome, expense: totalExpense, deposit: totalDeposit });
        }
      } catch (err: unknown) {
        console.error("Stats Fetch Error:", err);
      }
    };
    fetchStats();
  }, [month, year]);

  const formatNum = (n: number) => `৳ ${n.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
      {/* ইনকাম কার্ড */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 border-l-[12px] border-l-green-500 hover:shadow-xl transition-all duration-500">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.monthlyIncome}</p>
        <h3 className="text-2xl font-black text-green-600">{formatNum(summary.income)}</h3>
        <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">{t[month]} {year}</p>
      </div>

      {/* জামানত কার্ড */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 border-l-[12px] border-l-amber-500 hover:shadow-xl transition-all duration-500">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.securityDeposit}</p>
        <h3 className="text-2xl font-black text-amber-600">{formatNum(summary.deposit)}</h3>
        <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">Total Security Held</p>
      </div>

      {/* খরচ কার্ড */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 border-l-[12px] border-l-red-500 hover:shadow-xl transition-all duration-500">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.monthlyExpense}</p>
        <h3 className="text-2xl font-black text-red-500">{formatNum(summary.expense)}</h3>
        <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">{t[month]} {year}</p>
      </div>

      {/* নেট ব্যালেন্স কার্ড */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-8 rounded-[40px] text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 text-6xl opacity-10 group-hover:scale-125 transition-transform duration-700 italic">SM</div>
        <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">{t.totalBalance}</p>
        <h3 className="text-2xl font-black">
          {formatNum((summary.income + summary.deposit) - summary.expense)}
        </h3>
        <p className="text-[9px] font-bold opacity-60 mt-2 uppercase">Cash on Hand</p>
      </div>
    </div>
  );
}