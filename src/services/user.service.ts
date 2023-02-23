import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { I18nService } from "nestjs-i18n";

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async findByUsername(username: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: username,
      },
      select: {
        email: true,
        password: true,
        id: true,
        last_logged_in: true,
      },
    });
    return user;
  }

  async findByUserId(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        email: true,
        password: true,
        id: true,
        last_logged_in: true,
      },
    });
    return user;
  }
}
