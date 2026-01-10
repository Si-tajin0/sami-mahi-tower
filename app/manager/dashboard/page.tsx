"use client";
import { useState, useEffect } from "react";
import { dictionary, type Language, type DictionaryContent } from "@/lib/dictionary";
import { Tenant, Payment, Expense } from "@/lib/types"; 
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";

// কম্পোনেন্ট ইমপোর্ট
import Stats from "./components/Stats";
import RentTracker from "./components/RentTracker";
import ExpenseManager from "./components/ExpenseManager";
import TenantManager from "./components/TenantManager";
import BuildingMap from "./components/BuildingMap";
import NoticeBoard from "./components/NoticeBoard";
import ManagerComplaints from "./components/ManagerComplaints";
import HandoverMoney from "./components/HandoverMoney";
import PrintTemplate from "./components/PrintTemplate";
import FancyToast from "@/app/components/FancyToast";

interface AllData {
  tenants: Tenant[];
  payments: Payment[];
  expenses: Expense[];
  income: number;
  expense: number;
}

export default function ManagerDashboard() {
  const [lang, setLang] = useState<Language>("bn");
  const t = dictionary[lang] || dictionary['bn'];
  const router = useRouter();

  // ১. স্টেটসমূহ (এখানে 'mounted' যোগ করা হয়েছে)
  const [mounted, setMounted] = useState(false); 
  const [activeTab, setActiveTab] = useState<"rent" | "tenant" | "expense" | "map" | "notice" | "complaint" | "handover">("rent");
  const [selectedMonth, setSelectedMonth] = useState<keyof DictionaryContent>("jan");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [refreshKey, setRefreshKey] = useState(0);
  const [time, setTime] = useState(new Date());
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });
  const [allData, setAllData] = useState<AllData>({ tenants: [], payments: [], expenses: [], income: 0, expense: 0 });

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  const handleLogout = () => {
    Cookies.remove("user-role");
    router.push("/login");
  };

  // মাউন্ট এবং ঘড়ি আপডেট লজিক
  useEffect(() => {
    setMounted(true); // এটি Hydration error ফিক্স করবে
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchFullReport = async () => {
      try {
        const timestamp = new Date().getTime();
        const [tRes, pRes, eRes] = await Promise.all([
          fetch(`/api/tenants?t=${timestamp}`),
          fetch(`/api/payments/all?t=${timestamp}`),
          fetch(`/api/expenses?t=${timestamp}`)
        ]);
        
        const tenantsJson = await tRes.json();
        const paymentsJson = await pRes.json();
        const expensesJson = await eRes.json();

        if (tenantsJson.success && paymentsJson.success && expensesJson.success) {
          const tenantsList = tenantsJson.data as Tenant[];
          const paymentsList = paymentsJson.data as Payment[];
          const rawExpenses = expensesJson.data as Expense[];

          const filteredExpenses = rawExpenses.filter((e) => {
            const d = new Date(e.date);
            const mNames = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
            return mNames[d.getMonth()] === selectedMonth && d.getFullYear() === selectedYear;
          });

          const totalInc = paymentsList
            .filter(p => p.month === selectedMonth && p.year === selectedYear && p.status?.toLowerCase().trim() === "paid")
            .reduce((acc, curr) => acc + (Number(curr.rentAmount) || 0) + (Number(curr.serviceCharge) || 0), 0);

          setAllData({ 
            tenants: tenantsList, payments: paymentsList, expenses: filteredExpenses,
            income: totalInc,
            expense: filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
          });
        }
      } catch (err) { console.error("Report Sync Error:", err); }
    };
    if (mounted) fetchFullReport(); 
  }, [selectedMonth, selectedYear, refreshKey, mounted]);

  return (
    <div className="min-h-screen bg-[#f4f7fe] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* হেডার */}
        <div className="flex flex-col lg:flex-row justify-between items-center bg-white/80 backdrop-blur-md p-6 rounded-[40px] shadow-2xl border border-white gap-6 no-print">
          <div className="flex items-center gap-5">
            <Link href="/" className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-900 rounded-[25px] flex items-center justify-center text-white font-black text-2xl shadow-xl italic rotate-3">SM</Link>
            <div>
              <h1 className="text-xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">{t.managerPanel}</h1>
              <div className="flex items-center gap-2 mt-2 font-bold text-slate-400 text-[10px] uppercase tracking-widest">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                {/* ২. এখানে mounted চেক ব্যবহার করা হয়েছে */}
                {mounted ? (
                  <>
                    {time.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US')} • {time.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                  </>
                ) : "Loading System..."}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-100 shadow-inner">
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value as keyof DictionaryContent)} className="bg-transparent font-black text-xs text-blue-600 outline-none px-3 cursor-pointer">
                {["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].map(m => (
                  <option key={m} value={m}>{t[m as keyof DictionaryContent]}</option>
                ))}
              </select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-transparent font-black text-xs text-blue-700 px-3 border-l border-slate-200 cursor-pointer">
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button onClick={() => setLang(lang === "en" ? "bn" : "en")} className="px-6 py-3 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">{lang === "en" ? "বাংলা" : "English"}</button>
            <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase flex items-center gap-2 shadow-xl hover:bg-blue-700">🖨️ {t.printReport}</button>
            <button onClick={handleLogout} className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-full text-[10px] font-black uppercase">Logout</button>
          </div>
        </div>

        {/* প্রিন্ট টেম্পলেট */}
        <PrintTemplate lang={lang} t={t} month={selectedMonth} year={selectedYear} {...allData} />

        <div className="no-print space-y-10">
          <Stats lang={lang} month={selectedMonth} year={selectedYear} key={refreshKey} />

          <div className="flex flex-wrap gap-4 p-3 bg-white/60 backdrop-blur-md rounded-[40px] w-fit border border-white shadow-2xl shadow-blue-900/5">
            <TabBtn active={activeTab === "rent"} label={t.rentStatus} icon="📅" onClick={() => setActiveTab("rent")} color="bg-blue-600 shadow-blue-200" />
            <TabBtn active={activeTab === "tenant"} label={t.addTenant} icon="👤" onClick={() => setActiveTab("tenant")} color="bg-emerald-600 shadow-emerald-200" />
            <TabBtn active={activeTab === "expense"} label={t.expenseTitle} icon="💸" onClick={() => setActiveTab("expense")} color="bg-rose-500 shadow-rose-200" />
            <TabBtn active={activeTab === "map"} label={t.buildingMap} icon="🗺️" onClick={() => setActiveTab("map")} color="bg-indigo-600 shadow-indigo-200" />
            <TabBtn active={activeTab === "notice"} label={t.noticeBoard} icon="📣" onClick={() => setActiveTab("notice")} color="bg-orange-500 shadow-orange-200" />
            <TabBtn active={activeTab === "complaint"} label="অভিযোগ" icon="🚨" onClick={() => setActiveTab("complaint")} color="bg-red-600 shadow-red-200" />
            <TabBtn active={activeTab === "handover"} label={t.handoverMoney} icon="💰" onClick={() => setActiveTab("handover")} color="bg-purple-600 shadow-purple-200" />
          </div>

          <div className="transition-all duration-700 min-h-[500px]">
            {activeTab === "rent" && <RentTracker lang={lang} month={selectedMonth} year={selectedYear} onUpdate={triggerRefresh} />}
            {activeTab === "tenant" && <TenantManager lang={lang} showNotification={(m, ty)=>setToast({show:true, message:m, type:ty||'success'})} />}
            {activeTab === "map" && <BuildingMap lang={lang} />}
            {activeTab === "expense" && <ExpenseManager lang={lang} month={selectedMonth} year={selectedYear} onUpdate={triggerRefresh} showNotification={(m, ty)=>setToast({show:true, message:m, type:ty||'success'})} />}
            {activeTab === "notice" && <NoticeBoard lang={lang} showNotification={(m, ty)=>setToast({show:true, message:m, type:ty||'success'})} />}
            {activeTab === "complaint" && <ManagerComplaints lang={lang} onUpdate={triggerRefresh} showNotification={(m, ty)=>setToast({show:true, message:m, type:ty||'success'})} />}
            {activeTab === "handover" && <HandoverMoney lang={lang} onUpdate={triggerRefresh} showNotification={(m, ty)=>setToast({show:true, message:m, type:ty||'success'})} />}
          </div>
        </div>

        {toast.show && <FancyToast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      </div>
    </div>
  );
}

function TabBtn({ active, label, icon, onClick, color }: { active: boolean, label: string, icon: string, onClick: () => void, color: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 px-8 py-4 rounded-[25px] font-black text-[11px] uppercase tracking-widest transition-all duration-500 ${active ? `${color} text-white shadow-2xl scale-105 -translate-y-1` : "text-slate-400 hover:text-slate-600 hover:bg-white"}`}>
      <span className={`text-base ${active ? 'opacity-100' : 'opacity-30'}`}>{icon}</span>
      {label}
    </button>
  );
}