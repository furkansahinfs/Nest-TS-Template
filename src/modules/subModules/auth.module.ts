import { Module } from "@nestjs/common";
import { AuthController, UserController } from "src/controller";
import {
  AuthService,
  CTCustomerService,
  PrismaService,
  UserService,
} from "src/services";
import * as path from "path";
import { AcceptLanguageResolver, I18nModule } from "nestjs-i18n";
import { ResponseStatusInterceptor } from "src/middleware";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { UserRepository } from "src/repository";

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: "en",
      loaderOptions: {
        path: path.join(__dirname, "/../../i18n/"),
        watch: true,
      },
      resolvers: [AcceptLanguageResolver],
    }),
  ],
  controllers: [AuthController, UserController],
  providers: [
    AuthService,
    CTCustomerService,
    UserRepository,
    UserService,
    PrismaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseStatusInterceptor,
    },
  ],
})
export class AuthModule {}
