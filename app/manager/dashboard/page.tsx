"use client";
import { useState, useEffect } from "react";
import { dictionary, type Language, type DictionaryContent } from "@/lib/dictionary";
import Stats from "./components/Stats";
import RentTracker from "./components/RentTracker";
import ExpenseManager from "./components/ExpenseManager";
import TenantManager from "./components/TenantManager";
import PrintTemplate from "./components/PrintTemplate";
import BuildingMap from "./components/BuildingMap";

interface Tenant { _id: string; name: string; flatNo: string; rentAmount: number; }
interface Payment { tenantId: string; status: string; amount: number; }
interface Expense { _id: string; description: string; amount: number; type: "Construction" | "Maintenance"; date: string; }

interface AllData {
  tenants: Tenant[];
  payments: Payment[];
  expenses: Expense[];
  income: number;
  expense: number;
}

export default function ManagerDashboard() {
  const [lang, setLang] = useState<Language>("bn");
  const t = dictionary[lang];
  const [activeTab, setActiveTab] = useState<"rent" | "tenant" | "expense" | "map">("rent");
  const [selectedMonth, setSelectedMonth] = useState<keyof DictionaryContent>("jan");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [allData, setAllData] = useState<AllData>({ 
    tenants: [], payments: [], expenses: [], income: 0, expense: 0 
  });

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const fetchFullReport = async () => {
      try {
        const [tRes, pRes, eRes] = await Promise.all([
          fetch("/api/tenants"),
          fetch(`/api/payments?month=${selectedMonth}&year=${selectedYear}`),
          fetch("/api/expenses")
        ]);
        const tenantsJson = await tRes.json();
        const paymentsJson = await pRes.json();
        const expensesJson = await eRes.json();

        if (tenantsJson.success && paymentsJson.success && expensesJson.success) {
          const tenantsList: Tenant[] = tenantsJson.data || [];
          const paymentsList: Payment[] = paymentsJson.data || [];
          const rawExpenses: Expense[] = expensesJson.data || [];

          const filteredExpenses = rawExpenses.filter((e) => {
            const d = new Date(e.date);
            const mList = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
            return mList[d.getMonth()] === selectedMonth && d.getFullYear() === selectedYear;
          });

          const totalInc = paymentsList.filter(p => p.status === "Paid").reduce((acc, curr) => acc + curr.amount, 0);
          const totalExp = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

          setAllData({ 
            tenants: tenantsList, 
            payments: paymentsList, 
            expenses: filteredExpenses,
            income: totalInc,
            expense: totalExp
          });
        }
      } catch (err) { console.error("Report Error:", err); }
    };
    fetchFullReport(); 
  }, [selectedMonth, selectedYear, refreshKey]);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ১. হেডার ও সেটিংস (প্রিন্টে আসবে না) */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[35px] shadow-sm border border-slate-100 gap-4 no-print">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black italic shadow-lg">SM</div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 uppercase italic leading-none">{t.managerPanel}</h1>
              <p className="text-[10px] font-bold text-blue-600 tracking-tighter uppercase mt-1">Sami & Mahi Tower</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value as keyof DictionaryContent)} className="bg-transparent font-black text-[11px] text-blue-600 outline-none px-2 cursor-pointer">
                {["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].map(m => (
                  <option key={m} value={m}>{t[m as keyof DictionaryContent]}</option>
                ))}
              </select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-transparent font-black text-[11px] text-blue-600 outline-none px-2 cursor-pointer border-l">
                {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button onClick={() => setLang(prev => prev === "en" ? "bn" : "en")} className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">{lang === "en" ? "বাংলা" : "English"}</button>
            <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 shadow-lg">🖨️ {t.printReport}</button>
          </div>
        </div>

        {/* ২. প্রিন্ট টেম্পলেট (এটি স্ক্রিনে দেখা যাবে না, শুধু প্রিন্ট হবে) */}
        <PrintTemplate 
          lang={lang} t={dictionary[lang]} month={selectedMonth} year={selectedYear} 
          tenants={allData.tenants} payments={allData.payments} 
          expenses={allData.expenses} income={allData.income} expense={allData.expense} 
        />

        {/* ৩. লাইভ ড্যাশবোর্ড কন্টেন্ট (যা প্রিন্টে আসবে না) */}
        <div className="no-print space-y-10">
          <Stats lang={lang} month={selectedMonth} year={selectedYear} key={refreshKey} />

          {/* ট্যাব বাটন */}
          <div className="flex flex-wrap gap-3 p-2 bg-white/60 backdrop-blur-md rounded-[30px] w-fit border border-slate-100 shadow-sm">
            <TabBtn active={activeTab === "rent"} label={t.rentStatus} onClick={() => setActiveTab("rent")} color="bg-blue-600" />
            <TabBtn active={activeTab === "tenant"} label={t.addTenant} onClick={() => setActiveTab("tenant")} color="bg-emerald-600" />
            <TabBtn active={activeTab === "expense"} label={t.expenseTitle} onClick={() => setActiveTab("expense")} color="bg-red-500" />
                <TabBtn active={activeTab === "map"} label={t.buildingMap} onClick={() => setActiveTab("map")} color="bg-indigo-600" />
          </div>

          {/* ট্যাব অনুযায়ী কন্টেন্ট */}
          <div className="transition-all duration-500 min-h-[400px]">
            {activeTab === "rent" && <RentTracker lang={lang} month={selectedMonth} year={selectedYear} onUpdate={triggerRefresh} />}
            {activeTab === "tenant" && <TenantManager lang={lang} />}
            {activeTab === "map" && <BuildingMap lang={lang} />}
            {activeTab === "expense" && <ExpenseManager lang={lang} month={selectedMonth} year={selectedYear} onUpdate={triggerRefresh} />}
          </div>
        </div>

      </div>
    </div>
  );
}

function TabBtn({ active, label, onClick, color }: { active: boolean, label: string, onClick: () => void, color: string }) {
  return (
    <button onClick={onClick} className={`px-8 py-3.5 rounded-[22px] font-black text-[11px] uppercase tracking-widest transition-all duration-500 ${active ? `${color} text-white shadow-2xl scale-105` : "text-slate-400 hover:text-slate-600 hover:bg-white"}`}>{label}</button>
  );
}