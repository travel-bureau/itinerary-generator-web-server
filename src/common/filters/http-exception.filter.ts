import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctxType = host.getType();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    if (ctxType === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
      });
    } else {
      // GraphQL context — rethrow as error
      throw new Error(message);
    }
  }
}