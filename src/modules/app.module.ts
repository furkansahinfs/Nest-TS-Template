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
  CTProductService,
  UserService,
} from "src/services";
import { PrismaService } from "src/services/prisma.service";
import * as path from "path";
import { I18nModule } from "nestjs-i18n";
import { JWTMiddleware } from "src/middleware";
import { UserController } from "src/controller/user.controller";
import { CTCartController } from "src/controller/commercetools/ct.cart.controller";

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
    CTProductController,
    UserController,
  ],
  providers: [
    PrismaService,
    AppService,
    AuthService,
    CTCartService,
    CTCustomerService,
    CTProductService,
    UserService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JWTMiddleware)
      .exclude("/auth/login", "/auth/register")
      .forRoutes("/");
  }
}
