import { Schema, model, models, Document } from "mongoose";

export interface IHandover extends Document {
  amount: number;
  date: Date;
  status: "Pending" | "Confirmed";
  note: string;
  createdAt: Date;
}

const HandoverSchema = new Schema<IHandover>({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["Pending", "Confirmed"], default: "Pending" },
  note: { type: String, default: "" }
}, { timestamps: true });

export default models.Handover || model<IHandover>("Handover", HandoverSchema);