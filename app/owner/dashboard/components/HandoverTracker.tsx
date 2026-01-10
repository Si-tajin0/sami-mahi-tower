"use client";
import { useState } from "react";
import { DictionaryContent, Language } from "@/lib/dictionary";
import { Handover } from "@/lib/types";

// ১. ইন্টারফেস আপডেট করা হয়েছে (managerCash এবং pendingAmount যোগ করা হয়েছে)
interface HandoverProps {
  handovers: Handover[];
  t: DictionaryContent;
  lang: Language;
  onRefresh: () => void;
  managerCash: number;   // এই লাইনটি এরর ফিক্স করবে
  pendingAmount: number; // এই লাইনটিও এরর ফিক্স করবে
}

export default function HandoverTracker({ 
  handovers, 
  t, 
  lang, 
  onRefresh, 
  managerCash, 
  pendingAmount 
}: HandoverProps) {
  
  const [processing, setProcessing] = useState<string | null>(null);

  const formatNum = (num: number) => 
    `৳ ${num.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`;

  const handleConfirm = async (id: string) => {
    setProcessing(id);
    try {
      const res = await fetch("/api/handover", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Confirmed" })
      });

      if (res.ok) {
        onRefresh(); // ডাটা রিফ্রেশ করবে
      }
    } catch (err) {
      console.error("Confirmation Error:", err);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ২. ম্যানেজারের ক্যাশ স্ট্যাটাস (Mini Summary inside component) */}
      <div className="grid grid-cols-2 gap-4 no-print">
        <div className="bg-slate-50 p-5 rounded-[30px] border border-slate-100 shadow-inner">
           <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">{t.cashWithManager}</p>
           <p className="text-sm font-black text-orange-600 leading-none">{formatNum(managerCash)}</p>
        </div>
        <div className="bg-slate-50 p-5 rounded-[30px] border border-slate-100 shadow-inner">
           <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">পেন্ডিং হ্যান্ডওভার</p>
           <p className="text-sm font-black text-blue-600 leading-none">{formatNum(pendingAmount)}</p>
        </div>
      </div>

      {/* ৩. মেইন হ্যান্ডওভার লিস্ট */}
      <div className="bg-white p-8 rounded-[45px] shadow-xl shadow-blue-900/5 border border-white">
        <h3 className="text-lg font-black uppercase tracking-tighter text-slate-800 mb-8 italic">
          {t.handoverHistory}
        </h3>
        
        <div className="space-y-4">
          {handovers.map((h) => (
            <div 
              key={h._id} 
              className={`flex justify-between items-center p-5 rounded-[35px] border-2 transition-all duration-500 ${
                h.status === 'Pending' 
                ? 'bg-amber-50/50 border-amber-200 animate-pulse' 
                : 'bg-slate-50/50 border-transparent hover:bg-white hover:shadow-xl'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${
                  h.status === 'Pending' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {h.status === 'Pending' ? '⏳' : '✅'}
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm leading-none">{formatNum(h.amount)}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">
                    {new Date(h.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {day:'numeric', month:'short', year:'numeric'})}
                  </p>
                </div>
              </div>

              <div className="text-right">
                {h.status === "Pending" ? (
                  <button 
                    disabled={processing === h._id}
                    onClick={() => handleConfirm(h._id)}
                    className="bg-slate-950 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {processing === h._id ? "..." : t.confirmHandover}
                  </button>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                     <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 italic">
                        {t.confirmed}
                     </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {handovers.length === 0 && (
            <div className="py-10 text-center opacity-20">
               <p className="font-black uppercase tracking-[0.3em] text-xs">No Records</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}