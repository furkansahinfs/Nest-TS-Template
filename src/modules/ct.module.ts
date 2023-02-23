import { Module } from "@nestjs/common";
import { CTProductController } from "src/controller";
import { CTProductService } from "src/services";
import { PrismaService } from "src/services/prisma.service";

@Module({
  providers: [PrismaService, CTProductService],
  controllers: [CTProductController],
})
export class CommercetoolsModule {}
