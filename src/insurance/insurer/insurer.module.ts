import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { InsurerController } from './insurer.controller';
import { InsurerDataInitializerService } from './insurer-data-initializer.service';
import { InsurerService } from './insurer.service';

@Module({
  imports: [DatabaseModule],
  controllers: [InsurerController],
  providers: [InsurerService, InsurerDataInitializerService],
})
export class InsurerModule{}
//  implements NestModule {
//   configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
//     consumer
//       .apply(AuthenticationMiddleware)
//       .forRoutes(
//         { method: RequestMethod.POST, path: '/insurers' },
//         { method: RequestMethod.PUT, path: '/insurers/:id' },
//         { method: RequestMethod.DELETE, path: '/insurers/:id' },
//       );
//   }
// }
