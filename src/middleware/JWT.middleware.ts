import { get } from "lodash";
import { Request, Response } from "express";
import { getJWTUserId, ResponseBody, verifyToken } from "src/util";
import { UserService } from "src/services";
import { HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";

@Injectable()
export class JWTMiddleware implements NestMiddleware {
  constructor(
    private readonly userService: UserService,
    private readonly i18n: I18nService,
  ) {}

  async use(req: Request | any, res: Response, next: () => void) {
    const accessToken = req.headers.authorization;
    const refreshToken = get(req, "headers.x-refresh");

    let user;

    if (!accessToken || !refreshToken) {
      return res.status(HttpStatus.UNAUTHORIZED).send(
        ResponseBody()
          .status(HttpStatus.UNAUTHORIZED)
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
    //TODO - look at the condition
    if ((expired && refreshToken) || decoded) {
      try {
        const userId = await getJWTUserId(refreshToken);
        user = await this.userService.findByUserId(userId);
      } catch (error) {
        return res.status(HttpStatus.UNAUTHORIZED).send(
          ResponseBody()
            .status(HttpStatus.UNAUTHORIZED)
            .message({
              error: this.i18n.translate("auth.status.unauthorized"),
            })
            .build(),
        );
      }
    }

    if (user) {
      req.user = user;
    }
    next();
  }
}
