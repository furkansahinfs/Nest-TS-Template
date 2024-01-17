import { MiddlewareConsumer, Module } from "@nestjs/common";
import {
  AppController,
  AuthController,
  CTCustomerController,
  CTProductController,
} from "src/controller";
import {
  AppService,
  AuthService,
  CTCartService,
  CTCustomerService,
  CTOrderService,
  CTProductService,
  UserService,
} from "src/services";
import { PrismaService } from "src/services/prisma.service";
import * as path from "path";
import { I18nModule } from "nestjs-i18n";
import { JWTMiddleware, ResponseStatusInterceptor } from "src/middleware";
import { UserController } from "src/controller/user.controller";
import { CTCartController } from "src/controller/commercetools/ct.cart.controller";
import { CTOrderController } from "src/controller/commercetools/ct.order.controller";
import { UserRepository } from "src/repository";
import { APP_INTERCEPTOR } from "@nestjs/core";

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: "en",
      loaderOptions: {
        path: path.join(__dirname, "../i18n/"),
        watch: true,
      },
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    CTCartController,
    CTCustomerController,
    CTOrderController,
    CTProductController,
    UserController,
  ],
  providers: [
    PrismaService,
    AppService,
    AuthService,
    CTCartService,
    CTCustomerService,
    CTOrderService,
    CTProductService,
    UserService,
    UserRepository,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseStatusInterceptor,
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
