import { Schema, model, models, Document } from "mongoose";

export interface IEmployee extends Document {
  name: string;
  role: string;
  phone: string;
  salary: number;
  nidNumber: string;
  nidPhoto?: string;
  profilePic?: string;
  details?: string;
  status: "Active" | "Inactive";
  joinedDate: Date;
}

const EmployeeSchema = new Schema<IEmployee>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  phone: { type: String, required: true },
  salary: { type: Number, required: true },
  nidNumber: { type: String, required: true },
  nidPhoto: { type: String }, // এনআইডি কার্ডের ছবি (URL/Base64)
  profilePic: { type: String }, // কর্মচারীর নিজের ছবি
  details: { type: String }, // অন্যান্য তথ্য
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  joinedDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default models.Employee || model<IEmployee>("Employee", EmployeeSchema);