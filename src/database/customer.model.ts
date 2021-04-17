import { BusinessInfoDto } from 'business-management/company/dto/company.dto';
import { TruckingInfoDto } from 'insurance/customer/dto/trucking-info.dto';
import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { AddressDto } from 'shared/dto/address.dto';
import { CommunicationDto } from 'shared/dto/communication.dto';
import { ContactInfoDto } from 'shared/dto/contact-info.dto';
import { User } from './user.model';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';
interface Customer extends Document<any> {
  readonly company: BusinessInfoDto;
  readonly contact: ContactInfoDto;
  readonly communication: CommunicationDto;
  readonly createdBy?: Partial<User>;
  readonly type: string;
  readonly updatedBy?: Partial<User>;
}

type CustomerModel = Model<Customer>;

const CustomerSchema = new Schema<any>(
  {
    company: {
      type: SchemaTypes.Map,
    },
    contact: {
      type: SchemaTypes.Map,
    },
    communication: {
      type: SchemaTypes.Map,
      default: {
        email: true,
        sms: true,
        phone: false,
      },
    },
    createdBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
    type: { type: SchemaTypes.String, default: 'BUSINESS' },
    updatedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

CustomerSchema.plugin(mongoSoftDelete);



const customerModelFn: (conn: Connection) => CustomerModel = (
  conn: Connection,
) =>
  conn.model<Customer, CustomerModel>('Customer', CustomerSchema, 'customers');

export { Customer, CustomerSchema, customerModelFn };
