import { Schema, model, models, Document } from "mongoose";

export interface IActivityLog extends Document {
  action: string;      // যেমন: "ভাড়াটিয়া তথ্য আপডেট", "ভাড়া পেইড মার্ক"
  details: string;     // যেমন: "ফ্ল্যাট ৫এ এর ভাড়া ৫০০০ থেকে ৫৫০০ করা হয়েছে"
  performedBy: string; // "Manager"
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  action: { type: String, required: true },
  details: { type: String, required: true },
  performedBy: { type: String, default: "Manager" },
  createdAt: { type: Date, default: Date.now }
});

export default models.ActivityLog || model<IActivityLog>("ActivityLog", ActivityLogSchema);