import { IsBoolean, IsNotEmpty } from 'class-validator';
export class UpdateCustomerDto {
  @IsBoolean()
  readonly isCompany: boolean;
  @IsNotEmpty()
  readonly name: string;
  @IsNotEmpty()
  readonly email: string;
  readonly phone: string;
}