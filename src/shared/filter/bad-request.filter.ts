import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";

@Catch()
export class BadRequestFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    response.status(400).json({message: exception.message});
  }
}