import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';

interface PayAddon extends Document<any> {
  readonly amount: number;
  readonly category: string; //can be: Year's End bonus
  readonly description: string; //can be: Year's End Bonus for 2021
  readonly frequency: string; //can be: hourly (H), daily (D), monthly (M), Bi-weekly (B), Yearly (Y)
  readonly endedAt: string;
  readonly startedAt: string;
  readonly type: string; // can be: bonus (B), discount (D), reimbursement (R), etc
}

type PayAddonModel = Model<PayAddon>;

const PayAddonSchema = new Schema<any>(
  {
    amount: { type: SchemaTypes.Number },
    category: { type: SchemaTypes.String },
    description: { type: SchemaTypes.String },
    endedAt: { type: SchemaTypes.Date },
    frequency: { type: SchemaTypes.String },
    startedAt: { type: SchemaTypes.Date },
    type: { type: SchemaTypes.String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

const payAddonModelFn: (conn: Connection) => PayAddonModel = (
  conn: Connection,
) =>
  conn.model<PayAddon, PayAddonModel>(
    'PayAddon',
    PayAddonSchema,
    'pay_addons',
  );
export { PayAddon, PayAddonModel, PayAddonSchema, payAddonModelFn };
