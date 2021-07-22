import {
  Inject,
  Injectable,
  OnModuleInit
} from '@nestjs/common';
import { Model } from 'mongoose';
import { COMPANY_MODEL } from '../../database/database.constants';
import { Company } from '../../database/company.model';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompanyDataInitializerService
  implements OnModuleInit {


  private companyData: CreateCompanyDto[] = [
  ];

  constructor(
    @Inject(COMPANY_MODEL) private companyModel: Model<Company>,
  ) { }

  async onModuleInit(): Promise<void> {
    console.log('(CompanyModule) is initialized...');
  }
}
