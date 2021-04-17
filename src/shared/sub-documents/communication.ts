import { IsBoolean, IsBooleanString } from "class-validator";

export class Communication extends Map<any, any> {
  @IsBoolean()
  readonly email: boolean;

  @IsBoolean()
  readonly sms: boolean;

  @IsBoolean()
  readonly phone: boolean;
}
