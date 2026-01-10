import { Schema, model, models, Document } from "mongoose";

export interface ITenant extends Document {
  name: string;
  phone: string;
  nid: string;
  occupation: string;
  flatNo: string;
  rentAmount: number;
  securityDeposit: number;
  tenantId: string;
  emergencyContact: string;
  password?: string;
  role?: string;
  isActive?: boolean;
  joinedDate: Date;
  status: string;
  exitDate: Date;
  profilePic:string;
  nidPhoto:string;
}



const TenantSchema = new Schema<ITenant>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  nid: { type: String, required: true }, // এটি যোগ করা হয়েছে
  occupation: { type: String, default: "" }, // এটি যোগ করা হয়েছে
  flatNo: { type: String, required: true },
  rentAmount: { type: Number, required: true },
  securityDeposit: { type: Number, default: 0 }, // এটি যোগ করা হয়েছে
  tenantId: { type: String, required: true, unique: true },
  emergencyContact: { type: String, default: "" }, // এটি যোগ করা হয়েছে
  password: { type: String, default: "123456" },
  role: { type: String, default: "tenant" },
  isActive: { type: Boolean, default: true },
  joinedDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["Active", "Exited"], default: "Active" },
exitDate: { type: Date },
profilePic: { type: String, default: "" }, // ভাড়াটিয়ার ছবি
nidPhoto: { type: String, default: "" },   // এনআইডি কার্ডের ছবি
});

export default models.Tenant || model<ITenant>("Tenant", TenantSchema);