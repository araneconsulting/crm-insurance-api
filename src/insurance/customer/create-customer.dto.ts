import { IsNotEmpty } from 'class-validator';
export class CreateCustomerDto {
  readonly isCompany: boolean;
  @IsNotEmpty()
  readonly name: string;
  @IsNotEmpty()
  readonly email: string;
  readonly phone: string;
}