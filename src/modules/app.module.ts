import { MiddlewareConsumer, Module } from "@nestjs/common";
import { AppController } from "src/controller";
import { AppService, PrismaService, UserService } from "src/services";
import * as path from "path";
import { I18nModule } from "nestjs-i18n";
import { JWTMiddleware, ResponseStatusInterceptor } from "src/middleware";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import {
  AuthModule,
  CartModule,
  CustomerModule,
  OrderModule,
  ProductModule,
} from "./subModules";
import { UserRepository } from "src/repository";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: "en",
      loaderOptions: {
        path: path.join(__dirname, "../i18n/"),
        watch: true,
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    CartModule,
    CustomerModule,
    OrderModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UserService,
    PrismaService,
    UserRepository,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseStatusInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JWTMiddleware)
      .exclude("/auth/login", "/auth/register", "/products", "/customers/new")
      .forRoutes("/");
  }
}
