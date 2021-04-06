import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { Company } from './company.model';
import { Location } from './location.model';
import { User } from './user.model';
interface Employee extends Document<any> {
  readonly active: boolean;
  readonly baseSalary: number;
  readonly company: Partial<Company>;
  readonly endedAt: string;
  readonly location: Partial<Location>;
  readonly position: string;
  readonly gender: string; //can be: male (M), female (F), transgender (T), other (O)
  readonly payFrequency: string; //can be: hourly (H), daily (D), monthly (M), Bi-weekly (B), Yearly (Y)
  readonly payRate: number;
  readonly overtimeAuthorized: boolean;
  readonly overtimePayRate: number;
  readonly salaryFormula: string;
  readonly startedAt: string;
  readonly supervisor: Partial<Employee>;
  readonly user: Partial<User>;
  readonly workPrimaryPhone: string;
  readonly workPrimaryPhoneExtension: string;
  readonly workSecondaryPhone: string;
  readonly workSecondaryPhoneExtension: string;
}

type EmployeeModel = Model<Employee>;

const EmployeeSchema = new Schema<any>(
  {
    active: { type: SchemaTypes.Boolean },
    baseSalary: { type: SchemaTypes.Number },
    company: { type: SchemaTypes.ObjectId, ref: 'Location', required: false },
    endedAt: { type: SchemaTypes.String },
    location: { type: SchemaTypes.ObjectId, ref: 'Location', required: false },
    position: { type: SchemaTypes.String },
    gender: { type: SchemaTypes.String }, //can be: male (M), female (F), transgender (T), other (O)
    payFrequency: { type: SchemaTypes.String }, //can be: hourly (H), daily (D), monthly (M), Bi-weekly (B), Yearly (Y)
    payRate: { type: SchemaTypes.Number },
    overtimeAuthorized: { type: SchemaTypes.Boolean },
    overtimePayRate: { type: SchemaTypes.Number },
    salaryFormula: { type: SchemaTypes.String },
    startedAt: { type: SchemaTypes.String },
    supervisor: { type: SchemaTypes.ObjectId, ref: 'Employee', required: false },
    user: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
    workPrimaryPhone: { type: SchemaTypes.String },
    workPrimaryPhoneExtension: { type: SchemaTypes.String },
    workSecondaryPhone: { type: SchemaTypes.String },
    workSecondaryPhoneExtension: { type: SchemaTypes.String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

const employeeModelFn: (conn: Connection) => EmployeeModel = (
  conn: Connection,
) =>
  conn.model<Employee, EmployeeModel>('Employee', EmployeeSchema, 'employees');
export { Employee, EmployeeModel, EmployeeSchema, employeeModelFn };
