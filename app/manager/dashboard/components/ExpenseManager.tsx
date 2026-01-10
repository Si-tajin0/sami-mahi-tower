"use client";
import { useState, useEffect } from "react";
import { dictionary, type Language, type DictionaryContent } from "@/lib/dictionary";

interface Expense { 
  _id: string; 
  description: string; 
  amount: number; 
  type: "Construction" | "Maintenance"; 
  date: string; 
}

interface ExpenseProps { 
  lang: Language; 
  month: keyof DictionaryContent;
  year: number;
  onUpdate: () => void; 
  showNotification: (msg: string, type?: "success" | "error") => void; // এই লাইনটি যোগ করুন
}

interface ExpenseProps { 
  lang: Language; 
  month: keyof DictionaryContent;
  year: number;
  onUpdate: () => void; 
}

export default function ExpenseManager({ lang, month, year, onUpdate, showNotification }: ExpenseProps) {
  const t = dictionary[lang];
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [formData, setFormData] = useState({ 
    description: "", 
    amount: "", 
    type: "Maintenance" as "Construction" | "Maintenance" 
  });

  const fetchExpenses = async (): Promise<void> => {
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      if (data.success) {
        // সব খরচ এনে এখানে ফিল্টার করা হচ্ছে
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
  }, [month, year]); // মাস বা বছর পরিবর্তন হলে অটোমেটিক আপডেট হবে

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ description: "", amount: "", type: "Maintenance" });
        fetchExpenses();
        onUpdate();
        showNotification(lang === "bn" ? "খরচ সেভ হয়েছে!" : "Expense Saved!", "success");
      }
    } catch (err) {
      console.error("Save error:", err);
      showNotification("Error!", "error");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* ফর্ম অংশ - প্রিন্টে আসবে না */}
      <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 h-fit no-print">
        <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tighter">{t.expenseTitle}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select 
            className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm"
            value={formData.type} 
            onChange={(e) => setFormData({...formData, type: e.target.value as "Construction" | "Maintenance"})}
          >
            <option value="Maintenance">{t.maintenance}</option>
            <option value="Construction">{t.construction}</option>
          </select>
          <input type="text" placeholder={t.expenseDesc} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" value={formData.description} onChange={(e)=>setFormData({...formData, description:e.target.value})} required />
          <input type="number" placeholder={t.amount} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" value={formData.amount} onChange={(e)=>setFormData({...formData, amount:e.target.value})} required />
          <button type="submit" className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase shadow-xl hover:bg-red-600 transition-all">{t.saveBtn}</button>
        </form>
      </div>

      {/* ইতিহাস টেবিল - এটি প্রিন্ট হবে */}
      <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
        <h2 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tighter">
          {t.expenseList} - <span className="text-red-500">{t[month]} {year}</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <th className="px-6">Type</th>
                <th>Description</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp._id} className="bg-slate-50/50 hover:bg-white transition-all">
                  <td className="py-5 px-6 rounded-l-[25px]">
                    <span className="text-[9px] font-black uppercase bg-white px-3 py-1 rounded-full border border-slate-100 text-slate-400">{exp.type}</span>
                  </td>
                  <td className="py-5 font-bold text-slate-700">{exp.description}</td>
                  <td className="py-5 px-6 rounded-r-[25px] text-right font-black text-slate-900">৳ {exp.amount.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}