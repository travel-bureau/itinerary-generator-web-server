import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();

    // Try to extract GraphQL context
    const gqlCtx = GqlExecutionContext.create(context);
    const info = gqlCtx.getInfo?.();

    if (info) {
      const fieldName = info.fieldName;
      return next.handle().pipe(
        tap(() => {
          console.log(`[GraphQL] ${fieldName} - ${Date.now() - now}ms`);
        }),
      );
    }

    // Fallback to HTTP context
    const req = context.switchToHttp().getRequest();
    if (req?.method && req?.url) {
      return next.handle().pipe(
        tap(() => {
          console.log(`[HTTP] ${req.method} ${req.url} - ${Date.now() - now}ms`);
        }),
      );
    }

    // Default fallback
    return next.handle();
  }
}

