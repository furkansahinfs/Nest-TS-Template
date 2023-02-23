import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { RegisterDTO, TokenDTO } from "src/dto";
import { Request, Response } from "express";
import { I18nService } from "nestjs-i18n";
import { GrantyTypes, HttpStatus } from "src/enums";
import { get } from "lodash";
import {
  comparePassword,
  encryptPassword,
  generateToken,
  verifyToken,
  ResponseBody,
  getJWTUsername,
  getJWTUserId,
} from "src/util";
import { UserService } from "./user.service";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private readonly i18n: I18nService,
  ) {}

  async login(dto: TokenDTO, request: Request, response: Response) {
    const granty_type = dto.granty_type;

    if (granty_type === GrantyTypes.PASSWORD) {
      const email = dto.username;
      const password = dto.password;
      return this.authenticateUserByPassword(email, password, response);
    }

    if (granty_type === GrantyTypes.REFRESH) {
      return this.authenticateUserByRefreshToken(request, response);
    }

    return response.status(HttpStatus.BAD_REQUEST).send(
      ResponseBody()
        .message({ error: this.i18n.translate("auth.invalid_granty_type") })
        .build(),
    );
  }

  async authenticateUserByPassword(
    email: string,
    password: string,
    response: Response,
  ) {
    const maybeUser = await this.userService.findByUsername(email);

    if (!maybeUser) {
      return response.status(HttpStatus.NOT_FOUND).send(
        ResponseBody()
          .message({ error: this.i18n.translate("auth.user_not_found") })
          .build(),
      );
    }

    if (await comparePassword(password, maybeUser.password)) {
      await this.prisma.user.update({
        where: {
          id: maybeUser.id,
        },
        data: {
          last_logged_in: new Date(Date.now()),
        },
      });

      return response.status(HttpStatus.OK).send(
        ResponseBody()
          .data({
            access_token: generateToken(
              { username: email, userId: maybeUser.id },
              "ACCESS_TOKEN_PRIVATE_KEY",
              { expiresIn: process.env.ACCESS_TOKEN_TIME },
            ),
            refresh_token: generateToken(
              { username: email, userId: maybeUser.id },
              "REFRESH_TOKEN_PRIVATE_KEY",
              { expiresIn: process.env.REFRESH_TOKEN_TIME },
            ),
          })
          .build(),
      );
    }
  }

  async authenticateUserByRefreshToken(request: Request, response: Response) {
    const refreshToken = get(request, "headers.x-refresh");
    const newTokens: false | { access_token: string; refresh_token: string } =
      await this.refreshAllTokens({ refreshToken: refreshToken.toString() });

    if (newTokens === false) {
      return response.status(HttpStatus.NOT_FOUND).send(
        ResponseBody()
          .message({ error: this.i18n.translate("auth.user_not_found") })
          .build(),
      );
    }

    return response
      .status(HttpStatus.OK)
      .send(ResponseBody().data(newTokens).build());
  }

  async register(dto: RegisterDTO, response: Response) {
    const username = dto.username;
    const encryptedPassword: string = await encryptPassword(dto.password);

    const maybeUser = await this.userService.findByUsername(username);

    if (encryptedPassword === "ERROR") {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(
        ResponseBody()
          .message({ error: this.i18n.translate("auth.status.unhandled") })
          .build(),
      );
    }

    if (maybeUser) {
      return response.status(HttpStatus.CONFLICT).send(
        ResponseBody()
          .message({ error: this.i18n.translate("auth.user_already_exists") })
          .build(),
      );
    }

    try {
      const user = await this.prisma.user.create({
        data: {
          email: username,
          password: encryptedPassword,
        },
        select: {
          email: true,
          id: true,
        },
      });

      return response
        .status(HttpStatus.OK)
        .send(ResponseBody().data(user).build());
    } catch (e) {
      return response;
    }
  }

  async refreshAllTokens({ refreshToken }: { refreshToken: string }) {
    try {
      const { decoded } = verifyToken(refreshToken, "REFRESH_TOKEN_PUBLIC_KEY");
      if (!decoded) {
        return false;
      }
      const username = await getJWTUsername(refreshToken);
      const userId = await getJWTUserId(refreshToken);
      if (!username || !userId) {
        return false;
      }
      const newAccessToken = generateToken(
        { username, userId: userId },
        "ACCESS_TOKEN_PRIVATE_KEY",
        { expiresIn: process.env.ACCESS_TOKEN_TIME },
      );
      const newRefreshToken = generateToken(
        { username, userId: userId },
        "REFRESH_TOKEN_PRIVATE_KEY",
        { expiresIn: process.env.REFRESH_TOKEN_TIME },
      );
      return { access_token: newAccessToken, refresh_token: newRefreshToken };
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
