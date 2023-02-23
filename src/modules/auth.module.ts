import { Module } from "@nestjs/common";
import { AuthController } from "src/controller";
import { AuthService } from "src/services";
import { PrismaService } from "src/services/prisma.service";

@Module({
  providers: [PrismaService, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
