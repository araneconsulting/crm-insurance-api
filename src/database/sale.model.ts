import { Connection, Document, Model, Mongoose, Schema, SchemaType, SchemaTypes } from 'mongoose';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { CommisionPercentages } from 'shared/enum/commission-percentages.enum';
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
  
  readonly totalCharge: number,
  readonly sellerBonus: number,
  readonly grossProfit: number,
  readonly netProfit: number,
  readonly amountReceivable: number,
}

type SaleModel = Model<Sale>;

const SaleSchema = new Schema<any>(
  {
    soldAt: SchemaTypes.Date,
    customer: { type: SchemaTypes.ObjectId, ref: 'Customer', required: true },
    seller: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
    liabilityInsurer: { type: SchemaTypes.ObjectId, ref: 'Insurer', default: CommisionPercentages.INSURER_DEFAULT, required: false },
    liabilityCharge: SchemaTypes.Number,
    cargoInsurer: { type: SchemaTypes.ObjectId, ref: 'Insurer', default: CommisionPercentages.INSURER_DEFAULT, required: false },
    cargoCharge: SchemaTypes.Number,
    physicalDamageInsurer: { type: SchemaTypes.ObjectId, ref: 'Insurer', default: CommisionPercentages.INSURER_DEFAULT, required: false },
    physicalDamageCharge: SchemaTypes.Number,
    wcGlUmbInsurer: { type: SchemaTypes.ObjectId, ref: 'Insurer', default: CommisionPercentages.INSURER_DEFAULT, required: false },
    wcGlUmbCharge: SchemaTypes.Number,
    fees: SchemaTypes.Number,
    permits: SchemaTypes.Number,
    tips: SchemaTypes.Number,
    chargesPaid: SchemaTypes.Number,
    totalCharge: SchemaTypes.Number,
    sellerBonus: SchemaTypes.Number,
    grossProfit: SchemaTypes.Number,
    netProfit: SchemaTypes.Number,
    amountReceivable: SchemaTypes.Number,

    createdBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
    updatedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

SaleSchema.pre('save', function () {
  this.set({
    totalCharge: this.calculateTotalCharge(),
    sellerBonus: this.calculateSellerBonus(),
    grossProfit: this.calculateGrossProfit(),
    netProfit: this.calculateNetProfit(),
    amountReceivable: this.calculateAmountReceivable(),
  });
});

SaleSchema.pre('updateOne', function () {
  this.set({
    totalCharge: this.calculateTotalCharge(),
    sellerBonus: this.calculateSellerBonus(),
    grossProfit: this.calculateGrossProfit(),
    netProfit: this.calculateNetProfit(),
    amountReceivable: this.calculateAmountReceivable(),
  });
});

SaleSchema.methods.calculateTotalCharge = function () {
  const total = this.liabilityCharge + this.physicalDamageCharge + this.cargoCharge + this.wcGlUmbCharge + this.fees + this.permits + this.tips;
  return Number(total.toFixed(2));
};

SaleSchema.methods.calculateAmountReceivable = function () {
  const total = this.calculateTotalCharge() - this.chargesPaid;
  return Number(total.toFixed(2));
};

SaleSchema.methods.calculateSellerBonus = function () {
  const bonus = (this.calculateTotalCharge() * CommisionPercentages.SALE
    + this.fees * CommisionPercentages.FEES
    + this.permits * CommisionPercentages.PERMITS
    + this.tips * CommisionPercentages.TIPS);
  return Number(bonus.toFixed(2));
};

SaleSchema.methods.calculateGrossProfit = function () {
  const liabilityCommission = this.liabilityInsurer != null ? this.liabilityInsurer.liabilityCommission : CommisionPercentages.INSURER_DEFAULT;
  const cargoCommission = this.cargoInsurer != null ? this.cargoInsurer.cargoCommission : CommisionPercentages.INSURER_DEFAULT;
  const physicalDamageCommission = this.physicalDamageInsurer != null ? this.physicalDamageInsurer.physicalDamageCommission : CommisionPercentages.INSURER_DEFAULT;
  const wcGlUmbCommission = this.wcGlUmbInsurer != null ? this.wcGlUmbInsurer.wcGlUmbCommission : CommisionPercentages.INSURER_DEFAULT;

  const profit = this.liabilityCharge * liabilityCommission
    + this.cargoCharge * cargoCommission
    + this.physicalDamageCharge * physicalDamageCommission
    + this.wcGlUmbCharge * wcGlUmbCommission
    + this.fees + this.permits + this.tips;

  return Number(profit.toFixed(2));
};

SaleSchema.methods.calculateNetProfit = function () {
  return Number((this.calculateGrossProfit() - this.sellerBonus).toFixed(2));
};

const saleModelFn: (conn: Connection) => SaleModel = (conn: Connection) =>
  conn.model<Sale, SaleModel>('Sale', SaleSchema, 'sales');

export { Sale, SaleSchema, SaleModel, saleModelFn }
