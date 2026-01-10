"use client";
import { useState, useEffect } from "react";
import { dictionary, type Language } from "@/lib/dictionary";

// ১. টাইপ ইন্টারফেসসমূহ
interface Notice {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
}

interface NoticeBoardProps {
  lang: Language;
  showNotification: (msg: string, type?: "success" | "error") => void;
}

export default function NoticeBoard({ lang, showNotification }: NoticeBoardProps) {
  const t = dictionary[lang];
  const [notices, setNotices] = useState<Notice[]>([]);
  const [formData, setFormData] = useState({ title: "", message: "" });
  const [loading, setLoading] = useState(false);

  // নোটিশ লোড করার ফাংশন
  const fetchNotices = async (): Promise<void> => {
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/notices?t=${timestamp}`);
      const data = await res.json();
      if (data.success) {
        setNotices(data.data as Notice[]);
      }
    } catch (err: unknown) {
      // ESLint এরর ফিক্স করতে console.error ব্যবহার করা হয়েছে
      console.error("Notice Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // নোটিশ পাবলিশ করার ফাংশন
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // alert() সরিয়ে showNotification ব্যবহার করা হয়েছে
        showNotification(
          lang === "bn" ? "নোটিশ সফলভাবে প্রকাশিত হয়েছে!" : "Notice Published Successfully!",
          "success"
        );
        setFormData({ title: "", message: "" });
        fetchNotices();
      } else {
        showNotification("Error publishing notice", "error");
      }
    } catch (err: unknown) {
      console.error("Submit Error:", err);
      showNotification("Server error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
      
      {/* ২. নোটিশ ফরম সেকশন */}
      <div className="lg:col-span-5 bg-white p-8 rounded-[45px] shadow-2xl shadow-blue-900/5 border border-white h-fit relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full opacity-50"></div>
        
        <div className="relative z-10">
          <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tighter flex items-center gap-2">
            <span className="text-2xl">✍️</span> {t.addNotice}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">{t.noticeTitle}</label>
              <input 
                type="text" 
                placeholder="Ex: Water Tank Cleaning"
                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-[22px] outline-none font-bold text-slate-700 focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">{t.noticeMessage}</label>
              <textarea 
                placeholder="Write details here..." 
                rows={5}
                className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[30px] outline-none font-bold text-slate-700 focus:border-blue-500 focus:bg-white transition-all shadow-inner resize-none"
                value={formData.message} 
                onChange={(e) => setFormData({...formData, message: e.target.value})} 
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-5 rounded-[25px] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "..." : t.publish}
            </button>
          </form>
        </div>
      </div>

      {/* ৩. নোটিশ লিস্ট সেকশন */}
      <div className="lg:col-span-7 bg-white p-8 rounded-[45px] shadow-2xl shadow-blue-900/5 border border-white">
        <h2 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tighter flex items-center gap-2">
          <span className="text-2xl">📣</span> {t.noticeBoard}
        </h2>
        
        <div className="space-y-5 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
          {notices.map((n) => (
            <div key={n._id} className="p-6 bg-slate-50/50 rounded-[35px] border border-transparent hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all duration-500 group">
               <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-black text-blue-600 uppercase text-sm tracking-tight group-hover:text-blue-700 transition-colors">{n.title}</h4>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                      📅 {new Date(n.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {day:'numeric', month:'short', year:'numeric'})}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">📌</div>
               </div>
               <p className="text-slate-600 text-[13px] leading-relaxed font-medium">{n.message}</p>
            </div>
          ))}
          
          {notices.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
               <p className="text-slate-300 font-black uppercase text-[10px] tracking-[0.3em] italic">{t.noNotice}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}