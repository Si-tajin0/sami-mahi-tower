"use client";
import { useState, useEffect } from "react";
import { Language, dictionary } from "@/lib/dictionary"; 
import FancyToast from "@/app/components/FancyToast";

interface Employee {
  _id: string;
  name: string;
  role: string;
  phone: string;
  salary: number;
  nidNumber: string;
  profilePic?: string;
  nidPhoto?: string;
  details?: string;
  status: string;
}

interface GlossyUploadBoxProps {
  label: string;
  url: string;
  isUploading: boolean;
  onFileSelect: (file: File) => void;
}

export default function EmployeeManager({ lang }: { lang: Language }) {
  const t = dictionary[lang];
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [uploadingNid, setUploadingNid] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });

  const [formData, setFormData] = useState({
    name: "", role: "", phone: "", salary: "", nidNumber: "", 
    profilePic: "", nidPhoto: "", details: ""
  });

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      if (data.success) setEmployees(data.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  // সরাসরি Cloudinary API-তে আপলোড করার ফাংশন
  const uploadToCloudinary = async (file: File, type: 'profile' | 'nid') => {
    const cloudinaryURL = "https://api.cloudinary.com/v1_1/dj9s9m67f/image/upload";
    const uploadPreset = "si_tajin"; 

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", uploadPreset);

    if (type === 'profile') setUploadingPic(true);
    else setUploadingNid(true);

    try {
      const res = await fetch(cloudinaryURL, {
        method: "POST",
        body: uploadData,
      });
      const data = await res.json();
      
      if (data.secure_url) {
        setFormData(prev => ({ ...prev, [type === 'profile' ? 'profilePic' : 'nidPhoto']: data.secure_url }));
        setToast({ show: true, message: lang === 'bn' ? "ছবি আপলোড হয়েছে" : "Image Uploaded", type: "success" });
      }
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      setToast({ show: true, message: "Upload failed", type: "error" });
    } finally {
      setUploadingPic(false);
      setUploadingNid(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ name: "", role: "", phone: "", salary: "", nidNumber: "", profilePic: "", nidPhoto: "", details: "" });
        fetchEmployees();
        setToast({ show: true, message: lang === 'bn' ? "কর্মচারী যোগ হয়েছে!" : "Staff added!", type: "success" });
      }
    } catch { 
        setToast({ show: true, message: "Error", type: "error" });
    } finally { setLoading(false); }
  };

  const formatCurrency = (num: number) => `৳ ${num.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 p-2 animate-in fade-in duration-700">
      
      {/* বাম পাশ: গ্লসি এন্ট্রি ফর্ম */}
      <div className="xl:col-span-5 bg-white p-10 rounded-[60px] shadow-2xl border border-slate-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-6xl font-black italic select-none uppercase">{lang === 'bn' ? 'এন্ট্রি' : 'ENTRY'}</div>
        <h3 className="text-2xl font-black text-slate-800 mb-8 uppercase italic tracking-tighter">Add New Staff Member</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <InputField label={t.tenantName} value={formData.name} onChange={(v)=>setFormData({...formData, name: v})} placeholder="Full Name" />
             <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-widest">{lang === 'bn' ? 'পদবী' : 'Role'}</label>
                <select className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-[25px] outline-none font-bold text-slate-700 focus:border-blue-500 transition-all shadow-inner" value={formData.role} onChange={(e)=>setFormData({...formData, role: e.target.value})} required>
                   <option value="">Select Role</option>
                   <option value="Manager">Manager</option>
                   <option value="Security">Security Guard</option>
                   <option value="Cleaner">Cleaner</option>
                   <option value="Caretaker">Caretaker</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <InputField label={t.phone} value={formData.phone} onChange={(v)=>setFormData({...formData, phone: v})} placeholder="Phone" type="tel" />
             <InputField label={lang === 'bn' ? 'বেতন' : 'Salary'} value={formData.salary} onChange={(v)=>setFormData({...formData, salary: v})} placeholder="Amount" type="number" />
          </div>

          {/* ইমেজ আপলোড সেকশন */}
          <div className="grid grid-cols-2 gap-6">
            <GlossyUploadBox 
              label={lang === 'bn' ? 'প্রোফাইল ছবি' : 'Profile Photo'} 
              url={formData.profilePic} 
              isUploading={uploadingPic} 
              onFileSelect={(file) => uploadToCloudinary(file, 'profile')} 
            />
            <GlossyUploadBox 
              label={lang === 'bn' ? 'এনআইডি ছবি' : 'NID Card'} 
              url={formData.nidPhoto} 
              isUploading={uploadingNid} 
              onFileSelect={(file) => uploadToCloudinary(file, 'nid')} 
            />
          </div>

          <InputField label={t.nid} value={formData.nidNumber} onChange={(v)=>setFormData({...formData, nidNumber: v})} placeholder="NID Number" />

          <div className="space-y-1">
             <label className="text-[10px] font-black uppercase text-slate-400 ml-5">{lang === 'bn' ? 'বিস্তারিত' : 'Details'}</label>
             <textarea className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[30px] outline-none font-bold text-slate-700 focus:border-blue-500 transition-all h-24 shadow-inner" placeholder="..." value={formData.details} onChange={(e)=>setFormData({...formData, details: e.target.value})} />
          </div>

          <button disabled={loading || uploadingPic || uploadingNid} className="w-full bg-slate-900 text-white py-6 rounded-[30px] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition-all disabled:opacity-50">
            {loading ? "..." : t.saveBtn}
          </button>
        </form>
      </div>

      {/* ডান পাশ: প্রিমিয়াম লিস্ট */}
      <div className="xl:col-span-7 bg-white p-10 rounded-[60px] shadow-2xl border border-slate-100">
        <h3 className="text-2xl font-black text-slate-800 mb-10 uppercase italic tracking-tighter">Current Staff</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[750px] overflow-y-auto pr-2 custom-scrollbar">
          {employees.map((emp) => (
            <div key={emp._id} className="bg-slate-50/50 p-6 rounded-[45px] border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-xl transition-all duration-500 group">
              <div className="flex items-center gap-5 mb-5">
                <div className="w-16 h-16 rounded-[22px] overflow-hidden border-4 border-white shadow-lg bg-blue-100 flex items-center justify-center font-black text-blue-600 text-xl italic">
                  {emp.profilePic ? <img src={emp.profilePic} className="w-full h-full object-cover" alt="Profile" /> : emp.name[0]}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 uppercase text-sm leading-tight">{emp.name}</h4>
                  <span className="text-[9px] font-black uppercase bg-blue-600 text-white px-3 py-1 rounded-full mt-2 inline-block shadow-sm">{emp.role}</span>
                </div>
              </div>
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400 uppercase">Phone</span>
                  <span className="text-slate-700 italic">{emp.phone}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400 uppercase">Salary</span>
                  <span className="text-blue-600 font-black">{formatCurrency(emp.salary)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {toast.show && <FancyToast message={toast.message} type={toast.type} onClose={()=>setToast({...toast, show:false})} />}
    </div>
  );
}

// সাব-কম্পোনেন্ট: গ্লসি আপলোড বক্স
function GlossyUploadBox({ label, url, isUploading, onFileSelect }: GlossyUploadBoxProps) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-widest">{label}</label>
            <div className="relative h-36 bg-slate-50 rounded-[35px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-blue-400 group/box shadow-inner">
                {url ? (
                    <img src={url} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                    <div className="text-center p-4">
                        <span className="text-2xl mb-1 block">📸</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                            {isUploading ? "Uploading..." : "Click to Upload"}
                        </span>
                    </div>
                )}
                <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    accept="image/*" 
                    onChange={(e) => e.target.files && onFileSelect(e.target.files[0])} 
                    disabled={isUploading}
                />
                {url && !isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/box:opacity-100 transition-opacity">
                        <span className="text-white text-[8px] font-black uppercase tracking-widest">Change Image</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// সাব-কম্পোনেন্ট: ইনপুট ফিল্ড
function InputField({ label, value, onChange, placeholder, type = "text" }: { label: string, value: string | number, onChange: (v: string) => void, placeholder: string, type?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-widest">{label}</label>
      <input type={type} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-[25px] outline-none font-bold text-slate-700 focus:border-blue-500 transition-all shadow-inner" placeholder={placeholder} value={value} onChange={(e)=>onChange(e.target.value)} required />
    </div>
  );
}