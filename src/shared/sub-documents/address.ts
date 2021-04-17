import { IsNotEmpty, IsOptional } from 'class-validator';

export class Address extends Map<any, any> {
  @IsNotEmpty()
  readonly address1: string;

  @IsOptional()
  @IsNotEmpty()
  readonly address2: string;

  @IsNotEmpty()
  readonly city: string;

  @IsOptional()
  @IsNotEmpty()
  readonly county: string;

  @IsNotEmpty()
  readonly state: string;

  @IsNotEmpty()
  readonly country: string;

  @IsNotEmpty()
  readonly zip: string;
}
