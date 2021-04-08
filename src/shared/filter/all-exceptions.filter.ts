import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {

    console.log(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      const e: Partial<HttpException> = exception;

      response.status(status).json({
        statusCode: e.getStatus(),
        message: e.getResponse()['message'],
        errorCode: e.getResponse()['error'],
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      response.status(status).json({
        statusCode: status,
        message: exception,
        errorCode: "INTERNAL_SERVER_ERROR",
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
