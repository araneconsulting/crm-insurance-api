import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
import { ApiResponse } from 'database/api-response.model';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  export interface Response<ApiResponse> {
    message: string;
    data: ApiResponse;
  }
  
  @Injectable()
  export class TransformInterceptor<T>
    implements NestInterceptor<ApiResponse, Response<ApiResponse>> {
    intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Observable<Response<ApiResponse>> {
      return next
        .handle()
        .pipe(
          map((data) => ({
            message: data.message,
            data: data.data,
            meta: {}
          })),
        );
    }
  }