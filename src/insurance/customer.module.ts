import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { InsuranceDataInitializerService } from './insurance-data-initializer.service';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CustomerController],
  providers: [CustomerService, InsuranceDataInitializerService],
})
export class CustomerModule{}
//  implements NestModule {
//   configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
//     consumer
//       .apply(AuthenticationMiddleware)
//       .forRoutes(
//         { method: RequestMethod.POST, path: '/customers' },
//         { method: RequestMethod.PUT, path: '/customers/:id' },
//         { method: RequestMethod.DELETE, path: '/customers/:id' },
//       );
//   }
// }
