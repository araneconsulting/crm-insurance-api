import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { SaleController } from './sale.controller';
import { SaleDataInitializerService } from './sale-data-initializer.service';
import { SaleService } from './sale.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SaleController],
  providers: [SaleService, SaleDataInitializerService],
})
export class SaleModule{}
//  implements NestModule {
//   configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
//     consumer
//       .apply(AuthenticationMiddleware)
//       .forRoutes(
//         { method: RequestMethod.POST, path: '/sales' },
//         { method: RequestMethod.PUT, path: '/sales/:id' },
//         { method: RequestMethod.DELETE, path: '/sales/:id' },
//       );
//   }
// }
