"use client";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Language } from "@/lib/dictionary";

interface ReceiptProps {
  tenantName: string;
  flatNo: string;
  month: string;
  year: number;
  amount: number;
  serviceCharge: number;
  paymentId: string;
  lang: Language;
}

// পিডিএফ ডাউনলোড ফাংশন
export const downloadReceipt = async (id: string, fileName: string) => {
  const element = document.getElementById(id);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // ২ স্কেল দিলে রেজোলিউশন এবং ফাইল সাইজ ব্যালেন্স থাকে
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      onclone: (clonedDoc) => {
        const el = clonedDoc.getElementById(id);
        if (el) {
          el.style.display = "block";
          el.style.position = "relative";
          el.style.left = "0";
          el.style.top = "0";
        }
      }
    });

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const imgWidth = pdfWidth - (margin * 2); 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight, undefined, 'FAST');
    pdf.save(`${fileName}.pdf`);
    
  } catch (error) {
    console.error("PDF generation failed:", error);
  }
};

export default function MoneyReceiptTemplate({ data }: { data: ReceiptProps }) {
  const total = Number(data.amount) + Number(data.serviceCharge);

  return (
    /* কন্টেইনারকে ফিক্সড করে স্ক্রিনের বাইরে রাখা হয়েছে যাতে ইউজার না দেখে কিন্তু ব্রাউজার রেন্ডার করে */
    <div style={{ position: 'fixed', bottom: '-10000px', left: 0, width: '100%', pointerEvents: 'none', zIndex: -9999 }}>
      <div 
        id={`receipt-${data.paymentId}`} 
        style={{ 
          width: "180mm", 
          padding: "40px", 
          backgroundColor: "#ffffff", 
          color: "#1e293b", 
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          boxSizing: "border-box"
        }}
      >
        {/* টপ বর্ডার এবং হেডার (সরাসরি হেক্স কালার ব্যবহার করা হয়েছে) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "4px solid #1d4ed8", paddingBottom: "25px", marginBottom: "35px" }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#1d4ed8", margin: 0, fontStyle: "italic", textTransform: "uppercase" }}>Sami & Mahi Tower</h1>
            <p style={{ fontSize: "12px", color: "#64748b", fontWeight: "bold", textTransform: "uppercase", marginTop: "5px", letterSpacing: "1px" }}>Luxury Living & Management</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ backgroundColor: "#10b981", color: "#ffffff", padding: "10px 25px", borderRadius: "30px", fontSize: "14px", fontWeight: "900", textTransform: "uppercase" }}>Paid Receipt</div>
            <p style={{ fontSize: "11px", marginTop: "12px", color: "#94a3b8", fontWeight: "bold" }}>REF: #{data.paymentId.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        {/* ভাড়াটিয়া এবং মাসের তথ্য গ্রিড */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", marginBottom: "40px" }}>
          <div style={{ backgroundColor: "#f8fafc", padding: "20px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: "10px", fontWeight: "900", color: "#1d4ed8", textTransform: "uppercase", marginBottom: "5px" }}>Resident</p>
            <h3 style={{ fontSize: "20px", fontWeight: "900", margin: 0 }}>{data.tenantName}</h3>
            <p style={{ fontSize: "14px", fontWeight: "bold", color: "#475569", marginTop: "5px" }}>Flat / Unit: {data.flatNo}</p>
          </div>
          <div style={{ backgroundColor: "#f8fafc", padding: "20px", borderRadius: "20px", border: "1px solid #e2e8f0", textAlign: "right" }}>
            <p style={{ fontSize: "10px", fontWeight: "900", color: "#1d4ed8", textTransform: "uppercase", marginBottom: "5px" }}>Billing Period</p>
            <h3 style={{ fontSize: "20px", fontWeight: "900", margin: 0, textTransform: "uppercase" }}>{data.month} {data.year}</h3>
            <p style={{ fontSize: "14px", fontWeight: "bold", color: "#10b981", marginTop: "5px" }}>Status: Successfully Paid</p>
          </div>
        </div>

        {/* পেমেন্ট ডিটেইলস টেবিল */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "40px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc" }}>
              <th style={{ padding: "18px", textAlign: "left", fontSize: "12px", textTransform: "uppercase", borderBottom: "2px solid #cbd5e1", color: "#64748b" }}>Description</th>
              <th style={{ padding: "18px", textAlign: "right", fontSize: "12px", textTransform: "uppercase", borderBottom: "2px solid #cbd5e1", color: "#64748b" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "18px", fontSize: "15px", borderBottom: "1px solid #f1f5f9", fontWeight: "600" }}>Monthly House Rent</td>
              <td style={{ padding: "18px", fontSize: "16px", fontWeight: "900", textAlign: "right", borderBottom: "1px solid #f1f5f9" }}>৳ {data.amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style={{ padding: "18px", fontSize: "15px", borderBottom: "1px solid #f1f5f9", fontWeight: "600" }}>Utilities & Service Charge</td>
              <td style={{ padding: "18px", fontSize: "16px", fontWeight: "900", textAlign: "right", borderBottom: "1px solid #f1f5f9" }}>৳ {data.serviceCharge.toLocaleString()}</td>
            </tr>
            <tr style={{ backgroundColor: "#f0f9ff" }}>
              <td style={{ padding: "22px", fontSize: "18px", fontWeight: "900", color: "#1d4ed8" }}>GRAND TOTAL</td>
              <td style={{ padding: "22px", fontSize: "22px", fontWeight: "900", color: "#1d4ed8", textAlign: "right" }}>৳ {total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        {/* ফুটার সিগনেচার এবং নোট */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "60px" }}>
          <div style={{ maxWidth: "350px" }}>
            <p style={{ fontSize: "11px", color: "#94a3b8", fontStyle: "italic", lineHeight: "1.6" }}>
              * This is a computer-generated official receipt of Sami & Mahi Tower. Any unauthorized alteration or physical signature is not required.
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "180px", borderBottom: "2px solid #0f172a", marginBottom: "8px" }}></div>
            <p style={{ fontSize: "11px", fontWeight: "900", textTransform: "uppercase", color: "#1e293b", letterSpacing: "1px" }}>Authorized Manager</p>
          </div>
        </div>

        {/* ওয়াটারমার্ক */}
        <div style={{ 
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-45deg)",
          fontSize: "120px", fontWeight: "900", color: "#f1f5f9", zIndex: -1, opacity: 0.7, whiteSpace: "nowrap"
        }}>S M TOWER</div>
      </div>
    </div>
  );
}