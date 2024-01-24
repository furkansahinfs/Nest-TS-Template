import { Injectable } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";
import { I18nService } from "nestjs-i18n";
import { GetUsersFilterDTO, RegisterDTO } from "src/dto";
import { ROLES } from "src/enums";
import { conf } from "src/config";
import { User as PrismaUser } from "@prisma/client";
import { User } from "src/types";

@Injectable()
export class UserRepository {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  public async getUsers(filterDto: GetUsersFilterDTO): Promise<User[]> {
    const users: {
      email: string;
      id: string;
      last_logged_in: Date;
    }[] = await this.prisma.user.findMany({
      select: {
        email: true,
        id: true,
        last_logged_in: true,
      },
      orderBy: {
        id: "desc",
      },
      take: filterDto?.limit ? parseInt(filterDto.limit) : undefined,
      skip: filterDto?.offset ? parseInt(filterDto.offset) : undefined,
    });

    return users;
  }

  public async findByUsername(
    username: string,
    exclude?: { password: true },
  ): Promise<User> {
    const user: User = await this.prisma.user.findFirst({
      where: {
        email: username,
      },
      select: {
        email: true,
        password: exclude?.password ?? true,
        id: true,
        last_logged_in: true,
        role: true,
        ct_customer_id: true,
      },
    });

    if (user?.role) {
      user.role = user.role.replace(conf.ROLE_KEY, "");
    }

    return user;
  }

  public async findByUserId(
    userId: string,
    exclude?: { password: true },
  ): Promise<User> {
    const user: User = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        email: true,
        password: exclude?.password ?? true,
        id: true,
        last_logged_in: true,
        role: true,
        ct_customer_id: true,
      },
    });

    if (user?.role) {
      user.role = user.role.replace(conf.ROLE_KEY, "");
    }
    return user;
  }

  public async saveUser(
    dto: RegisterDTO,
    encryptedPassword: string,
  ): Promise<User> {
    const { email, firstName, lastName } = dto;
    return this.prisma.user.create({
      data: {
        email,
        password: encryptedPassword,
        firstName: firstName,
        lastName: lastName,
        role: dto.role ?? ROLES.USER,
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        id: true,
      },
    });
  }

  public async deleteUser(email: string) {
    await this.prisma.user.delete({
      where: {
        email: email,
      },
    });
  }

  //TODO describe data prisma type
  public async updateUser(userId: string, data): Promise<PrismaUser> {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data,
    });
  }
}
