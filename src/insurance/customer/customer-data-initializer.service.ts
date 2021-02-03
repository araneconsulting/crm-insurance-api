import {
  Inject,
  Injectable,
  OnModuleInit
} from '@nestjs/common';
import { Model } from 'mongoose';
import { CUSTOMER_MODEL, SALE_MODEL, INSURER_MODEL } from '../../database/database.constants';
import { Customer } from '../../database/customer.model';
import { CreateCustomerDto } from './create-customer.dto';
import { Sale } from 'database/sale.model';
import { Insurer } from 'database/insurer.model';

@Injectable()
export class CustomerDataInitializerService
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

  constructor(
    @Inject(CUSTOMER_MODEL) private customerModel: Model<Customer>,
    @Inject(SALE_MODEL) private saleModel: Model<Sale>,
  ) { }

  async onModuleInit(): Promise<void> {
    console.log('(InsuranceModule) is initialized...');
    await this.customerModel.deleteMany({});
    await this.saleModel.deleteMany({});
    await this.customerModel.insertMany(this.customerData).then((r) => console.log(r));
  }
}
