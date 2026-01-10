"use client";
import { useState, useEffect } from "react";
import { dictionary, type Language } from "@/lib/dictionary";
import { Handover, Tenant, Payment, Expense } from "@/lib/types";

interface HandoverProps {
  lang: Language;
  onUpdate: () => void;
  showNotification: (msg: string, type?: "success" | "error") => void;
}

export default function HandoverMoney({ lang, onUpdate, showNotification }: HandoverProps) {
  const t = dictionary[lang] || dictionary['bn'];
  const [amount, setAmount] = useState<string>("");
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  
  const [balanceDetails, setBalanceDetails] = useState({
    totalIncome: 0, totalExpenses: 0, totalConfirmed: 0, currentBalance: 0, pendingAmount: 0
  });

  const fetchData = async (): Promise<void> => {
    try {
      const timestamp = new Date().getTime();
      const [hRes, tRes, pRes, eRes] = await Promise.all([
        fetch(`/api/handover?t=${timestamp}`),
        fetch(`/api/tenants?t=${timestamp}`),
        fetch(`/api/payments/all?t=${timestamp}`),
        fetch(`/api/expenses?t=${timestamp}`)
      ]);

      const hData = hRes.ok ? await hRes.json() : { success: false, data: [] };
      const tData = tRes.ok ? await tRes.json() : { success: false, data: [] };
      const pData = pRes.ok ? await pRes.json() : { success: false, data: [] };
      const eData = eRes.ok ? await eRes.json() : { success: false, data: [] };

      if (hData.success && tData.success && pData.success && eData.success) {
        const handoversList = hData.data as Handover[];
        const tenantsList = tData.data as Tenant[];
        const paymentsList = pData.data as Payment[];
        const expensesList = eData.data as Expense[];

        setHandovers(handoversList);

        // ১. মোট আয় (সব ভাড়া + ডিপোজিট)
        const totalPaidRevenue = paymentsList
          .filter(p => p.status?.toLowerCase().trim() === "paid")
          .reduce((acc, curr) => acc + (Number(curr.rentAmount) || Number(curr.amount) || 0) + (Number(curr.serviceCharge) || 0), 0);
        
        const totalDeposits = tenantsList.reduce((acc, curr) => acc + (Number(curr.securityDeposit) || 0), 0);
        const grossIncome = totalPaidRevenue + totalDeposits;

        // ২. মোট সব ধরণের খরচ (Salary, Bill, Repair ইত্যাদি)
        const totalAllExpenses = expensesList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        // ৩. মালিককে দেওয়া কনফার্মড টাকা
        const totalConfirmed = handoversList
          .filter(h => h.status === "Confirmed")
          .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        // ৪. পেন্ডিং টাকা (যা এখনো ক্যাশ থেকে কমবে না)
        const totalPending = handoversList
          .filter(h => h.status === "Pending")
          .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        // ৫. নিট ব্যালেন্স লজিক: আয় - ব্যয় - শুধুমাত্র কনফার্মড টাকা
        const netBalance = grossIncome - totalAllExpenses - totalConfirmed;

        setBalanceDetails({
          totalIncome: grossIncome,
          totalExpenses: totalAllExpenses,
          totalConfirmed: totalConfirmed,
          currentBalance: netBalance,
          pendingAmount: totalPending
        });
      }
    } catch (err) { console.error("Handover Fetch Error:", err); }
  };

  useEffect(() => { 
    setMounted(true);
    fetchData(); 
  }, []);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const handoverAmount = Number(amount);
    if (handoverAmount <= 0) return;

    if (handoverAmount > balanceDetails.currentBalance) {
      showNotification(lang === 'bn' ? "পর্যাপ্ত ব্যালেন্স নেই" : "Insufficient balance", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/handover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: handoverAmount, note: "Manager Handover" })
      });
      if (res.ok) {
        setAmount("");
        await fetchData();
        onUpdate();
        showNotification(lang === 'bn' ? "রিকোয়েস্ট পাঠানো হয়েছে" : "Request sent", "success");
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const formatNum = (num: number) => `৳ ${num.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* ১. ক্যাশ স্ট্যাটাস কার্ড (Premium Glass Effect) */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 p-10 rounded-[60px] text-white shadow-2xl relative overflow-hidden group border-4 border-white/10">
        <div className="absolute top-0 right-0 p-12 opacity-10 font-black text-9xl italic rotate-6">SM</div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.4em] mb-2">{t.cashWithManager}</p>
            <h2 className="text-6xl font-black tracking-tighter italic leading-none">{formatNum(balanceDetails.currentBalance)}</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                Live Cash in Hand
              </span>
              {balanceDetails.pendingAmount > 0 && (
                <span className="px-4 py-1.5 bg-orange-500/20 text-orange-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-500/30 animate-pulse">
                  {formatNum(balanceDetails.pendingAmount)} Pending Confirmation
                </span>
              )}
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-[40px] p-8 border border-white/10 space-y-4">
             <div className="flex justify-between items-center border-b border-white/5 pb-2 text-[11px] font-bold">
                <span className="opacity-60 uppercase tracking-widest">Gross Collection (+)</span>
                <span>{formatNum(balanceDetails.totalIncome)}</span>
             </div>
             <div className="flex justify-between items-center border-b border-white/5 pb-2 text-[11px] font-bold text-rose-300">
                <span className="opacity-60 uppercase tracking-widest">Total Expenses (-)</span>
                <span>{formatNum(balanceDetails.totalExpenses)}</span>
             </div>
             <div className="flex justify-between items-center text-[11px] font-bold text-blue-300">
                <span className="opacity-60 uppercase tracking-widest">Owner Confirmed (-)</span>
                <span>{formatNum(balanceDetails.totalConfirmed)}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ২. টাকা পাঠানোর ফরম */}
        <div className="lg:col-span-4 bg-white p-10 rounded-[50px] shadow-xl border border-slate-100 h-fit">
          <h3 className="text-xl font-black text-slate-800 mb-8 uppercase italic tracking-tighter">{t.handoverMoney}</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 ml-5 uppercase tracking-widest">Amount to Handover</label>
                <input 
                  type="number" placeholder="0.00"
                  className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[30px] outline-none font-black text-slate-800 text-xl focus:border-blue-600 focus:bg-white transition-all shadow-inner" 
                  value={amount} onChange={(e) => setAmount(e.target.value)} required 
                />
             </div>
             <button disabled={loading} className="w-full bg-slate-950 text-white py-5 rounded-[30px] font-black uppercase text-xs shadow-xl hover:bg-blue-700 transition-all border-b-8 border-black active:scale-95">
               {loading ? "..." : "Send to Owner"}
             </button>
          </form>
        </div>

        {/* ৩. হ্যান্ডওভার হিস্ট্রি (Premium Glass items) */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[50px] shadow-xl border border-slate-100">
          <h3 className="text-xl font-black text-slate-800 mb-8 uppercase italic tracking-tighter">{t.handoverHistory}</h3>
          <div className="space-y-4">
            {handovers.map((h) => (
              <div key={h._id} className={`flex justify-between items-center p-6 rounded-[35px] border-2 transition-all duration-300 ${h.status === 'Pending' ? 'bg-orange-50/50 border-orange-100' : 'bg-slate-50 border-transparent hover:bg-white hover:shadow-xl'}`}>
                <div className="flex items-center gap-5">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${h.status === 'Confirmed' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white animate-pulse'}`}>
                      {h.status === 'Confirmed' ? '✅' : '⏳'}
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date(h.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                      </p>
                      <p className="font-black text-slate-800 text-sm mt-1 uppercase italic tracking-tighter">
                        {h.status === 'Confirmed' ? 'Received by Owner' : 'Pending Confirmation'}
                      </p>
                   </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900 text-lg tracking-tighter">{formatNum(h.amount)}</p>
                  <span className={`text-[8px] font-black uppercase px-4 py-1.5 rounded-full mt-2 inline-block ${h.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600 animate-pulse'}`}>
                    {h.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}