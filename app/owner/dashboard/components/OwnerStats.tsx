"use client";
import { useState, useEffect } from "react";
import { DictionaryContent, type Language } from "@/lib/dictionary";

interface OwnerStatsProps {
  t: DictionaryContent;
  lang: Language;
  stats: { 
    totalRentIncome: number;
    totalServiceCharge: number;
    totalConstruction: number; 
    totalMaintenance: number; 
    netBalance: number; 
    totalSecurityDeposit: number; // নতুন ডাটা
  };
  monthlyIncome: number;
  monthlyServiceCharge: number;
  monthlyExpense: number;
  month: string;
}

export default function OwnerStats({ t, lang, stats, monthlyIncome, monthlyServiceCharge, monthlyExpense, month }: OwnerStatsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatNum = (num: number) => {
    if (!mounted) return "৳ 0";
    return `৳ ${num.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`;
  };

  const mIncomeTotal = Number(monthlyIncome) + Number(monthlyServiceCharge);
  const mExpense = Number(monthlyExpense);
  const mNetProfit = mIncomeTotal - mExpense;

  return (
    <div className="space-y-8 no-print">
      {/* বড় সামারি কার্ডস - এখানে grid-cols-5 ব্যবহার করে এক লাইনে আনা হয়েছে */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatItem label={t.allTimeIncome} value={formatNum(stats.totalRentIncome)} icon="🏠" color="bg-blue-500" />
        <StatItem label={t.securityDeposit} value={formatNum(stats.totalSecurityDeposit)} icon="🔐" color="bg-amber-600" />
        <StatItem label={t.totalServiceCharge} value={formatNum(stats.totalServiceCharge)} icon="⚡" color="bg-cyan-500" />
        <StatItem label={t.constructionSummary} value={formatNum(stats.totalConstruction)} icon="🏗️" color="bg-orange-500" />
        <StatItem label={t.buildingProfit} value={formatNum(stats.netBalance)} icon="💎" color="bg-indigo-600" />
      </div>

      {/* মাসিক হাইলাইট কার্ডস */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] shadow-xl border-l-[12px] border-emerald-400 group hover:scale-[1.02] transition-all">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
             {t.monthlyIncome} ({t[month as keyof DictionaryContent]})
           </p>
           <h3 className="text-3xl font-black text-emerald-600">{formatNum(mIncomeTotal)}</h3>
           <div className="flex gap-3 mt-2 text-[9px] font-bold text-slate-400 uppercase italic">
              <span>ভাড়া: {formatNum(Number(monthlyIncome))}</span>
              <span className="text-slate-300">|</span>
              <span>চার্জ: {formatNum(Number(monthlyServiceCharge))}</span>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-xl border-l-[12px] border-rose-400 group hover:scale-[1.02] transition-all">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
             {t.monthlyExpense} ({t[month as keyof DictionaryContent]})
           </p>
           <h3 className="text-3xl font-black text-rose-600">{formatNum(mExpense)}</h3>
           <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase italic tracking-tighter">Maintenance & Operational</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-8 rounded-[45px] shadow-2xl text-white group hover:scale-[1.02] transition-all">
           <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">{t.totalBalance}</p>
           <h3 className="text-3xl font-black">{formatNum(mNetProfit)}</h3>
           <p className="text-[9px] font-bold opacity-60 mt-2 uppercase italic tracking-tighter text-blue-100">Monthly Net Profit</p>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, icon, color }: { label: string, value: string, icon: string, color: string }) {
  return (
    <div className="bg-white p-6 rounded-[35px] shadow-lg border border-white relative overflow-hidden group">
       <div className={`absolute top-0 right-0 w-20 h-20 ${color} opacity-[0.03] rounded-bl-full`}></div>
       <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-500">{icon}</div>
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{label}</p>
       <h3 className="text-lg font-black text-slate-800 tracking-tighter">{value}</h3>
    </div>
  );
}