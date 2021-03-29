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
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception.code === 11000) {
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
    }
  }
}
