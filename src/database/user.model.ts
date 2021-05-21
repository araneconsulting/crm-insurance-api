import { compare, genSaltSync, hash } from 'bcrypt';
import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { from, Observable } from 'rxjs';
import {
  ADMIN_ROLES,
  EXECUTIVE_ROLES,
  SELLER_ROLES,
  SUPER_ADMIN_ROLES,
} from 'shared/const/project-constants';
import {
  Communication,
  CommunicationSchema,
} from 'shared/sub-documents/communication';
import { Address, AddressSchema } from 'shared/sub-documents/address';
import { RoleType } from '../shared/enum/role-type.enum';
import { Company } from './company.model';
import { EmailSettings } from 'user/dto/email-settings';
import * as mongoSoftDelete from 'mongoosejs-soft-delete';
import {
  EmployeeInfo,
  EmployeeInfoSchema,
} from 'business/sub-docs/employee-info';
import { Location } from './location.model';
import { nanoid } from 'nanoid';

interface User extends Document<any> {
  readonly code: string;
  readonly address: Address;
  readonly dob: string;
  readonly communication: Communication;
  readonly email: string;
  readonly emailSettings: EmailSettings;
  readonly firstName: string;
  readonly gender: string; //can be: male (M), female (F), transgender (T), other (O)
  readonly language: string;
  readonly lastName: string;
  readonly password: string;
  readonly mobilePhone: string;
  readonly phone: string;
  readonly roles: RoleType[];
  readonly timezone: string;
  readonly username: string;
  readonly website: string;

  //EMPLOYEE DATA (DEPENDS ON BUSINESS MODEL)
  readonly company: Partial<Company>;
  readonly employeeInfo: EmployeeInfo;
  readonly supervisor: Partial<User>;
  readonly location: Partial<Location>;

  readonly createdBy: Partial<User>;
  readonly updatedBy: Partial<User>;

  comparePassword(password: string): Observable<boolean>;
}

type UserModel = Model<User>;

const UserSchema = new Schema<any>(
  {
    code: { type: SchemaTypes.String, default: () => nanoid(6), required: false },
    address: {
      type: AddressSchema,
      default: {
        address2: '',
        address1: '',
        city: '',
        state: '',
        country: 'US',
        zip: '',
      },
    },
    dob: { type: SchemaTypes.Date },
    communication: {
      type: CommunicationSchema,
      default: {
        email: true,
        sms: true,
        phone: false,
      },
    },
    email: {
      type: SchemaTypes.String,
      unique: true,
      required: true,
      dropDups: true,
    },
    emailSettings: {
      type: {
        emailNotification: SchemaTypes.Boolean,
        sendCopyToPersonalEmail: SchemaTypes.Boolean,
        activityRelatesEmail: {
          youHaveNewNotifications: SchemaTypes.Boolean,
          youAreSentADirectMessage: SchemaTypes.Boolean,
          locationTargetReached: SchemaTypes.Boolean,
          newTeamMember: SchemaTypes.Boolean,
          employeeTargetReached: SchemaTypes.Boolean,
        },
      },
      default: {
        emailNotification: true,
        sendCopyToPersonalEmail: false,
        activityRelatesEmail: {
          youHaveNewNotifications: false,
          youAreSentADirectMessage: false,
          locationTargetReached: false,
          newTeamMember: false,
          employeeTargetReached: true,
        },
      },
    },
    firstName: { type: SchemaTypes.String },
    gender: { type: SchemaTypes.String },
    language: { type: SchemaTypes.String, default: 'en' },
    lastName: { type: SchemaTypes.String },
    password: { type: SchemaTypes.String },
    mobilePhone: {
      type: SchemaTypes.String,
      unique: true,
      required: false,
      dropDups: true,
    },
    phone: { type: SchemaTypes.String, required: false },
    roles: [{ type: SchemaTypes.String }],
    timezone: { type: SchemaTypes.String, default: 'CDT' },
    username: {
      type: SchemaTypes.String,
      unique: true,
      required: true,
      dropDups: true,
    },
    website: { type: SchemaTypes.String },

    //EMPLOYEE DATA
    company: { type: SchemaTypes.ObjectId, ref: 'Company' },
    employeeInfo: { type: EmployeeInfoSchema, default: {} },
    supervisor: { type: SchemaTypes.ObjectId, ref: 'User' },
    location: { type: SchemaTypes.ObjectId, ref: 'Location' },
    createdBy: { type: SchemaTypes.ObjectId, ref: 'User' },
    updatedBy: { type: SchemaTypes.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

UserSchema.plugin(mongoSoftDelete);

async function preSaveHook(next) {
  // Only run this function if password was modified
  if (!this.isModified('password')) return next();

  // Hash the password
  const salt = genSaltSync();
  const password = await hash(this.password, salt);
  this.set('password', password);

  next();
}

UserSchema.pre<User>('save', preSaveHook);

UserSchema.pre('findOneAndUpdate', async function (this) {
  let update = { ...this.getUpdate() };

  // Only run this function if password was modified
  if (update.password) {
    // Hash the password
    const salt = genSaltSync();
    update.password = await hash(this.getUpdate().password, salt);
    this.setUpdate(update);
  }
});

function comparePasswordMethod(password: string): Observable<boolean> {
  return from(compare(password, this.password));
}

UserSchema.methods.comparePassword = comparePasswordMethod;

function fullNameGetHook(): string {
  return `${this.firstName} ${this.lastName}`;
}

UserSchema.virtual('fullname').get(fullNameGetHook);

function isAdminGetHook(): boolean {
  return ADMIN_ROLES.includes(this.roles[0]);
}

UserSchema.virtual('isAdmin').get(isAdminGetHook);

function isSuperAdminGetHook(): boolean {
  return SUPER_ADMIN_ROLES.includes(this.roles[0]);
}

UserSchema.virtual('isSuperAdmin').get(isSuperAdminGetHook);

function isExecutiveGetHook(): boolean {
  return EXECUTIVE_ROLES.includes(this.roles[0]);
}

UserSchema.virtual('isExecutive').get(isExecutiveGetHook);

function isSellerGetHook(): boolean {
  return SELLER_ROLES.includes(this.roles[0]);
}

UserSchema.virtual('isSeller').get(isSellerGetHook);

UserSchema.virtual('sales', {
  ref: 'Sale',
  localField: '_id',
  foreignField: 'seller',
});

const userModelFn: (conn: Connection) => UserModel = (conn: Connection) =>
  conn.model<User, UserModel>('User', UserSchema, 'users');

export {
  User,
  UserModel,
  UserSchema,
  preSaveHook,
  fullNameGetHook,
  isAdminGetHook,
  isExecutiveGetHook,
  isSuperAdminGetHook,
  isSellerGetHook,
  comparePasswordMethod,
  userModelFn,
};
