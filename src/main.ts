import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AllExceptionsFilter } from 'shared/filter/all-exceptions.filter';
import { HttpExceptionFilter } from 'shared/filter/http-exception.filter';
import { AppModule } from './app.module';
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // enable shutdown hooks explicitly.
  app.enableShutdownHooks();

  app.useGlobalPipes(new ValidationPipe());
  
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors();
  //app.useLogger();
  const port: number = parseInt(`${process.env.PORT}`) || 5000;
  await app.listen(port);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
