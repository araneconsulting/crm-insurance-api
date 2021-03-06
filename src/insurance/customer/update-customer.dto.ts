import { IsBoolean, IsNotEmpty } from 'class-validator';
export class UpdateCustomerDto {
  readonly name: string;
  readonly email: string;
  readonly company: string;
  readonly address: string;
  readonly city: string;
  readonly state: string;
  readonly country: string;
  readonly zip: string;
  readonly fax: string;
  readonly dot: string;
  readonly phone: string;

}
