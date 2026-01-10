"use client";
import { useState, useEffect } from "react";
import { dictionary, type Language, type DictionaryContent } from "@/lib/dictionary";
import { Tenant, Log, Payment, Expense, OwnerData, Complaint, Handover } from "@/lib/types";
import OwnerStats from "./components/OwnerStats";
import OwnerCharts from "./components/OwnerCharts";
import OwnerAuditLog from "./components/OwnerAuditLog";
import OwnerLedger from "./components/OwnerLedger";
import ComplaintList from "./components/ComplaintList";
import TenantDetailModal from "./components/TenantDetailModal";
import HandoverTracker from "./components/HandoverTracker";
import PrintTemplate from "@/app/manager/dashboard/components/PrintTemplate";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import OwnerHeader from "./components/OwnerHeader";

interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

interface OwnerDataFull extends OwnerData {
  handovers: Handover[];
  stats: { 
    totalRentIncome: number; 
    totalServiceCharge: number; 
    totalConstruction: number; 
    totalMaintenance: number; 
    totalSecurityDeposit: number; 
    netBalance: number; 
  };
}

export default function OwnerDashboard() {
  const [lang, setLang] = useState<Language>("bn");
  const t = dictionary[lang];
  const router = useRouter();

  const [data, setData] = useState<OwnerDataFull | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<keyof DictionaryContent>("jan");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [mounted, setMounted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const monthList: (keyof DictionaryContent)[] = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

  const handleLogout = () => { 
    Cookies.remove("user-role"); 
    Cookies.remove("user-id");
    router.push("/login"); 
  };

  const fetchAll = async () => {
    try {
      const timestamp = new Date().getTime();
      const [sumRes, logRes, comRes, handRes] = await Promise.all([
        fetch(`/api/owner/summary?t=${timestamp}`), 
        fetch(`/api/logs?t=${timestamp}`), 
        fetch(`/api/complaints?t=${timestamp}`),
        fetch(`/api/handover?t=${timestamp}`)
      ]);

      const d1 = await sumRes.json(); 
      const d2 = await logRes.json(); 
      const d3 = await comRes.json();
      const d4 = await handRes.json();
      
      if (d1.success) {
        const updatedData = {
          ...d1.data,
          handovers: d4.success ? d4.data : []
        };
        setData(updatedData as OwnerDataFull);
      }
      if (d2.success) setLogs(d2.data as Log[]);
      if (d3.success) setComplaints(d3.data as Complaint[]);
    } catch (err) { 
      console.error("Owner Sync Error:", err); 
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchAll();
  }, [selectedMonth, selectedYear, refreshKey]);

  if (!mounted || !data) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-blue-600 uppercase tracking-widest animate-pulse">SAMI & MAHI TOWER • SECURE SYNC</p>
      </div>
    </div>
  );

  const formatNum = (num: number) => `৳ ${num.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`;

  // ক্যালকুলেশন লজিক
  const monthlyPayments = data.payments.filter(p => p.month === selectedMonth && p.year === selectedYear);
  const mRentIncome = monthlyPayments.filter(p => p.status?.toLowerCase().trim() === "paid").reduce((acc: number, curr: Payment) => acc + (Number(curr.rentAmount) || Number(curr.amount) || 0), 0);
  const mServiceCharge = monthlyPayments.filter(p => p.status?.toLowerCase().trim() === "paid").reduce((acc: number, curr: Payment) => acc + (Number(curr.serviceCharge) || 0), 0);
  
  const monthlyExpenses = data.expenses.filter((e: Expense) => {
    const d = new Date(e.date);
    const mNames = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
    return mNames[d.getMonth()] === selectedMonth && d.getFullYear() === selectedYear;
  });
  const mExpenseTotal = monthlyExpenses.reduce((acc: number, curr: Expense) => acc + Number(curr.amount || 0), 0);

  // ব্যাংক ও ক্যাশ লজিক (Updated)
  const totalConfirmedHandover = (data.handovers || [])
    .filter(h => h.status === "Confirmed")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalPendingHandover = (data.handovers || [])
    .filter(h => h.status === "Pending")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  // ম্যানেজারের ক্যাশ = মোট ব্যালেন্স - শুধুমাত্র মালিককে দেওয়া (Confirmed) টাকা
  // পেন্ডিং অবস্থায় টাকা ম্যানেজারের ক্যাশেই থাকবে
  const managerCurrentCash = data.stats.netBalance - totalConfirmedHandover;

  const chartData: ChartDataPoint[] = monthList.map(m => {
    const mP = data.payments.filter((p: Payment) => p.month === m && p.year === selectedYear && p.status?.toLowerCase().trim() === "paid");
    const income = mP.reduce((acc: number, curr: Payment) => acc + (Number(curr.rentAmount) || Number(curr.amount) || 0) + (Number(curr.serviceCharge) || 0), 0);
    const mE = data.expenses.filter((e: Expense) => {
      const d = new Date(e.date);
      return ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"][d.getMonth()] === m && d.getFullYear() === selectedYear;
    });
    return { name: t[m], [t.monthlyIncome]: income, [t.monthlyExpense]: mE.reduce((a, c) => a + Number(c.amount || 0), 0) };
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900 selection:bg-blue-600">
      
      <PrintTemplate lang={lang} t={t} month={selectedMonth} year={selectedYear} tenants={data.tenants} payments={data.payments} expenses={monthlyExpenses} income={mRentIncome + mServiceCharge} expense={mExpenseTotal} />

      <div className="max-w-[1700px] mx-auto space-y-12 no-print">
        
        <OwnerHeader t={t} lang={lang} setLang={setLang} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} selectedYear={selectedYear} setSelectedYear={setSelectedYear} handleLogout={handleLogout} monthList={monthList} />

        {/* ব্যাংক বনাম ক্যাশ কার্ডস */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-10 rounded-[50px] text-white shadow-2xl flex justify-between items-center relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-8 opacity-10 text-8xl italic font-black group-hover:scale-125 transition-transform text-white">BANK</div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em]">{t.confirmedFund}</p>
                <h3 className="text-4xl font-black mt-2 tracking-tighter">{formatNum(totalConfirmedHandover)}</h3>
              </div>
           </div>
           <div className="bg-white p-10 rounded-[50px] border-2 border-orange-100 shadow-xl flex justify-between items-center relative overflow-hidden group hover:border-orange-300 transition-all">
              <div className="absolute right-0 top-0 p-8 opacity-5 text-8xl italic font-black group-hover:scale-125 transition-transform text-orange-600">CASH</div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{t.cashWithManager}</p>
                <h3 className="text-4xl font-black mt-2 text-orange-600 tracking-tighter">{formatNum(managerCurrentCash)}</h3>
                {totalPendingHandover > 0 && (
                   <p className="text-[10px] font-bold text-orange-400 mt-2 italic animate-pulse">
                     * {formatNum(totalPendingHandover)} {lang === 'bn' ? 'অনুমোদনের অপেক্ষায়' : 'waiting for confirmation'}
                   </p>
                )}
              </div>
           </div>
        </div>

        <OwnerStats t={t} lang={lang} stats={data.stats} monthlyIncome={mRentIncome} monthlyServiceCharge={mServiceCharge} monthlyExpense={mExpenseTotal} month={selectedMonth} />
        
        <OwnerCharts data={chartData} incomeLabel={t.monthlyIncome} expenseLabel={t.monthlyExpense} />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
           <div className="xl:col-span-4 flex flex-col gap-10">
              <OwnerAuditLog logs={logs} />
              <HandoverTracker 
                handovers={data.handovers || []} 
                t={t} 
                lang={lang} 
                onRefresh={() => setRefreshKey(k => k + 1)}
                managerCash={managerCurrentCash}
                pendingAmount={totalPendingHandover}
              />
           </div>
           <div className="xl:col-span-8 flex flex-col gap-10">
              <OwnerLedger t={t} payments={monthlyPayments} expenses={monthlyExpenses} onTenantClick={(tenant: Tenant) => setSelectedTenant(tenant)} lang={lang} />
              <ComplaintList t={t} complaints={complaints} />
           </div>
        </div>

        <TenantDetailModal selectedTenant={selectedTenant} setSelectedTenant={setSelectedTenant} t={t} lang={lang} payments={data.payments} />
      </div>
    </div>
  );
}