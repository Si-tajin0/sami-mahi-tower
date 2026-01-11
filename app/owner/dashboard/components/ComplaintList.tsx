"use client";
import { DictionaryContent, type Language } from "@/lib/dictionary";
import { Complaint } from "@/lib/types";

// ১. প্রপস ইন্টারফেস আপডেট করা হয়েছে (lang যোগ করা হয়েছে)
interface ComplaintListProps {
  t: DictionaryContent;
  complaints: Complaint[];
  lang: Language;
}

export default function ComplaintList({ t, complaints, lang }: ComplaintListProps) {
  
  return (
    <div className="w-full no-print">
      {/* ২. হেডার সেকশন - t.complaintList ব্যবহার করে এরর ফিক্স করা হয়েছে */}
      <div className="flex items-center justify-between mb-8 px-4">
         <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800 italic">
           {t.complaintList}
         </h3>
         <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Live Updates</span>
         </div>
      </div>

      {/* ৩. অভিযোগের গ্রিড তালিকা */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {complaints.map((c) => (
          <div 
            key={c._id} 
            className="group relative bg-white rounded-[40px] border border-slate-100 p-8 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col justify-between overflow-hidden"
          >
            {/* ফ্ল্যাট এবং টেন্যান্ট ইনফো */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black italic shadow-lg shadow-blue-100">
                  {c.flatNo}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-slate-400 leading-none">Resident</span>
                  <span className="text-sm font-black text-slate-800 uppercase tracking-tighter italic">{c.tenantName}</span>
                </div>
              </div>
              
              {/* স্ট্যাটাস চিপ */}
              <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full shadow-sm border ${
                c.status === 'Pending' 
                ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' 
                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}>
                {c.status}
              </span>
            </div>

            {/* অভিযোগের মূল মেসেজ */}
            <div className="space-y-3 flex-1">
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">
                {c.subject}
              </h4>
              <div className="bg-slate-50/50 p-5 rounded-[30px] border border-slate-100 shadow-inner group-hover:bg-white transition-colors">
                <p className="text-slate-600 text-sm font-medium leading-relaxed italic">
                  &quot;{c.message}&quot;
                </p>
              </div>
            </div>

            {/* নিচের টাইমস্ট্যাম্প বা ট্যাগ */}
            <div className="mt-6 pt-5 border-t border-slate-50 flex justify-between items-center">
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                {lang === 'bn' ? 'যাচাইকৃত টিকেট' : 'Verified Ticket'}
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-xs grayscale group-hover:grayscale-0 transition-all">
                🚩
              </div>
            </div>

            {/* গ্লসি ব্যাকগ্রাউন্ড ব্লব */}
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl"></div>
          </div>
        ))}

        {/* ৪. অভিযোগ না থাকলে খালি অবস্থা */}
        {complaints.length === 0 && (
          <div className="col-span-full py-32 text-center bg-slate-50/50 rounded-[50px] border-2 border-dashed border-slate-200">
            <div className="text-4xl mb-4 grayscale opacity-30">📭</div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">
              {lang === 'bn' ? 'বর্তমানে কোনো অভিযোগ নেই' : 'No Active Complaints Found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}