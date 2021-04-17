import {
  Inject,
  Injectable,
  OnModuleInit
} from '@nestjs/common';
import { Model } from 'mongoose';
import { LOCATION_MODEL } from '../../database/database.constants';
import { Location } from '../../database/location.model';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationDataInitializerService
  implements OnModuleInit {


  private locationData: CreateLocationDto[] = [
  ];

  constructor(
    @Inject(LOCATION_MODEL) private locationModel: Model<Location>,
  ) { }

  async onModuleInit(): Promise<void> {
    console.log('(LocationModule) is initialized...');
  }
}
