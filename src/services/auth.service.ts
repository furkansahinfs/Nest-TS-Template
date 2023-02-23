import { generateAccessToken } from "../util/jwt.util";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { RegisterDTO, TokenDTO } from "src/dto";
import { Response } from "express";
import { I18nService } from "nestjs-i18n";
import { HttpStatus } from "src/enums";
import { comparePassword, encryptPassword, ResponseBody } from "src/util";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async authenticate(dto: TokenDTO, response: Response) {
    const email = dto.email;
    const password = dto.password;
    const granty_type = dto.granty_type;

    if (!granty_type || granty_type !== "password") {
      return response.status(HttpStatus.BAD_REQUEST).send(
        ResponseBody()
          .message({ error: this.i18n.translate("auth.invalid_granty_type") })
          .build(),
      );
    }

    const maybeUser = await this.getUser(email);

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
            access_token: generateAccessToken(
              { email, userId: maybeUser.id },
              "ACCESS_TOKEN_PRIVATE_KEY",
            ),
          })
          .build(),
      );
    }
  }

  async register(dto: RegisterDTO, response: Response) {
    const username = dto.email;
    const encryptedPassword: string = await encryptPassword(dto.password);

    const maybeUser = await this.getUser(username);

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
      console.log(JSON.stringify(user));
      return response
        .status(HttpStatus.OK)
        .send(ResponseBody().data(user).build());
    } catch (e) {
      return response;
    }
  }

  async getUser(username: string) {
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
}
