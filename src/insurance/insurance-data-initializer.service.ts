import {
  Inject,
  Injectable,
  OnModuleInit
} from '@nestjs/common';
import { Model } from 'mongoose';
import { CUSTOMER_MODEL, SALE_MODEL, INSURER_MODEL } from '../database/database.constants';
import { Customer } from '../database/customer.model';
import { CreateCustomerDto } from './create-customer.dto';
import { CreateInsurerDto } from './create-insurer.dto';
import { Sale } from 'database/sale.model';
import { Insurer } from 'database/insurer.model';

@Injectable()
export class InsuranceDataInitializerService
  implements OnModuleInit {


  private customerData: CreateCustomerDto[] = [
    {
      isCompany: true,
      name: 'FutureSoft',
      email: 'aliesky@example.com',
      phone: '832-555-5555'
    },
    {
      isCompany: true,
      name: 'World Records',
      email: 'ernesto@example.com',
      phone: '832-111-3333'
    },
    {
      isCompany: true,
      name: 'TED SuperStars',
      email: 'ernesto@example.com',
      phone: '832-222-8888'
    },
  ];

    /*
  readonly name: string,
  readonly name: string,
  readonly email: string,
  readonly phone: string
  readonly liabilityCommission: number,
  readonly cargoCommission: number,
  readonly physicalDamageCommission: number,
  readonly wcGlUmbCommission: number,
    */

  private insurerData: CreateInsurerDto[] = [
    {
      name: 'InsurancExcel LLC',
      email: 'insexcel@example.com',
      phone: '832-555-5555',
      liabilityCommission: 0.1,
      cargoCommission: 0.06,
      physicalDamageCommission: 0.1,
      wcGlUmbCommission: 0.1
    },
    {
      name: 'Triple-Sured LLC',
      email: '3sured@example.com',
      phone: '832-888-5335',
      liabilityCommission: 0.1,
      cargoCommission: 0.1,
      physicalDamageCommission: 0.08,
      wcGlUmbCommission: 0.1
    },
    {
      name: 'ComeSecure Inc.',
      email: 'comesecure@example.com',
      phone: '832-888-5335',
      liabilityCommission: 0.06,
      cargoCommission: 0.1,
      physicalDamageCommission: 0.1,
      wcGlUmbCommission: 0.04
    },
  ];

  constructor(
    @Inject(CUSTOMER_MODEL) private customerModel: Model<Customer>,
    @Inject(INSURER_MODEL) private insurerModel: Model<Insurer>,
    @Inject(SALE_MODEL) private saleModel: Model<Sale>,
  ) { }

  async onModuleInit(): Promise<void> {
    console.log('(InsuranceModule) is initialized...');
    await this.customerModel.deleteMany({});
    await this.insurerModel.deleteMany({});
    await this.saleModel.deleteMany({});
    await this.customerModel.insertMany(this.customerData).then((r) => console.log(r));
    await this.insurerModel.insertMany(this.insurerData).then((r) => console.log(r));
  }
}
