import {
  Inject,
  Injectable,
  OnModuleInit
} from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateInsurerDto } from './create-insurer.dto';
import { Insurer } from 'database/insurer.model';
import { INSURER_MODEL } from 'database/database.constants';

@Injectable()
export class InsurerDataInitializerService
  implements OnModuleInit {

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
    @Inject(INSURER_MODEL) private insurerModel: Model<Insurer>,
  ) { }

  async onModuleInit(): Promise<void> {
    console.log('(InsuranceModule) is initialized...');
    await this.insurerModel.deleteMany({});
    await this.insurerModel.insertMany(this.insurerData).then((r) => console.log(r));
  }
}
