import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MongoError } from 'mongodb';

@Catch(MongoError)
export class MongoFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost) {
    //console.log(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
/* 

    console.log(exception.errorLabels);
    console.log(exception.message);
    console.log(exception.code);
    console.log(exception.errmsg);
    console.log(JSON.stringify(exception)); */

    switch (exception.code) {
      case 11000:
        response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            "Element with same '" +
            Object.keys(exception['keyValue'])[0] +
            "' value already exists.",
          errorCode: 'ALREADY_EXISTS',
          data: {
            field: Object.keys(exception['keyValue'])[0],
            value: Object.values(exception['keyValue'])[0],
          },
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        break;

      case 139:
        response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message:
            'Unexpected error due to a missing reference to external object.',
          errorCode: 'MISSING_REFERENCE',
          data: {
            field: Object.keys(exception['keyValue'])[0],
            value: Object.values(exception['keyValue'])[0],
          },
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        break;
    }
  }
}
