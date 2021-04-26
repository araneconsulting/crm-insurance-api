import {
  Inject,
  Injectable,
  OnModuleInit
} from '@nestjs/common';
import { CreatePayrollDto } from 'business/payroll/dto/create-payroll.dto';
import { Model } from 'mongoose';
import { PAYROLL_MODEL } from '../../database/database.constants';
import { Payroll } from '../../database/payroll.model';

@Injectable()
export class PayrollDataInitializerService
  implements OnModuleInit {


  private payrollData: CreatePayrollDto[] = [
  ];

  constructor(
    @Inject(PAYROLL_MODEL) private payrollModel: Model<Payroll>,
  ) { }

  async onModuleInit(): Promise<void> {
    console.log('(PayrollModule) is initialized...');
  }
}
