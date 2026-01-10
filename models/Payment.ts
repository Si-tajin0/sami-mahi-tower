import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IPayment extends Document {
  tenantId: mongoose.Types.ObjectId | string; 
  month: string;
  year: number;
  rentAmount: number;    // মূল বাড়ি ভাড়া
  serviceCharge: number; // মাসিক সার্ভিস চার্জ
  totalAmount: number;   // ভাড়া + সার্ভিস চার্জ
  status: "Paid" | "Unpaid";
  updatedAt: Date;
  method: "Cash" | "Online";
}

const PaymentSchema = new Schema<IPayment>({
  tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  rentAmount: { type: Number, default: 0 },
  serviceCharge: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  method: { type: String, enum: ["Cash", "Online"], default: "Cash" },
  status: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
  updatedAt: { type: Date, default: Date.now }
});

export default models.Payment || model<IPayment>("Payment", PaymentSchema);