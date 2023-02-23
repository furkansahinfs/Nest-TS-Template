import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";
import * as dotenv from "dotenv";
import { ValidationPipe } from "@nestjs/common";
import { promiseMiddleware } from "./middleware/promise.middleware";

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.use(promiseMiddleware());
  await app.listen(process.env.PORT);
}
bootstrap();
