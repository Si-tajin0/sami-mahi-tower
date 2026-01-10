import { Schema, model, models, Document } from "mongoose";

export interface IActivityLog extends Document {
  action: string;
  details: string;
  changes: { field: string; old: string | number; new: string | number; }[]; // নতুন অংশ
  performedBy: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  action: { type: String, required: true },
  details: { type: String, required: true },
  changes: [{ field: String, old: Schema.Types.Mixed, new: Schema.Types.Mixed }], // যেকোনো ডাটা টাইপ সাপোর্ট করবে
  performedBy: { type: String, default: "Manager" },
  createdAt: { type: Date, default: Date.now }
});

export default models.ActivityLog || model<IActivityLog>("ActivityLog", ActivityLogSchema);