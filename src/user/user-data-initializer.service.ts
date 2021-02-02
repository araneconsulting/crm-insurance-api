import {
  Inject,
  Injectable,
  OnModuleInit
} from '@nestjs/common';
import { Model } from 'mongoose';
import { USER_MODEL } from '../database/database.constants';
import { RoleType } from '../shared/enum/role-type.enum';
import { User } from '../database/user.model';

@Injectable()
export class UserDataInitializerService
  implements OnModuleInit {
  constructor(@Inject(USER_MODEL) private userModel: Model<User>) { }

  async onModuleInit(): Promise<void> {
    console.log('(UserModule) is initialized...');
    await this.userModel.deleteMany({});
    const user = {
      username: 'liuver',
      firstName: 'Liuver',
      lastName: 'Duran',
      password: 'password',
      email: 'liuver@example.com',
      roles: [RoleType.USER],
      location: 'MEXICO',
      position: 'SALES_AGENT',
      baseSalary: 400,
      saleBonusPercentage: 0.01,
    };

    const admin = {
      username: 'admin',
      firstName: 'Edgar',
      lastName: 'Barzaga',
      password: 'password',
      email: 'admin@example.com',
      roles: [RoleType.ADMIN],
      location: 'USA',
      position: 'MANAGER',
      baseSalary: 800,
      saleBonusPercentage: 0.01,
    };
    await Promise.all(
      [
        this.userModel.create(user),
        this.userModel.create(admin)
      ]
    ).then(
      data => console.log(data)
    );
  }

}
