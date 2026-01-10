"use client";
import { DictionaryContent } from "@/lib/dictionary";
import { Complaint } from "@/lib/types";

export default function ComplaintList({ t, complaints }: { t: DictionaryContent, complaints: Complaint[] }) {
  return (
    <div className="bg-white p-12 rounded-[60px] shadow-2xl border border-white no-print">
      <div className="flex items-center gap-4 mb-10">
        <span className="text-3xl">📢</span>
        <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-800">{t.complaintList}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {complaints.map((c) => (
          <div key={c._id} className="p-8 bg-gradient-to-br from-red-50 to-white rounded-[45px] border border-red-100 relative group hover:shadow-2xl transition-all duration-500">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-red-600 shadow-xl border border-red-50">{c.flatNo}</div>
              <span className={`text-[8px] font-black uppercase px-4 py-1.5 rounded-full shadow-sm ${c.status === 'Pending' ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-500 text-white'}`}>{c.status}</span>
            </div>
            <p className="font-black text-slate-800 text-base uppercase mb-2 leading-tight">{c.subject}</p>
            <p className="text-slate-500 text-sm italic line-clamp-3">&quot;{c.message}&quot;</p>
            <p className="text-[10px] font-black text-slate-400 mt-6 pt-4 border-t border-red-100 uppercase">From: {c.tenantName}</p>
          </div>
        ))}
        {complaints.length === 0 && <p className="text-slate-400 italic text-sm">কোনো অভিযোগ নেই</p>}
      </div>
    </div>
  );
}