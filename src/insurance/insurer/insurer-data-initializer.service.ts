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
  ];

  constructor(
    @Inject(INSURER_MODEL) private insurerModel: Model<Insurer>,
  ) { }

  async onModuleInit(): Promise<void> {
    console.log('(InsurerModule) is initialized...');
    //await this.insurerModel.deleteMany({});
    //await this.insurerModel.insertMany(this.insurerData).then((r) => console.log(r));
  }
}
