"use client";
import { useState, useEffect } from "react";
import { dictionary, type Language } from "@/lib/dictionary";

interface Complaint {
  _id: string; 
  tenantName: string; 
  flatNo: string;
  subject: string; 
  message: string; 
  status: "Pending" | "Solved";
  createdAt: string;
}

// ১. প্রপস ইন্টারফেসে showNotification যোগ করা হলো
interface ManagerComplaintsProps {
  lang: Language;
  onUpdate: () => void;
  showNotification: (msg: string, type?: "success" | "error") => void;
}

export default function ManagerComplaints({ lang, onUpdate, showNotification }: ManagerComplaintsProps) {
  const t = dictionary[lang];
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  const fetchComplaints = async (): Promise<void> => {
    try {
      const res = await fetch("/api/complaints");
      const data = await res.json();
      if (data.success) setComplaints(data.data as Complaint[]);
    } catch (err: unknown) { 
      console.error("Error fetching complaints:", err); 
    }
  };

  useEffect(() => { 
    fetchComplaints(); 
  }, []);

  const handleSolve = async (id: string, tenant: string) => {
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Solved" })
      });

      if (res.ok) {
        // মালিকের জন্য লগ পাঠানো
        await fetch("/api/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: lang === 'bn' ? "অভিযোগ সমাধান" : "Complaint Solved",
            details: lang === 'bn' 
              ? `ম্যানেজার ${tenant}-এর একটি অভিযোগ সমাধান করেছেন।` 
              : `Manager solved a complaint from ${tenant}.`
          })
        });

        fetchComplaints();
        onUpdate();

        // ২. অ্যালার্ট সরিয়ে ফ্যান্সি টোস্ট ব্যবহার করা হয়েছে
        showNotification(
          lang === 'bn' ? "অভিযোগটি সমাধান হিসেবে মার্ক করা হয়েছে।" : "Complaint marked as solved.",
          "success"
        );
      }
    } catch (err: unknown) { 
      console.error("Error solving complaint:", err); 
      showNotification("Error updating status", "error");
    }
  };

  return (
    <div className="bg-white p-8 rounded-[50px] shadow-xl border border-slate-100">
      <h2 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tighter">
        {t.complaintList}
      </h2>
      
      <div className="space-y-6">
        {complaints.map((c) => (
          <div key={c._id} className={`p-6 rounded-[35px] border transition-all duration-300 ${c.status === 'Solved' ? 'bg-slate-50 border-slate-200' : 'bg-red-50/50 border-red-100 shadow-lg shadow-red-900/5'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-red-600 shadow-sm border border-red-50">{c.flatNo}</span>
                <div>
                  <p className="font-black text-slate-800 text-sm uppercase leading-tight">{c.tenantName}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                    {new Date(c.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                  </p>
                </div>
              </div>
              <span className={`text-[8px] font-black uppercase px-4 py-1.5 rounded-full shadow-sm transition-all ${c.status === 'Solved' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white animate-pulse'}`}>
                {c.status === 'Solved' ? t.solved : t.pending}
              </span>
            </div>
            <h4 className="font-bold text-slate-700 text-sm mb-1 leading-tight">{c.subject}</h4>
            <p className="text-slate-500 text-xs mb-6 italic leading-relaxed">&quot;{c.message}&quot;</p>
            
            {c.status === "Pending" && (
              <button 
                onClick={() => handleSolve(c._id, c.tenantName)}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-xl shadow-blue-100 hover:shadow-emerald-100 active:scale-[0.98]"
              >
                {lang === 'bn' ? "সমাধান হয়েছে মার্ক করুন" : "Mark as Solved"}
              </button>
            )}
          </div>
        ))}

        {complaints.length === 0 && (
          <div className="text-center py-24 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
             <p className="text-slate-300 font-black uppercase text-[10px] tracking-widest italic">{t.noNotice}</p>
          </div>
        )}
      </div>
    </div>
  );
}