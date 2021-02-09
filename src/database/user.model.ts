import { compare, hash } from 'bcrypt';
import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { from, Observable } from "rxjs";
import { LocationType } from 'shared/enum/location-type.enum';
import { PositionType } from 'shared/enum/position-type.enum';
import { RoleType } from '../shared/enum/role-type.enum';
interface User extends Document<any> {
  comparePassword(password: string): Observable<boolean>;
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly roles: RoleType[];
  readonly location: LocationType;
  readonly position: PositionType;
  readonly baseSalary: number;
  readonly saleBonusPercentage: number;
}

type UserModel = Model<User>;

const UserSchema = new Schema<any>(
  {
    username: SchemaTypes.String,
    password: SchemaTypes.String,
    email: SchemaTypes.String,
    firstName: { type: SchemaTypes.String, required: false },
    lastName: { type: SchemaTypes.String, required: false },
    phone: { type: SchemaTypes.String, required: false },
    location: { type: SchemaTypes.String, enum: ['MEXICO', 'USA'], required: true },
    position: { type: SchemaTypes.String, enum: ['MANAGER', 'SALES_CONSULTANT', 'SALES_AGENT', 'OTHER','SYSTEM_ADMINISTRATOR'], required: true },
    baseSalary: SchemaTypes.Number,
    saleBonusPercentage: SchemaTypes.Number,
    roles: [
      { type: SchemaTypes.String, enum: ['ADMIN', 'USER'], required: false },
    ],
    createdAt: { type: SchemaTypes.Date, required: false },
    updatedAt: { type: SchemaTypes.Date, required: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true
    }
  },
);

// see: https://wanago.io/2020/05/25/api-nestjs-authenticating-users-bcrypt-passport-jwt-cookies/
// and https://stackoverflow.com/questions/48023018/nodejs-bcrypt-async-mongoose-login
async function preSaveHook(next) {

  // Only run this function if password was modified
  if (!this.isModified('password')) return next();

  // Hash the password
  const password = await hash(this.password, 12);
  this.set('password', password);

  next();
}

UserSchema.pre<User>('save', preSaveHook);

function comparePasswordMethod(password: string): Observable<boolean> {
  return from(compare(password, this.password));
}

UserSchema.methods.comparePassword = comparePasswordMethod;

function nameGetHook() {
  return `${this.firstName} ${this.lastName}`;
}

UserSchema.virtual('name').get(nameGetHook);

UserSchema.virtual('sales', {
  ref: 'Sale',
  localField: '_id',
  foreignField: 'seller',
});

const userModelFn: (conn: Connection) => UserModel = (conn: Connection) =>
  conn.model<User, UserModel>('User', UserSchema, 'users');

export { User, UserModel, UserSchema, preSaveHook, nameGetHook, comparePasswordMethod, userModelFn };
