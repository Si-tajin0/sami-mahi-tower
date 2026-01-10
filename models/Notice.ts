import { Schema, model, models, Document } from "mongoose";

export interface INotice extends Document {
  title: string;
  message: string;
  createdAt: Date;
}

const NoticeSchema = new Schema<INotice>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default models.Notice || model<INotice>("Notice", NoticeSchema);