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
    const response = host.switchToHttp().getResponse();
    console.log(exception);
    if (exception.code === 11000) {
      response
        .status(400)
        .json({
          message: 'Element with same \''+Object.keys(exception['keyValue'])[0]+'\' value already exists.',
          errorCode: 'ALREADY_EXISTS',
          field: Object.keys(exception['keyValue'])[0],
          value: Object.values(exception['keyValue'])[0],
        });
    } else {
      response.status(500).json({ message: 'Internal error.' });
    }
  }
}
