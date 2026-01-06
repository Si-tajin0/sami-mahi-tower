"use client";
import { useState, useEffect } from "react";
import { dictionary, type Language, type DictionaryContent } from "@/lib/dictionary";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,} from 'recharts';

// টাইপ ইন্টারফেসসমূহ
interface Tenant { _id: string; name: string; phone: string; nid: string; flatNo: string; rentAmount: number; tenantId: string; joinedDate: string; occupation: string; securityDeposit: number; }
interface Log { _id: string; action: string; details: string; createdAt: string; }
interface Payment { _id: string; tenantId: Tenant | null; month: string; year: number; amount: number; status: string; }
interface Expense { _id: string; description: string; amount: number; type: string; date: string; }

interface OwnerData { 
  stats: { totalIncome: number; totalConstruction: number; totalMaintenance: number; netBalance: number; };
  tenants: Tenant[]; payments: Payment[]; expenses: Expense[]; 
}

export default function OwnerDashboard() {
  const [lang, setLang] = useState<Language>("bn");
  const t = dictionary[lang];
  const [data, setData] = useState<OwnerData | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("jan");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [summaryRes, logsRes] = await Promise.all([
          fetch("/api/owner/summary"),
          fetch("/api/logs")
        ]);
        const summaryJson = await summaryRes.json();
        const logsJson = await logsRes.json();
        if (summaryJson.success) setData(summaryJson.data);
        if (logsJson.success) setLogs(logsJson.data);
      } catch (err) { console.error("Error loading data:", err); }
    };
    fetchAll();
  }, []);

  if (!data) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const formatNum = (num: number) => `৳ ${num.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`;

  // মাসিক ফিল্টার ডাটা
  const monthlyPayments = data.payments.filter(p => p.month === selectedMonth && p.year === selectedYear);
  const monthlyExpenses = data.expenses.filter(e => {
    const d = new Date(e.date);
    const mList = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
    return mList[d.getMonth()] === selectedMonth && d.getFullYear() === selectedYear;
  });

  const monthlyIncome = monthlyPayments.filter(p => p.status === "Paid").reduce((a, c) => a + c.amount, 0);
  const monthlyExpenseTotal = monthlyExpenses.reduce((a, c) => a + c.amount, 0);

  // গ্রাফের জন্য ডাটা তৈরি করা (জানুয়ারি থেকে ডিসেম্বর)
  const chartData = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"].map(m => {
    const inc = data.payments.filter(p => p.month === m && p.year === selectedYear && p.status === "Paid").reduce((a, c) => a + c.amount, 0);
    const exp = data.expenses.filter(e => {
      const d = new Date(e.date);
      return ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"][d.getMonth()] === m && d.getFullYear() === selectedYear;
    }).reduce((a, c) => a + c.amount, 0);
    
    return { name: t[m as keyof DictionaryContent], [t.monthlyIncome]: inc, [t.monthlyExpense]: exp };
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans p-4 md:p-10 selection:bg-blue-100">
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* হেডার */}
        <header className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-blue-900/5 p-8 rounded-[45px] flex flex-col lg:flex-row justify-between items-center gap-6 no-print">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-xl italic">SM</div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-800 italic">{t.ownerPanel}</h1>
              <p className="text-blue-600 font-bold text-[10px] tracking-[0.3em] uppercase mt-1 leading-none">Financial Performance Dashboard</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex bg-slate-50 p-2 rounded-2xl border border-slate-200">
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent font-black text-xs text-blue-700 px-3 outline-none cursor-pointer">
                {["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].map(m => <option key={m} value={m}>{t[m as keyof DictionaryContent]}</option>)}
              </select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-transparent font-black text-xs text-blue-700 px-3 outline-none border-l border-slate-200">
                {[2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button onClick={() => setLang(lang === "en" ? "bn" : "en")} className="bg-slate-900 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">
              {lang === "en" ? "বাংলা" : "English"}
            </button>
          </div>
        </header>

        {/* এরর ফিক্স: এখানে monthlyIncome এবং monthlyExpenseTotal ব্যবহার করা হয়েছে */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
           <div className="bg-white p-8 rounded-[40px] shadow-xl border-l-[12px] border-emerald-500">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{t.monthlyIncome}</p>
              <h3 className="text-3xl font-black text-emerald-600">{formatNum(monthlyIncome)}</h3>
              <p className="text-[9px] font-bold text-slate-400 mt-1">{t[selectedMonth as keyof DictionaryContent]} {selectedYear}</p>
           </div>
           <div className="bg-white p-8 rounded-[40px] shadow-xl border-l-[12px] border-rose-500">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{t.monthlyExpense}</p>
              <h3 className="text-3xl font-black text-rose-600">{formatNum(monthlyExpenseTotal)}</h3>
              <p className="text-[9px] font-bold text-slate-400 mt-1">{t[selectedMonth as keyof DictionaryContent]} {selectedYear}</p>
           </div>
           <div className="bg-blue-600 p-8 rounded-[40px] shadow-xl text-white">
              <p className="text-[10px] font-black uppercase opacity-60 mb-1">{t.totalBalance}</p>
              <h3 className="text-3xl font-black">{formatNum(monthlyIncome - monthlyExpenseTotal)}</h3>
              <p className="text-[9px] font-bold opacity-60 mt-1 tracking-widest uppercase">Net Profit Margin</p>
           </div>
        </div>

        {/* ৭. গ্রাফ সেকশন (Financial Trends) */}
        <div className="bg-white p-10 rounded-[60px] shadow-2xl shadow-blue-900/5 border border-white no-print">
          <div className="flex justify-between items-center mb-10 px-4">
             <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800">{selectedYear} আর্থিক পারফরম্যান্স গ্রাফ</h3>
             <div className="flex gap-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase"><span className="w-3 h-3 bg-blue-500 rounded-sm"></span> {t.monthlyIncome}</div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase"><span className="w-3 h-3 bg-rose-400 rounded-sm"></span> {t.monthlyExpense}</div>
             </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                <Bar dataKey={t.monthlyIncome} fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={25} />
                <Bar dataKey={t.monthlyExpense} fill="#fb7185" radius={[10, 10, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ৮. ম্যানেজার অডিট এবং ট্রানজেকশন আগের মতোই থাকবে... */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 no-print">
           <div className="xl:col-span-4 bg-white p-8 rounded-[50px] shadow-xl border border-white max-h-[600px] overflow-y-auto">
              <h3 className="text-xs font-black uppercase text-slate-400 mb-8 flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> ম্যানেজার অ্যাক্টিভিটি টাইমলাইন
              </h3>
              <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                {logs.map((log) => (
                  <div key={log._id} className="relative pl-10 group">
                    <div className="absolute left-[13px] top-2 w-1.5 h-1.5 bg-blue-600 rounded-full ring-4 ring-white"></div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">{new Date(log.createdAt).toLocaleString('bn-BD')}</p>
                    <p className="text-slate-800 text-xs font-bold mt-1 uppercase">{log.action}</p>
                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">{log.details}</p>
                  </div>
                ))}
              </div>
           </div>

           <div className="xl:col-span-8 bg-white p-10 rounded-[50px] shadow-xl border border-white">
              <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800 mb-10">
                {t[selectedMonth as keyof DictionaryContent]} {selectedYear} এর লেনদেন (Date-wise Details)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-emerald-500 border-b pb-2 tracking-widest">ভাড়া আদায় রিপোর্ট</p>
                    {monthlyPayments.map((p) => (
                       <div key={p._id} onClick={() => p.tenantId && setSelectedTenant(p.tenantId)} className="flex justify-between items-center p-5 bg-slate-50 rounded-[30px] hover:bg-white hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-emerald-100">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-blue-600 text-[10px] shadow-sm">{p.tenantId?.flatNo || "?"}</div>
                             <p className="font-black text-slate-800 text-xs">{p.tenantId?.name || "Unknown"}</p>
                          </div>
                          <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${p.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{p.status}</span>
                       </div>
                    ))}
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-rose-500 border-b pb-2 tracking-widest">ব্যয়ের বিস্তারিত</p>
                    {monthlyExpenses.map((e) => (
                       <div key={e._id} className="flex justify-between items-center p-5 bg-slate-50 rounded-[30px] hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-rose-100">
                          <p className="font-black text-slate-800 text-xs">{e.description}</p>
                          <p className="font-black text-rose-600 text-xs">{formatNum(e.amount)}</p>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* ৯. ভাড়াটিয়া প্রোফাইল মোডাল (আগের মতোই থাকবে কিন্তু safe check সহ) */}
        {selectedTenant && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
            <div className="bg-white w-full max-w-4xl rounded-[60px] shadow-2xl border border-white overflow-hidden animate-in zoom-in-95">
               <div className="bg-gradient-to-r from-blue-700 to-indigo-900 p-12 text-white flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Executive Access</span>
                    <h3 className="text-5xl font-black uppercase tracking-tighter mt-2">{selectedTenant.name}</h3>
                  </div>
                  <button onClick={() => setSelectedTenant(null)} className="w-12 h-12 bg-white/10 hover:bg-white hover:text-blue-900 rounded-full flex items-center justify-center text-xl transition-all font-light">✕</button>
               </div>
               <div className="p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 text-slate-800">
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 border-b pb-2">Tenant Master Record</h4>
                     <p><b>Phone:</b> {selectedTenant.phone}</p>
                     <p><b>NID:</b> {selectedTenant.nid}</p>
                     <p><b>Flat No:</b> {selectedTenant.flatNo}</p>
                     <p><b>Monthly Rent:</b> {formatNum(selectedTenant.rentAmount)}</p>
                  </div>
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-4">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 border-b pb-2">Full Payment History</h4>
                     {data.payments.filter(p => p.tenantId && p.tenantId._id === selectedTenant._id).map((p, i) => (
                        <div key={i} className="flex justify-between p-3 bg-slate-50 rounded-xl mb-2 text-xs font-bold uppercase">
                           <span>{t[p.month as keyof DictionaryContent]} {p.year}</span>
                           <span className={p.status === 'Paid' ? 'text-green-600' : 'text-red-500'}>{p.status}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}