// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import express from 'express';
import cors from 'cors';

const server = express();
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['*'];
const corsData = {
      origin: allowedOrigins,
      credentials: true,
    };

server.use(
  cors(corsData)
);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    cors: corsData,
  });

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((err) =>
          Object.values(err.constraints || {}).join(', ')
        );
        return new BadRequestException(messages.join('; '));
      },
    })
  );

  if (process.env.NODE_ENV !== 'production') {
    await app.listen(3000);
  } else {
    await app.init(); // ✅ Required for serverless
  }
}

bootstrap();

// ✅ Export for Vercel
export default server;