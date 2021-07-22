import { IsBoolean, IsBooleanString } from "class-validator";
import { Schema, SchemaTypes } from "mongoose";

export class Communication {
  @IsBoolean()
  readonly email: boolean;

  @IsBoolean()
  readonly sms: boolean;

  @IsBoolean()
  readonly phone: boolean;
}

export const CommunicationSchema = new Schema<any>({
  email: { type: SchemaTypes.Boolean },
  sms: { type: SchemaTypes.Boolean },
  phone: { type: SchemaTypes.Boolean },
});

