import { Module } from "@nestjs/common";
import { AppController, AuthController } from "src/controller";
import { AppService, AuthService } from "src/services";
import { PrismaService } from "src/services/prisma.service";
import * as path from "path";
import { I18nModule } from "nestjs-i18n";

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
  controllers: [AppController, AuthController],
  providers: [PrismaService, AppService, AuthService],
})
export class AppModule {}
