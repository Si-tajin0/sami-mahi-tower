
"use client";
import { useMemo } from "react";
import { Language, DictionaryContent } from "@/lib/dictionary";
import { Tenant, Payment } from "@/lib/types";

interface Props {
  tenants: Tenant[];
  payments: Payment[];
  lang: Language;
  t: DictionaryContent;
  month: string;
  year: number;
}

export default function CollectionStats({ tenants, payments, lang, month, year }: Props) {
  
  const stats = useMemo(() => {
    // ১. এই মাসের টার্গেট হিসাব (সকল একটিভ ভাড়াটিয়ার ভাড়া + সার্ভিস চার্জ)
    // সার্ভিস চার্জ হিসেবে ৫০০০ টাকা (বা আপনার ডিফল্ট) ধরা যেতে পারে
    const target = tenants
      .filter(tenant => tenant.status !== "Exited")
      .reduce((acc, curr) => acc + (Number(curr.rentAmount) || 0) + 0, 0);

    // ২. এই মাসে কত আদায় হয়েছে
    const collected = payments
      .filter(p => p.month === month && p.year === year && p.status?.toLowerCase().trim() === "paid")
      .reduce((acc, curr) => acc + (Number(curr.rentAmount) || 0) + (Number(curr.serviceCharge) || 0), 0);

    const due = target - collected;
    const percentage = target > 0 ? Math.round((collected / target) * 100) : 0;

    return { target, collected, due, percentage };
  }, [tenants, payments, month, year]);

  const formatNum = (num: number) => 
    `৳ ${num.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`;

  return (
    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[50px] shadow-2xl border border-white relative overflow-hidden group">
      {/* ব্যাকগ্রাউন্ড ডেকোরেশন */}
      <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-8xl font-black italic rotate-12 select-none">TARGET</div>

      <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
        
        {/* থার্মোমিটার / প্রগ্রেস সার্কেল */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80" cy="80" r="70"
              stroke="currentColor" strokeWidth="12" fill="transparent"
              className="text-slate-100"
            />
            <circle
              cx="80" cy="80" r="70"
              stroke="currentColor" strokeWidth="12" fill="transparent"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * stats.percentage) / 100}
              strokeLinecap="round"
              className="text-blue-600 transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="text-3xl font-black text-slate-800">{stats.percentage}%</span>
             <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'bn' ? 'আদায়কৃত' : 'Collected'}</span>
          </div>
        </div>

        {/* ডাটা ডিটেইলস */}
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'bn' ? 'মোট লক্ষ্যমাত্রা' : 'Total Target'}</p>
            <h4 className="text-2xl font-black text-slate-800">{formatNum(stats.target)}</h4>
            <div className="h-1 w-10 bg-slate-200 rounded-full"></div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{lang === 'bn' ? 'বর্তমান আদায়' : 'Received Amount'}</p>
            <h4 className="text-2xl font-black text-emerald-600">{formatNum(stats.collected)}</h4>
            <div className="h-1 w-10 bg-emerald-500 rounded-full"></div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{lang === 'bn' ? 'বকেয়া পাওনা' : 'Pending Due'}</p>
            <h4 className="text-2xl font-black text-rose-600">{formatNum(stats.due > 0 ? stats.due : 0)}</h4>
            <div className="h-1 w-10 bg-rose-500 rounded-full"></div>
          </div>
        </div>

        {/* কুইক অ্যাকশন */}
        <div className="hidden xl:block border-l border-slate-100 pl-10">
           <div className="bg-slate-900 p-5 rounded-3xl text-white text-center">
              <p className="text-[8px] font-black uppercase opacity-60 mb-2">{lang === 'bn' ? 'অবস্থা' : 'Status'}</p>
              <p className="text-xs font-bold italic">
                {stats.percentage === 100 ? "Goal Reached! 🎉" : "Collecting..."}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}