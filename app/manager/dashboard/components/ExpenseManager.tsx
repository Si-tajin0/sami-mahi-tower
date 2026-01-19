"use client";
import { useState, useEffect, useMemo } from "react";
import { dictionary, type Language, type DictionaryContent } from "@/lib/dictionary";

// ১. টাইপ আপডেট করা হয়েছে (Salary যুক্ত করা হয়েছে)
interface Expense { 
  _id: string; 
  description: string; 
  amount: number; 
  type: "Construction" | "Maintenance" | "Salary"; 
  date: string; 
}

interface ExpenseProps { 
  lang: Language; 
  month: keyof DictionaryContent;
  year: number;
  onUpdate: () => void; 
  showNotification: (msg: string, type?: "success" | "error") => void;
}

export default function ExpenseManager({ lang, month, year, onUpdate, showNotification }: ExpenseProps) {
  const t = dictionary[lang];
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    description: "", 
    amount: "", 
    type: "Maintenance" as Expense["type"] // ডিফল্ট টাইপ নির্ধারণ
  });

  const fetchExpenses = async (): Promise<void> => {
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      if (data.success) {
        const allExpenses: Expense[] = data.data;
        const filtered = allExpenses.filter(e => {
          const d = new Date(e.date);
          const mList = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
          return mList[d.getMonth()] === month && d.getFullYear() === year;
        });
        setExpenses(filtered);
      }
    } catch (err) {
      console.error("Fetch expenses error:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [month, year]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount)
        }),
      });
      if (res.ok) {
        setFormData({ description: "", amount: "", type: "Maintenance" });
        fetchExpenses();
        onUpdate();
        showNotification(lang === "bn" ? "খরচ সফলভাবে এন্ট্রি হয়েছে!" : "Expense Recorded!", "success");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error!", "error");
    } finally {
      setLoading(false);
    }
  };

  // ওই মাসের মোট খরচ হিসাব
  const totalMonthlyExpense = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  const formatCurrency = (num: number) => `৳ ${num.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* সামারি বার */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-[35px] text-white flex justify-between items-center shadow-xl border border-white/10">
        <div>
          <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em]">{t.expenseList}</p>
          <h3 className="text-xl font-black uppercase italic tracking-tighter">{t[month]} {year}</h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em]">Total Spent</p>
          <h3 className="text-2xl font-black text-rose-400 tracking-tighter">
            {formatCurrency(totalMonthlyExpense)}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ফর্ম অংশ */}
        <div className="bg-white p-10 rounded-[50px] shadow-2xl border border-slate-100 h-fit no-print">
          <h2 className="text-2xl font-black text-slate-800 mb-8 uppercase italic tracking-tighter">{t.expenseTitle}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-widest">Category</label>
              <select 
                className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[30px] outline-none font-bold text-sm focus:border-blue-500 transition-all shadow-inner"
                value={formData.type} 
                onChange={(e) => setFormData({...formData, type: e.target.value as Expense["type"]})}
              >
                <option value="Maintenance">{t.maintenance}</option>
                <option value="Construction">{t.construction}</option>
                <option value="Salary">{lang === 'bn' ? "বেতন (Salary)" : "Staff Salary"}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-widest">{t.expenseDesc}</label>
              <input type="text" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[30px] outline-none font-bold text-sm focus:border-blue-500 transition-all shadow-inner" value={formData.description} onChange={(e)=>setFormData({...formData, description:e.target.value})} placeholder="e.g. Electric Bill or Staff Name" required />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-widest">{t.amount}</label>
              <input type="number" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[30px] outline-none font-bold text-lg focus:border-blue-500 transition-all shadow-inner" value={formData.amount} onChange={(e)=>setFormData({...formData, amount:e.target.value})} placeholder="0.00" required />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-slate-950 text-white py-6 rounded-[30px] font-black uppercase text-xs shadow-2xl hover:bg-blue-600 transition-all border-b-8 border-black active:scale-95">
              {loading ? "..." : t.saveBtn}
            </button>
          </form>
        </div>

        {/* ইতিহাস টেবিল */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[60px] shadow-2xl border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">
                  <th className="px-6 pb-2">Category</th>
                  <th className="pb-2">Details</th>
                  <th className="text-right pb-2 px-6">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp._id} className="bg-slate-50/50 hover:bg-white hover:shadow-2xl transition-all duration-300 group">
                    <td className="py-6 px-6 rounded-l-[35px]">
                      <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full shadow-sm border 
                        ${exp.type === 'Salary' ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                          exp.type === 'Construction' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                          'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {exp.type}
                      </span>
                    </td>
                    <td className="py-6 font-black text-slate-800 uppercase tracking-tighter italic text-sm">{exp.description}</td>
                    <td className="py-6 px-6 rounded-r-[35px] text-right font-black text-slate-900 text-base italic">
                      {formatCurrency(exp.amount)}
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-20 text-center text-slate-300 font-black uppercase tracking-widest italic opacity-40">No expense records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}