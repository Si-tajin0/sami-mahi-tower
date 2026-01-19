import { Schema, model, models, Document } from "mongoose";

export interface IUnit extends Document {
  flatNo: string;
  rooms: number;
  baths: number;
  balcony: number;
  size: string;
}

const UnitSchema = new Schema<IUnit>({
  flatNo: { type: String, required: true, unique: true },
  rooms: { type: Number, default: 3 },
  baths: { type: Number, default: 2 },
  balcony: { type: Number, default: 2 },
  size: { type: String, default: "1350 sqft" },
});

export default models.Unit || model<IUnit>("Unit", UnitSchema);