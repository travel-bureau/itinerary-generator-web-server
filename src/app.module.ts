import { TripModule } from './trip/trip.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RequestLoggerMiddleware } from './common/middlewares/request-logger.middleware';
import { StripNullDataPlugin } from './common/interceptors/error.interceptor';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src', 'assets'),
      serveRoot: '/static', // optional prefix
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
      },
      buildSchemaOptions: {
        directives: [],
      },
      sortSchema: true,
      path: '/graphql',
      playground: true,
      formatError: (error) => {
        console.log(error);
        const cleanedMessage = error.message
          .replace(/\\\"/g, '"')   // unescape inner quotes
          .replace(/\"([^\"]+)\"/g, '$1') // remove outer quotes around values
          .replace(/\\\$/g, '$')   // unescape $ sign
          .replace(/\$/g, '$')    // ensure $ is preserved
          .replace(/days days$/, 'days');

        const trimmedMessage = cleanedMessage.includes(';')
          ? cleanedMessage.split(';')[1].trim()
          : cleanedMessage.trim();

        return {
          message: trimmedMessage,
        };
      },
      plugins: [StripNullDataPlugin],
    }),
    TripModule,
    DatabaseModule
  ],
  providers: [AppResolver],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}