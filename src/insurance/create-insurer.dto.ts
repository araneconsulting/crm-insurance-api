import { IsNotEmpty, IsNumber } from 'class-validator';
import { Observable } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/operators';
export class CreateInsurerDto {
  @IsNotEmpty()
  readonly name: string;
  @IsNotEmpty()
  readonly email: string;
  @IsNotEmpty()
  readonly phone: string;
  @IsNumber()
  readonly liabilityCommission: number;
  @IsNumber()
  readonly cargoCommission: number;
  @IsNumber()
  readonly physicalDamageCommission: number;
  @IsNumber()
  readonly wcGlUmbCommission: number;
}