import { Connection, Document, Model, Mongoose, Schema, SchemaType, SchemaTypes } from 'mongoose';
import { CommissionPercentage } from 'shared/enum/commission-percentage.enum';
import { Customer } from './customer.model';
import { Insurer } from './insurer.model';
import { User } from './user.model';

interface Sale extends Document<any> {
  readonly soldAt: string,
  readonly customer: Partial<Customer>,
  readonly seller: Partial<User>,
  readonly liabilityInsurer: Partial<Insurer>,
  readonly liabilityCharge: number,
  readonly cargoInsurer: Partial<Insurer>,
  readonly cargoCharge: number,
  readonly physicalDamageInsurer: Partial<Insurer>,
  readonly physicalDamageCharge: number,
  readonly wcGlUmbInsurer: Partial<Insurer>,
  readonly wcGlUmbCharge: number,
  readonly fees: number,
  readonly permits: number,
  readonly tips: number,
  readonly chargesPaid: number,
  readonly createdBy?: Partial<User>,
  readonly updatedBy?: Partial<User>,
  readonly premium: number,
  readonly amountReceivable: number,
  readonly totalCharge: number,
}

type SaleModel = Model<Sale>;

const SaleSchema = new Schema<any>(
  {
    soldAt: SchemaTypes.Date,
    customer: { type: SchemaTypes.ObjectId, ref: 'Customer', required: true },
    seller: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
    liabilityInsurer: { type: SchemaTypes.ObjectId, ref: 'Insurer', required: false },
    liabilityCharge: { type: SchemaTypes.Number, required: false },
    cargoInsurer: { type: SchemaTypes.ObjectId, ref: 'Insurer', required: false },
    cargoCharge: { type: SchemaTypes.Number, required: false },
    physicalDamageInsurer: { type: SchemaTypes.ObjectId, ref: 'Insurer', required: false },
    physicalDamageCharge: { type: SchemaTypes.Number, required: false },
    wcGlUmbInsurer: { type: SchemaTypes.ObjectId, ref: 'Insurer', required: false },
    wcGlUmbCharge: { type: SchemaTypes.Number, required: false },
    fees: { type: SchemaTypes.Number, default: 0, required: false },
    permits: { type: SchemaTypes.Number, default: 0, required: false },
    tips: { type: SchemaTypes.Number, default: 0, required: false },
    chargesPaid: { type: SchemaTypes.Number, default: 0, required: false },
    premium: { type: SchemaTypes.Number, required: false },
    amountReceivable: { type: SchemaTypes.Number, required: false },
    totalCharge: { type: SchemaTypes.Number, required: false },

    createdBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
    updatedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

SaleSchema.pre('save', function () {
  this.set({
    totalCharge: Number((this.liabilityCharge + this.physicalDamageCharge + this.cargoCharge + this.wcGlUmbCharge + this.fees + this.permits).toFixed(2)),
    amountReceivable: Number((this.liabilityCharge + this.physicalDamageCharge + this.cargoCharge + this.wcGlUmbCharge + this.fees + this.permits - this.chargesPaid).toFixed(2))
  });
});

SaleSchema.pre('updateOne', function () {
  this.set({
    totalCharge: Number((this.liabilityCharge + this.physicalDamageCharge + this.cargoCharge + this.wcGlUmbCharge + this.fees + this.permits).toFixed(2)),
    amountReceivable: Number((this.liabilityCharge + this.physicalDamageCharge + this.cargoCharge + this.wcGlUmbCharge + this.fees + this.permits - this.chargesPaid).toFixed(2))
  });
});


const saleModelFn: (conn: Connection) => SaleModel = (conn: Connection) =>
  conn.model<Sale, SaleModel>('Sale', SaleSchema, 'sales');

export { Sale, SaleSchema, SaleModel, saleModelFn }
