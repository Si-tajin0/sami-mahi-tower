"use client";
import { useState, useEffect, useMemo } from "react";
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
import OwnerEmployeeList from "./components/OwnerEmployeeList";

// --- ইন্টারফেসসমূহ ---
interface Employee {
  _id: string; name: string; role: string; phone: string; salary: number;
  nidNumber: string; profilePic?: string; nidPhoto?: string; details?: string; status: string;
}

interface ChartDataPoint { name: string; [key: string]: string | number; }

interface OwnerDataFull extends OwnerData {
  handovers: Handover[];
  stats: { 
    totalRentIncome: number; totalServiceCharge: number; totalConstruction: number; 
    totalMaintenance: number; totalSecurityDeposit: number; netBalance: number; 
  };
}

interface GlossyProgressProps {
  label: string; amount: number; total: number; color: string; format: (num: number) => string;
}

export default function OwnerDashboard() {
  const [lang, setLang] = useState<Language>("bn");
  const t = dictionary[lang];
  const router = useRouter();

  // স্টেটস
  const [data, setData] = useState<OwnerDataFull | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<keyof DictionaryContent>("jan");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [mounted, setMounted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const monthList: (keyof DictionaryContent)[] = useMemo(() => 
    ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"], []);

  const formatNum = useMemo(() => (num: number) => 
    `৳ ${num.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`, [lang]);

  // ডাটা ফেচিং
  useEffect(() => {
    setMounted(true);
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const ts = new Date().getTime();
        const [sumRes, logRes, comRes, handRes, empRes] = await Promise.all([
          fetch(`/api/owner/summary?t=${ts}`), 
          fetch(`/api/logs?t=${ts}`), 
          fetch(`/api/complaints?t=${ts}`),
          fetch(`/api/handover?t=${ts}`),
          fetch(`/api/employees?t=${ts}`)
        ]);

        const [d1, d2, d3, d4, d5] = await Promise.all([
          sumRes.json(), logRes.json(), comRes.json(), handRes.json(), empRes.json()
        ]);
        
        if (d1.success) setData({ ...d1.data, handovers: d4.success ? d4.data : [] });
        if (d2.success) setLogs(d2.data);
        if (d3.success) setComplaints(d3.data);
        if (d5.success) setEmployees(d5.data);
      } catch (err) { 
        console.error("Owner Sync Error:", err); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [refreshKey, selectedMonth, selectedYear]);

  // ক্যালকুলেশন লজিক
  const stats = useMemo(() => {
    if (!data) return null;
    const allP: Payment[] = data.payments;
    const allE: Expense[] = data.expenses;

    const monthlyPayments = allP.filter(p => p.month === selectedMonth && p.year === selectedYear);
    const mRentIncome = monthlyPayments.filter(p => p.status?.toLowerCase().trim() === "paid").reduce((acc, curr) => acc + (Number(curr.rentAmount) || Number(curr.amount) || 0), 0);
    const mServiceCharge = monthlyPayments.filter(p => p.status?.toLowerCase().trim() === "paid").reduce((acc, curr) => acc + (Number(curr.serviceCharge) || 0), 0);
    
    const monthlyExpenses = allE.filter((e) => {
      const d = new Date(e.date);
      return monthList[d.getMonth()] === selectedMonth && d.getFullYear() === selectedYear;
    });

    const mExpenseTotal = monthlyExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const constrExp = monthlyExpenses.filter(e => e.type === "Construction").reduce((a, c) => a + Number(c.amount), 0);
    const maintExp = monthlyExpenses.filter(e => e.type === "Maintenance").reduce((a, c) => a + Number(c.amount), 0);

    const yearlyPerformance: ChartDataPoint[] = monthList.map(m => {
      const mP = allP.filter(p => p.month === m && p.year === selectedYear && p.status?.toLowerCase().trim() === "paid");
      const inc = mP.reduce((acc, curr) => acc + (Number(curr.rentAmount) || Number(curr.amount) || 0) + (Number(curr.serviceCharge) || 0), 0);
      const mEx = allE.filter(e => {
        const d = new Date(e.date);
        return monthList[d.getMonth()] === m && d.getFullYear() === selectedYear;
      });
      const exp = mEx.reduce((a, c) => a + Number(c.amount || 0), 0);
      return { name: t[m], [t.monthlyIncome]: inc, [t.monthlyExpense]: exp };
    });

    const totalExpectedRent = data.tenants.reduce((acc, curr) => acc + (Number(curr.rentAmount) || 0), 0);
    const collectionPercent = totalExpectedRent > 0 ? Math.round((mRentIncome / totalExpectedRent) * 100) : 0;
    const confirmedHandover = (data.handovers || []).filter(h => h.status === "Confirmed").reduce((acc, curr) => acc + Number(curr.amount), 0);
    const pendingHandover = (data.handovers || []).filter(h => h.status === "Pending").reduce((acc, curr) => acc + Number(curr.amount), 0);

    return {
      monthlyPayments, mRentIncome, mServiceCharge, mExpenseTotal,
      confirmedHandover, pendingHandover, managerCash: data.stats.netBalance - confirmedHandover,
      collectionPercent, totalExpectedRent, constrExp, maintExp, monthlyExpenses, yearlyPerformance
    };
  }, [data, selectedMonth, selectedYear, t, monthList]);

  const handleLogout = () => { 
    Cookies.remove("user-role"); Cookies.remove("user-id"); router.push("/login"); 
  };

  if (!mounted || isLoading || !data || !stats) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900 selection:bg-blue-600">
      
      <PrintTemplate 
        lang={lang} t={t} month={selectedMonth} year={selectedYear} 
        tenants={data.tenants} payments={data.payments} 
        expenses={stats.monthlyExpenses} income={stats.mRentIncome + stats.mServiceCharge} 
        expense={stats.mExpenseTotal} 
      />

      <div className="max-w-[1700px] mx-auto space-y-10 no-print animate-in fade-in duration-1000">
        
        <OwnerHeader 
          t={t} lang={lang} setLang={setLang} 
          selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} 
          selectedYear={selectedYear} setSelectedYear={setSelectedYear} 
          handleLogout={handleLogout} monthList={monthList} 
        />

        {/* সেকশন ১: মাসিক আয় ও অল-টাইম স্ট্যাটাস (Top View) */}
        <OwnerStats t={t} lang={lang} stats={data.stats} monthlyIncome={stats.mRentIncome} monthlyServiceCharge={stats.mServiceCharge} monthlyExpense={stats.mExpenseTotal} month={selectedMonth} />

        {/* সেকশন ২: ফিন্যান্সিয়াল কী মেট্রিক্স (Bank, Cash, Progress) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="bg-gradient-to-br from-indigo-700 to-blue-900 p-8 rounded-[45px] text-white shadow-2xl relative overflow-hidden group">
              <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em]">{t.confirmedFund}</p>
              <h3 className="text-4xl font-black mt-2 tracking-tighter"><AnimatedNumber value={stats.confirmedHandover} lang={lang} /></h3>
           </div>

           <div className="bg-white p-8 rounded-[45px] border border-slate-100 shadow-xl relative overflow-hidden group">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{t.cashWithManager}</p>
              <h3 className="text-4xl font-black mt-2 text-orange-600 tracking-tighter"><AnimatedNumber value={stats.managerCash} lang={lang} /></h3>
              {stats.pendingHandover > 0 && (
                 <p className="text-[10px] font-bold text-orange-400 mt-2 animate-pulse italic">* {formatNum(stats.pendingHandover)} {lang === 'bn' ? 'অপেক্ষমাণ' : 'pending'}</p>
              )}
           </div>

           <div className="bg-white p-8 rounded-[45px] border border-slate-100 shadow-xl flex flex-col justify-center">
              <div className="flex justify-between items-center mb-3">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'bn' ? 'আদায় অগ্রগতি' : 'Collection'}</p>
                 <span className="text-blue-600 font-black">{stats.collectionPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000" style={{ width: `${stats.collectionPercent}%` }}></div>
              </div>
           </div>
        </div>

        {/* সেকশন ৩: অ্যানালিটিক্স ও ম্যানেজমেন্ট টিম */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
           {/* বাম পাশ: বার্ষিক পারফরম্যান্স */}
           <div className="xl:col-span-8 bg-white p-8 rounded-[50px] shadow-xl border border-slate-50">
              <div className="mb-8"><h4 className="text-xl font-black uppercase tracking-tighter italic text-slate-800">{lang === 'bn' ? 'বার্ষিক পারফরম্যান্স' : 'Yearly Performance'}</h4></div>
              <OwnerCharts data={stats.yearlyPerformance} incomeLabel={t.monthlyIncome} expenseLabel={t.monthlyExpense} />
           </div>
           
           {/* ডান পাশ: ম্যানেজমেন্ট টিম ও অডিট লগ */}
           <div className="xl:col-span-4 space-y-8">
              <OwnerEmployeeList employees={employees} lang={lang} />
              <OwnerAuditLog logs={logs} />
           </div>
        </div>

        {/* সেকশন ৪: লেনদেনের বিস্তারিত (Ledger & Financial Actions) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
           {/* বাম পাশ: পেমেন্ট লেজার */}
           <div className="xl:col-span-8">
              <OwnerLedger t={t} payments={stats.monthlyPayments} expenses={stats.monthlyExpenses} onTenantClick={(tenant: Tenant) => setSelectedTenant(tenant)} lang={lang} />
           </div>

           {/* ডান পাশ: ব্যয়ের বিশ্লেষণ ও হ্যান্ডওভার */}
           <div className="xl:col-span-4 space-y-8">
              <div className="bg-white p-8 rounded-[45px] border border-slate-100 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-indigo-500"></div>
                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-8 text-center tracking-widest italic">{lang === 'bn' ? 'ব্যয়ের বিশ্লেষণ' : 'Expense Breakdown'}</h4>
                <div className="space-y-6">
                   <GlossyProgress label="Construction" amount={stats.constrExp} total={stats.mExpenseTotal} color="bg-orange-500" format={formatNum} />
                   <GlossyProgress label="Maintenance" amount={stats.maintExp} total={stats.mExpenseTotal} color="bg-indigo-600" format={formatNum} />
                </div>
              </div>
              <HandoverTracker handovers={data.handovers || []} t={t} lang={lang} onRefresh={() => setRefreshKey(k => k + 1)} managerCash={stats.managerCash} pendingAmount={stats.pendingHandover} />
           </div>
        </div>

        {/* সেকশন ৫: ভাড়াটিয়ার অভিযোগ বোর্ড (নতুন - বড় ও প্রশস্ত করা হয়েছে) */}
        <div className="bg-white p-10 rounded-[60px] shadow-2xl border border-white">
           <div className="flex items-center gap-5 mb-10">
              <div className="w-16 h-16 bg-red-50 rounded-[22px] flex items-center justify-center text-3xl shadow-inner border border-red-100">📢</div>
              <div>
                 <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-800">
                    {lang === 'bn' ? 'ভাড়াটিয়া অভিযোগ বোর্ড' : 'Resident Complaint Board'}
                 </h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1 italic">Active & Pending Concerns</p>
              </div>
           </div>
           <div className="min-h-[300px]">
              <ComplaintList t={t} complaints={complaints} />
           </div>
        </div>

        <TenantDetailModal selectedTenant={selectedTenant} setSelectedTenant={setSelectedTenant} t={t} lang={lang} payments={data.payments} />
      </div>
    </div>
  );
}

// --- সাব কম্পোনেন্টস ---

function AnimatedNumber({ value, lang }: { value: number, lang: Language }) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / 40;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setDisplayValue(end); clearInterval(timer); } 
      else { setDisplayValue(Math.floor(start)); }
    }, 25);
    return () => clearInterval(timer);
  }, [value]);
  return <>৳ {displayValue.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</>;
}

function GlossyProgress({ label, amount, total, color, format }: GlossyProgressProps) {
  const percent = total > 0 ? (amount / total) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-900">{format(amount)}</span>
      </div>
      <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10 space-y-10 animate-pulse">
      <div className="h-20 bg-white rounded-[35px] w-full border border-slate-100 shadow-sm"></div>
      <div className="grid grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-32 bg-white rounded-[35px] shadow-sm"></div>)}
      </div>
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 h-[450px] bg-white rounded-[50px]"></div>
        <div className="col-span-4 h-[450px] bg-white rounded-[50px]"></div>
      </div>
    </div>
  );
}