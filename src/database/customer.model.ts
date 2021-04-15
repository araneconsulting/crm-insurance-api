import { TruckingInfoDto } from 'insurance/customer/dto/trucking-info.dto';
import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { AddressDto } from 'shared/dto/address.dto';
import { CommunicationDto } from 'shared/dto/communication.dto';
import { UserDto } from 'user/dto/user.dto';
import { User } from './user.model';
interface Customer extends Document<any> {
  readonly address: AddressDto;
  readonly birthday: Date;
  readonly communication: CommunicationDto;
  readonly company: string;
  readonly createdBy?: Partial<User>;
  readonly email: string;
  readonly fax: string;
  readonly name: string;
  readonly phone: string;
  readonly type: string;
  readonly updatedBy?: Partial<User>;
  //EXTRA FIELDS
  readonly truckingInfo?: TruckingInfoDto;
}

type CustomerModel = Model<Customer>;

const CustomerSchema = new Schema<any>(
  {
    address: {
      type: SchemaTypes.Map,
      default: {
        address1: '',
        address2: '',
        city: '',
        state: '',
        country: 'US',
        zip: '',
      },
    },
    birthday: SchemaTypes.Date,
    communication: {
      type: SchemaTypes.Map,
      default: {
        email: true,
        sms: true,
        phone: false,
      },
    },
    company: { type: SchemaTypes.String, unique: true },
    createdBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },
    email: { type: SchemaTypes.String, unique: true },
    fax: SchemaTypes.String,
    name: { type: SchemaTypes.String, unique: true },
    phone: SchemaTypes.String,
    type: { type: SchemaTypes.String, default: 'BUSINESS' },
    updatedBy: { type: SchemaTypes.ObjectId, ref: 'User', required: false },

    //EXTRA FIELDS
    commercialInfo: {
      type: SchemaTypes.Map,
      default: {
        dot: '',
        type: '',
      },
    },
    
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

const customerModelFn: (conn: Connection) => CustomerModel = (
  conn: Connection,
) =>
  conn.model<Customer, CustomerModel>('Customer', CustomerSchema, 'customers');

export { Customer, CustomerSchema, customerModelFn };
