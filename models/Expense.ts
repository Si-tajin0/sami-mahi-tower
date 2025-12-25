import { Schema, model, models, Document } from "mongoose";

export interface IExpense extends Document {
  description: string;
  amount: number;
  type: "Construction" | "Maintenance"; // নতুন এবং পুরনো খরচ আলাদা করার জন্য
  date: Date;
}

const ExpenseSchema = new Schema<IExpense>({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["Construction", "Maintenance"], default: "Maintenance" },
  date: { type: Date, default: Date.now }
});

export default models.Expense || model<IExpense>("Expense", ExpenseSchema);