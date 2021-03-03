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

    /*
    await this.userModel.deleteMany({});

    const admin = {
      username: 'admin',
      firstName: 'System',
      lastName: '',
      password: 'password',
      email: 'admin@araneconsulting.com',
      roles: [RoleType.ADMIN],
      location: 'USA',
      position: 'SYSTEM_ADMINISTRATOR',
      baseSalary: 800,
    };
    await Promise.all(
      [
        this.userModel.create(admin)
      ]
    ).then(
      data => console.log(data)
    ); 
    */
    
  }

}
