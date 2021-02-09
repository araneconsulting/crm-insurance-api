import {
  Inject,
  Injectable,
  OnModuleInit
} from '@nestjs/common';
import { Model, SchemaType } from 'mongoose';
import { CreateSaleDto } from './create-sale.dto';
import { Sale } from 'database/sale.model';
import { INSURER_MODEL, SALE_MODEL, USER_MODEL } from 'database/database.constants';
import { Customer } from 'database/customer.model';
import { CUSTOMER_MODEL } from 'database/database.constants';
import { Insurer } from 'database/insurer.model';
import { User } from 'database/user.model';
import { Observable } from 'rxjs';
import * as moment from 'moment';

@Injectable()
export class SaleDataInitializerService
  implements OnModuleInit {


    private saleData: CreateSaleDto[] = [
    
  ];

  constructor(
    @Inject(SALE_MODEL) private saleModel: Model<Sale>,
    @Inject(CUSTOMER_MODEL) private customerModel: Model<Customer>,
    @Inject(INSURER_MODEL) private insurerModel: Model<Insurer>,
    @Inject(USER_MODEL) private userModel: Model<User>,
  ) { }

  async onModuleInit(): Promise<void> {
    console.log('(InsuranceModule) is initialized...');
    //await this.saleModel.deleteMany({});
    //await this.saleModel.insertMany(this.saleData).then((r) => console.log(r));
  }
}
