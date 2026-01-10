"use client";
import { DictionaryContent, type Language } from "@/lib/dictionary";
import { Tenant, Payment, Expense } from "@/lib/types"; 

// ১. টাইপ ইন্টারফেসসমূহ (মালিকের ভিউ অনুযায়ী আপডেট করা হয়েছে)
interface LedgerProps {
  t: DictionaryContent;
  payments: Payment[];
  expenses: Expense[];
  onTenantClick: (tenant: Tenant) => void;
  lang: Language;
}



export default function OwnerLedger({ t, payments, expenses, onTenantClick, lang }: LedgerProps) {
  
  // সংখ্যা ফরম্যাট করার নিরাপদ ফাংশন
  const formatNum = (num: number) => 
    `৳ ${num.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`;

  return (
    <div className="bg-white p-6 md:p-10 rounded-[50px] shadow-2xl shadow-blue-900/5 border border-white">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        
        {/* ১. আয়ের বিস্তারিত (Rent & Service Charge) */}
        <div className="space-y-6">
           <div className="flex items-center justify-between border-b-2 border-emerald-50 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <p className="text-xs font-black uppercase text-emerald-600 tracking-widest">{t.rentDetails}</p>
              </div>
              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">
                {payments.length} {lang === 'bn' ? 'টি লেনদেন' : 'Records'}
              </span>
           </div>
           
           <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {payments.map((p) => {
                 // ডাটাবেসে rentAmount না থাকলে পুরনো amount ফিল্ড ব্যবহার করবে
                 const rentVal = Number(p.rentAmount || p.amount || 0);
                 const scVal = Number(p.serviceCharge || 0);
                 const total = rentVal + scVal;

                 return (
                    <div 
                      key={p._id} 
                      // কার্ডে ক্লিক করলে ভাড়াটিয়ার প্রোফাইল খুলবে
                      onClick={() => p.tenantId && onTenantClick(p.tenantId)} 
                      className="flex justify-between items-center p-5 bg-slate-50/50 rounded-[35px] border border-transparent hover:border-blue-300 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    >
                       <div className="flex items-center gap-4">
                          {/* ফ্ল্যাট নম্বর বক্স */}
                          <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center font-black text-blue-600 shadow-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                             {p.tenantId?.flatNo || "?"}
                          </div>
                          <div>
                             {/* ভাড়াটিয়ার নাম ও আইডি */}
                             <p className="font-black text-slate-800 text-sm uppercase leading-tight group-hover:text-blue-600 transition-colors">
                                {p.tenantId?.name || "Unknown"}
                             </p>
                             <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${p.method === 'Online' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                   {p.method === 'Online' ? '📱 Online' : '💵 Cash'}
                                </span>
                                <span className="text-[7px] font-bold text-blue-500 uppercase">
                                   ID: #{p.tenantId?.tenantId || "---"}
                                </span>
                             </div>
                          </div>
                       </div>

                       <div className="text-right">
                          <p className="font-black text-slate-900 text-sm">{formatNum(total)}</p>
                          <div className="flex flex-col items-end">
                            <span className="text-[7px] font-bold text-slate-400 uppercase">
                               SC: {formatNum(scVal)}
                            </span>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md mt-1 ${p.status?.toLowerCase() === 'paid' ? 'bg-emerald-500 text-white' : 'bg-rose-100 text-rose-500'}`}>
                               {p.status?.toLowerCase() === 'paid' ? t.paid : t.unpaid}
                            </span>
                          </div>
                       </div>
                    </div>
                 );
              })}
              {payments.length === 0 && (
                <p className="py-10 text-center text-slate-300 font-bold text-xs italic uppercase tracking-widest">No income records found</p>
              )}
           </div>
        </div>

        {/* ২. ব্যয়ের বিস্তারিত (Expenses) */}
        <div className="space-y-6">
           <div className="flex items-center justify-between border-b-2 border-rose-50 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📉</span>
                <p className="text-xs font-black uppercase text-rose-500 tracking-widest">{t.expenseDetails}</p>
              </div>
              <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">
                {expenses.length} {lang === 'bn' ? 'টি খরচ' : 'Expenses'}
              </span>
           </div>

           <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {expenses.map((e) => (
                 <div key={e._id} className="flex justify-between items-center p-5 bg-slate-50/50 rounded-[35px] border border-transparent hover:border-rose-200 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm border border-slate-50">💸</div>
                       <div>
                          <p className="font-black text-slate-800 text-sm uppercase group-hover:text-rose-600 transition-colors leading-tight">{e.description}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                             {new Date(e.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                          </p>
                       </div>
                    </div>
                    <p className="font-black text-rose-600 text-sm">{formatNum(Number(e.amount))}</p>
                 </div>
              ))}
              {expenses.length === 0 && (
                <p className="py-10 text-center text-slate-300 font-bold text-xs italic uppercase tracking-widest">No expense records found</p>
              )}
           </div>
        </div>

      </div>
    </div>
  );
}