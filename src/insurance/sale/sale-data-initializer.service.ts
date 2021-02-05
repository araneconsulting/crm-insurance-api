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

@Injectable()
export class SaleDataInitializerService
  implements OnModuleInit {


    private saleData: CreateSaleDto[] = [
    {
      soldAt: "01-30-2020",
      customer: {_id: '601a26fcd7789d2050a3d839',},
      seller: {_id: '601a26fcd7789d2050a3d839',},
      liabilityInsurer: {_id: '601c9249b9a289b301b5c723',},
      liabilityCharge: 1040.50,
      cargoInsurer: {_id: '601c9249b9a289b301b5c723',},
      cargoCharge: 240.40,
      physicalDamageInsurer: {_id: '601c9249b9a289b301b5c723',},
      physicalDamageCharge: 400.00,
      wcGlUmbInsurer: {_id: '601c9249b9a289b301b5c723',},
      wcGlUmbCharge: 540.00,
      fees: 230,
      permits: 120,
      tips: 20,
      chargesPaid: 1400.00,
      totalCharge: 0,
      sellerBonus: 0,
      grossProfit: 0,
      netProfit: 0,
      amountReceivable: 0,
    },
    {
      soldAt: "02-20-2020",
      customer: {_id: '601a26fcd7789d2050a3d839',},
      seller: {_id: '601a26fcd7789d2050a3d839',},
      liabilityInsurer: {_id: '601c9249b9a289b301b5c723',},
      liabilityCharge: 1000.50,
      cargoInsurer: {_id: '601c9249b9a289b301b5c723',},
      cargoCharge: 200.50,
      physicalDamageInsurer: {_id: '601c9249b9a289b301b5c723',},
      physicalDamageCharge: 300.00,
      wcGlUmbInsurer: {_id: '601c9249b9a289b301b5c723',},
      wcGlUmbCharge: 500.00,
      fees: 200,
      permits: 100,
      tips: 50,
      chargesPaid: 1200.00,
      totalCharge: 0,
      sellerBonus: 0,
      grossProfit: 0,
      netProfit: 0,
      amountReceivable: 0,
    },
    {
      soldAt: "01-30-2021",
      customer: {_id: '601a26fcd7789d2050a3d839',},
      seller: {_id: '601a26fcd7789d2050a3d839',},
      liabilityInsurer: {_id: '601c9249b9a289b301b5c723',},
      liabilityCharge: 3000.50,
      cargoInsurer: {_id: '601c9249b9a289b301b5c723',},
      cargoCharge: 500.50,
      physicalDamageInsurer: {_id: '601c9249b9a289b301b5c723',},
      physicalDamageCharge: 100.00,
      wcGlUmbInsurer: {_id: '601c9249b9a289b301b5c723',},
      wcGlUmbCharge: 200.00,
      fees: 500,
      permits: 150,
      tips: 30,
      chargesPaid: 1130.00,
      totalCharge: 0,
      sellerBonus: 0,
      grossProfit: 0,
      netProfit: 0,
      amountReceivable: 0,
    },
  ];

  constructor(
    @Inject(SALE_MODEL) private saleModel: Model<Sale>,
    @Inject(CUSTOMER_MODEL) private customerModel: Model<Customer>,
    @Inject(INSURER_MODEL) private insurerModel: Model<Insurer>,
    @Inject(USER_MODEL) private userModel: Model<User>,
  ) { }

  async onModuleInit(): Promise<void> {
    console.log('(InsuranceModule) is initialized...');
    //let customer: Customer = await this.customerModel.find()[0];

    await this.saleModel.deleteMany({});
    await this.saleModel.insertMany(this.saleData).then((r) => console.log(r));
  }
}
