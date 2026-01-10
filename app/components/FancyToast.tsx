"use client";
import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

export default function FancyToast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // ৪ সেকেন্ড পর অটোমেটিক চলে যাবে
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "bg-emerald-500 shadow-emerald-200",
    error: "bg-rose-500 shadow-rose-200",
    info: "bg-blue-600 shadow-blue-200",
  };

  const icons = {
    success: "✅",
    error: "⚠️",
    info: "ℹ️",
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[2000] animate-in slide-in-from-bottom-10 duration-500">
      <div className={`${colors[type]} p-5 pr-8 rounded-[30px] shadow-2xl flex items-center gap-4 text-white min-w-[300px] border border-white/20 backdrop-blur-md`}>
        <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl shadow-inner">
          {icons[type]}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70 leading-none mb-1">Notification</p>
          <p className="text-sm font-bold tracking-tight">{message}</p>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 opacity-50 hover:opacity-100 transition-opacity">✕</button>
      </div>
    </div>
  );
}