import { Connection, Document, Model, Mongoose, Schema, SchemaType, SchemaTypes } from 'mongoose';
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
}

type SaleModel = Model<Sale>;

const SaleSchema = new Schema<any>(
  {
    soldAt: SchemaTypes.Date,
    customer: { type: SchemaTypes.ObjectId, ref: 'Customer', required: true },
    seller: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
    liabilityInsurer: { type: SchemaTypes.ObjectId, ref: 'Insurer', required: false },
    liabilityCharge: SchemaTypes.Number,
    cargoInsurer: { type: SchemaTypes.ObjectId, ref: 'Insurer', required: false },
    cargoCharge: SchemaTypes.Number,
    physicalDamageInsurer: { type: SchemaTypes.ObjectId, ref: 'Insurer', required: false },
    physicalDamageCharge: SchemaTypes.Number,
    wcGlUmbInsurer: { type: SchemaTypes.ObjectId, ref: 'Insurer', required: false },
    wcGlUmbCharge: SchemaTypes.Number,
    fees: SchemaTypes.Number, 
    permits: SchemaTypes.Number,
    tips: SchemaTypes.Number,
    chargesPaid: SchemaTypes.Number,

    createdBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
    updatedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
  },
  { timestamps: true },
);

const SaleChargePercentage = 0.01;
const FeesChargePercentage = 0.3;
const PermitsChargePercentage = 0.2;
const TipsChargePercentage = 1;

const DefaultInsurerCommission = 0.06;

function totalChargeGetHook() {
  return this.liabilityCharge + this.physicalDamageCharge + this.cargoCharge + this.wcGlUmbCharge + this.fees + this.permits + this.tips;
}
SaleSchema.virtual('totalCharge').get(totalChargeGetHook);

function sellerBonusGetHook() {
  return this.totalChargeGetHook * this.SaleChargePercentage
    + this.fees * this.FeesChargePercentage
    + this.permits * this.FeesChargePercentage
    + this.tips * this.TipsChargePercentage;
}
SaleSchema.virtual('sellerBonus').get(sellerBonusGetHook);

function netProfitGetHook() {

  //const saleQuery = this.SaleModel.findOne({ _id: this.id }).populate("liabilityInsurer");
  //const sale = this.from(saleQuery.exec());
  return this.liabilityInsurer.liabilityCommission;

}
SaleSchema.virtual('netProfit').get(netProfitGetHook);

SaleSchema.virtual('cargoInsurerDetails', {
  ref: 'Insurer',
  localField: '_id',
  foreignField: 'cargoInsurer',
});

const saleModelFn: (conn: Connection) => SaleModel = (conn: Connection) =>
  conn.model<Sale, SaleModel>('Sale', SaleSchema, 'sales');

export { Sale, SaleSchema, SaleModel, totalChargeGetHook, sellerBonusGetHook, netProfitGetHook, saleModelFn}
