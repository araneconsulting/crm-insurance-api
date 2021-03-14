import { Connection, Document, Model, Mongoose, Schema, SchemaType, SchemaTypes } from 'mongoose';
import { Customer } from './customer.model';
import { Insurer } from './insurer.model';
import { User } from './user.model';

interface Sale extends Document<any> {
  readonly type: string, //Commercial Truck, Auto, Homeowner, Rental, Commercial, Life, Health, etc
  readonly location: string,
  readonly soldAt: string,
  readonly customer: Partial<Customer>,
  readonly seller: Partial<User>,
  readonly liabilityInsurer: Partial<Insurer>,
  readonly liabilityCharge: number,
  readonly liabilityProfit: number,
  readonly cargoInsurer: Partial<Insurer>,
  readonly cargoCharge: number,
  readonly cargoProfit: number,
  readonly physicalDamageInsurer: Partial<Insurer>,
  readonly physicalDamageCharge: number,
  readonly physicalDamageProfit: number,
  readonly wcGlUmbInsurer: Partial<Insurer>,
  readonly wcGlUmbCharge: number,
  readonly wcGlUmbProfit: number,
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
    type: SchemaTypes.String,
    location: SchemaTypes.String,
    soldAt: SchemaTypes.Date,
    customer: { type: SchemaTypes.ObjectId, ref: 'Customer', required: true },
    seller: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
    liabilityInsurer: { type: SchemaTypes.ObjectId, ref: 'Insurer', required: false },
    liabilityCharge: { type: SchemaTypes.Number, default: 0, required: false },
    liabilityProfit: { type: SchemaTypes.Number, default: 0, required: false },
    cargoInsurer: { type: SchemaTypes.ObjectId, ref: 'Insurer', required: false },
    cargoCharge: { type: SchemaTypes.Number, default: 0, required: false },
    cargoProfit: { type: SchemaTypes.Number, default: 0, required: false },
    physicalDamageInsurer: { type: SchemaTypes.ObjectId, ref: 'Insurer', required: false },
    physicalDamageCharge: { type: SchemaTypes.Number, default: 0, required: false },
    physicalDamageProfit: { type: SchemaTypes.Number, default: 0, required: false },
    wcGlUmbInsurer: { type: SchemaTypes.ObjectId, ref: 'Insurer', required: false },
    wcGlUmbCharge: { type: SchemaTypes.Number, default: 0, required: false },
    wcGlUmbProfit: { type: SchemaTypes.Number, default: 0, required: false },
    fees: { type: SchemaTypes.Number, default: 0, required: false },
    permits: { type: SchemaTypes.Number, default: 0, required: false },
    tips: { type: SchemaTypes.Number, default: 0, required: false },
    chargesPaid: { type: SchemaTypes.Number, default: 0, required: false },
    premium: { type: SchemaTypes.Number, default: 0, required: false },
    amountReceivable: { type: SchemaTypes.Number, default: 0, required: false },
    totalCharge: { type: SchemaTypes.Number, default: 0, required: false },
    createdBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
    updatedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

SaleSchema.pre('save', function () {

  const liability = this.liabilityCharge ? this.liabilityCharge : 0;
  const cargo = this.cargoCharge ? this.cargoCharge : 0;
  const physicalDamage = this.physicalDamageCharge ? this.physicalDamageCharge : 0;
  const wcGlUmb = this.wcGlUmbCharge ? this.wcGlUmbCharge : 0;

  this.set({
    totalCharge: Number((liability + physicalDamage + cargo + wcGlUmb + this.fees + this.permits).toFixed(2)),
    amountReceivable: Number((liability  + physicalDamage + cargo + wcGlUmb + this.fees + this.permits - this.chargesPaid).toFixed(2)),
  });
});



SaleSchema.pre('updateOne', function () {
  const liability = this.liabilityCharge ? this.liabilityCharge : 0;
  const cargo = this.cargoCharge ? this.cargoCharge : 0;
  const physicalDamage = this.physicalDamageCharge ? this.physicalDamageCharge : 0;
  const wcGlUmb = this.wcGlUmbCharge ? this.wcGlUmbCharge : 0;

  this.set({
    totalCharge: Number((liability + physicalDamage + cargo + wcGlUmb + this.fees + this.permits).toFixed(2)),
    amountReceivable: Number((liability + physicalDamage + cargo + wcGlUmb + this.fees + this.permits - this.chargesPaid).toFixed(2))
  });
});


const saleModelFn: (conn: Connection) => SaleModel = (conn: Connection) =>
  conn.model<Sale, SaleModel>('Sale', SaleSchema, 'sales');

export { Sale, SaleSchema, SaleModel, saleModelFn }
