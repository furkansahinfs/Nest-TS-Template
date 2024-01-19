import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { I18nService } from "nestjs-i18n";
import { GetUsersFilterDTO } from "src/dto";
import { ResponseBody, getJWTUserId } from "src/util";
import { UserRepository } from "src/repository";
import { IResponse, User } from "src/types";
import { get } from "lodash";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private userRepository: UserRepository,
    private readonly i18n: I18nService,
    @Inject(REQUEST) protected readonly request: Request,
  ) {}

  async getUsers(dto: GetUsersFilterDTO): Promise<IResponse<User | User[]>> {
    if (dto?.userId || dto?.username) {
      return await this.getUserWithFilter(dto);
    }
    const users = await this.userRepository.getUsers(dto);
    return ResponseBody().status(HttpStatus.OK).data(users).build();
  }

  async getMe(): Promise<IResponse<User>> {
    const user: User | undefined = await this.getAuthenticatedUser();
    if (user) {
      return ResponseBody().status(HttpStatus.OK).data(user).build();
    }

    return ResponseBody()
      .status(HttpStatus.NOT_FOUND)
      .message({ error: this.i18n.translate("user.user_not_found") })
      .build();
  }

  private async getUserWithFilter(
    dto: GetUsersFilterDTO,
  ): Promise<IResponse<User>> {
    const user: User | undefined = dto?.userId
      ? await this.userRepository.findByUserId(dto.userId)
      : dto?.username
      ? await this.userRepository.findByUsername(dto.username)
      : undefined;
    if (user) {
      return ResponseBody().status(HttpStatus.OK).data(user).build();
    }

    return ResponseBody()
      .status(HttpStatus.NOT_FOUND)
      .message({ error: this.i18n.translate("user.user_not_found") })
      .build();
  }

  private async getAuthenticatedUser(): Promise<User> {
    const accessTokenStr = get(this.request, "headers.authorization");
    const accessToken = accessTokenStr?.replace("Bearer ", "");
    const userId: string = getJWTUserId(accessToken, "ACCESS_TOKEN_PUBLIC_KEY");
    return await this.userRepository.findByUserId(userId, { password: true });
  }

  async getUserWithId(userId: string): Promise<User> {
    return await this.userRepository.findByUserId(userId);
  }

  async getUserWithUsername(username: string): Promise<User> {
    return await this.userRepository.findByUsername(username);
  }
}
