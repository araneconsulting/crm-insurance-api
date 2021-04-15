import { compare, genSaltSync, hash } from 'bcrypt';
import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { from, Observable } from 'rxjs';
import { ADMIN_ROLES, SELLER_ROLES } from 'shared/const/project-constants';
import { CommunicationDto } from 'shared/dto/communication.dto';
import { AddressDto } from 'shared/dto/address.dto';
import { RoleType } from '../shared/enum/role-type.enum';
import { Company } from './company.model';
import { EmployeeInfoDto } from 'shared/dto/employee-info.dto';
import { EmailSettingsDto } from 'user/dto/email-settings.dto';

interface User extends Document<any> {
  readonly address: AddressDto;
  readonly birthday: string;
  readonly communication: CommunicationDto;
  readonly email: string;
  readonly emailSettings: EmailSettingsDto;
  readonly firstName: string;
  readonly gender: string; //can be: male (M), female (F), transgender (T), other (O)
  readonly language: string;
  readonly lastName: string;
  readonly password: string;
  readonly mobilePhone: string;
  readonly phone: string;
  readonly roles: RoleType[];
  readonly startedAt: string;
  readonly timezone: string;
  readonly username: string;
  readonly website: string;
  
  //EMPLOYEE DATA (DEPENDS ON BUSINESS MODEL)
  readonly company: Partial<Company>;
  readonly employeeInfo: EmployeeInfoDto;
  readonly location: Partial<Location>;
  readonly supervisor: Partial<User>;
  
  comparePassword(password: string): Observable<boolean>;
}

type UserModel = Model<User>;

const UserSchema = new Schema<any>(
  {
    address: {
      type: SchemaTypes.Map,
      default: {
        address2: '',
        address1: '',
        city: '',
        state: '',
        country: 'US',
        zip: '',
      },
    },
    birthday: { type: SchemaTypes.Date },
    communication: {
      type: SchemaTypes.Map,
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
      type: SchemaTypes.Map,
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
    startedAt: { type: SchemaTypes.Date },
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
    employeeInfo: { type: SchemaTypes.ObjectId, ref: 'EmployeeInfo' },
    location: { type: SchemaTypes.ObjectId, ref: 'Location' },
    supervisor: { type: SchemaTypes.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

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

function nameGetHook(): string {
  return `${this.firstName} ${this.lastName}`;
}

UserSchema.virtual('name').get(nameGetHook);

function isAdminGetHook(): boolean {
  return ADMIN_ROLES.includes(this.roles[0]);
}

UserSchema.virtual('isAdmin').get(isAdminGetHook);

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
  nameGetHook,
  isAdminGetHook,
  isSellerGetHook,
  comparePasswordMethod,
  userModelFn,
};
