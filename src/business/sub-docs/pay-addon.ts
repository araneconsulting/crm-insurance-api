import { Schema, SchemaTypes } from 'mongoose';
import { nanoid } from 'nanoid';

export interface PayAddon {
  code?: string;
  amount: number;
  category: string; //can be: Year's End bonus
  description: string; //can be: Year's End Bonus for 2021
  frequency?: string; //can be: hourly (H), daily (D), monthly (M), Bi-weekly (B), Yearly (Y)
  endedAt?: string;
  startedAt?: string;
  type: string; // can be: bonus (B), discount (D), reimbursement (R), etc
}

export const PayAddonSchema = new Schema<any>({
  code: { type: SchemaTypes.String, default: () => nanoid(6), required: false },
  normalHoursWorked: { type: SchemaTypes.Number },
  amount: { type: SchemaTypes.Number },
  category: { type: SchemaTypes.String },
  description: { type: SchemaTypes.String },
  frequency: { type: SchemaTypes.Number },
  endedAt: { type: SchemaTypes.Date },
  startedAt: { type: SchemaTypes.Date },
  type: { type: SchemaTypes.String },
});
