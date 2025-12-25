import mongoose, { Schema, model, models, Document } from "mongoose";

// ১. ইন্টারফেস আপডেট (tenantId কে mongoose.Types.ObjectId অথবা string হিসেবে রাখা হয়েছে)
export interface IPayment extends Document {
  tenantId: mongoose.Types.ObjectId | string; 
  month: string;
  year: number;
  amount: number;
  status: "Paid" | "Unpaid";
}

const PaymentSchema = new Schema<IPayment>({
  // ২. এখানে Schema.Types.ObjectId ব্যবহার করা হয়েছে যা ইন্টারফেসের সাথে মিলবে
  tenantId: { 
    type: Schema.Types.ObjectId, 
    ref: "Tenant", 
    required: true 
  },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["Paid", "Unpaid"], 
    default: "Unpaid" 
  }
});

export default models.Payment || model<IPayment>("Payment", PaymentSchema);