import mongoose, { Schema, model, models, Document } from "mongoose";

// ১. ইন্টারফেস আপডেট (tenantId-কে ObjectId অথবা string হিসেবে রাখা হয়েছে)
export interface IComplaint extends Document {
  tenantId: mongoose.Types.ObjectId | string; 
  tenantName: string;
  flatNo: string;
  subject: string;
  message: string;
  status: "Pending" | "Solved";
  createdAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>({
  // ২. এখানে ইন্টারফেসের সাথে মিল রেখে টাইপ দেওয়া হয়েছে
  tenantId: { 
    type: Schema.Types.ObjectId, 
    ref: "Tenant", 
    required: true 
  },
  tenantName: { type: String, required: true },
  flatNo: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "Solved"], 
    default: "Pending" 
  },
  createdAt: { type: Date, default: Date.now }
});

// ৩. মডেল এক্সপোর্ট
const Complaint = models.Complaint || model<IComplaint>("Complaint", ComplaintSchema);
export default Complaint;