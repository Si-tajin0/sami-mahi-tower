"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ১. গ্রাফের ডাটার জন্য নির্দিষ্ট টাইপ (any এর বদলে)
interface ChartDataPoint {
  name: string;
  [key: string]: string | number; // এখানে ইনকাম এবং ব্যয়ের লেবেলগুলো ডাইনামিক কি (key) হিসেবে থাকবে
}

interface ChartProps { 
  data: ChartDataPoint[]; 
  incomeLabel: string; 
  expenseLabel: string; 
}

export default function OwnerCharts({ data, incomeLabel, expenseLabel }: ChartProps) {
  return (
    <div className="bg-white p-10 rounded-[60px] shadow-2xl shadow-blue-900/5 border border-white no-print">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 px-4 gap-4">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800 italic leading-none">Financial Matrix</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Yearly Performance Analytics</p>
        </div>
        
        <div className="flex gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-600">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-lg shadow-blue-200"></span> 
            {incomeLabel}
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-600">
            <span className="w-2.5 h-2.5 bg-rose-400 rounded-full shadow-lg shadow-rose-200"></span> 
            {expenseLabel}
          </div>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 10, fontWeight: '800', fill: '#94a3b8'}} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 10, fontWeight: '800', fill: '#94a3b8'}} 
            />
            <Tooltip 
              cursor={{fill: '#f8fafc'}} 
              contentStyle={{
                borderRadius: '25px', 
                border: 'none', 
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                padding: '15px 20px',
                fontSize: '12px',
                fontWeight: 'bold'
              }} 
            />
            {/* ইনকাম বার */}
            <Bar 
              dataKey={incomeLabel} 
              fill="#2563eb" 
              radius={[10, 10, 0, 0]} 
              barSize={20} 
            />
            {/* ব্যয় বার */}
            <Bar 
              dataKey={expenseLabel} 
              fill="#fb7185" 
              radius={[10, 10, 0, 0]} 
              barSize={20} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}