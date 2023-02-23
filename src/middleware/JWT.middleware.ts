import { get } from "lodash";
import { Request, Response } from "express";
import { getJWTUserId, ResponseBody, verifyToken } from "src/util";
import { UserService } from "src/services";
import { Injectable, NestMiddleware } from "@nestjs/common";
import { UnauthorizedError } from "src/error";
import { HttpStatus } from "src/enums";
import { I18nService } from "nestjs-i18n";

@Injectable()
export class JWTMiddleware implements NestMiddleware {
  constructor(
    private readonly userService: UserService,
    private readonly i18n: I18nService,
  ) {}

  async use(req: Request | any, res: Response, next: () => void) {
    const bearerHeader = req.headers.authorization;
    const accessToken = bearerHeader && bearerHeader.split(" ")[1];
    const refreshToken = get(req, "headers.x-refresh");

    let user;

    if (!bearerHeader || !accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).send(
        ResponseBody()
          .message({
            error: this.i18n.translate("auth.status.unauthorized"),
          })
          .build(),
      );
    }

    const { decoded, expired } = verifyToken(
      accessToken,
      "ACCESS_TOKEN_PUBLIC_KEY",
    );

    if (decoded && expired && refreshToken) {
      try {
        const userId = await getJWTUserId(refreshToken);
        user = await this.userService.findByUserId(userId);
      } catch (error) {
        throw new UnauthorizedError();
      }
    }

    if (user) {
      req.user = user;
    }
    next();
  }
}
