import { HttpStatus, Injectable } from "@nestjs/common";
import { LoginDTO, RefreshTokenDTO, RegisterDTO } from "src/dto";
import { Request } from "express";
import { I18nService } from "nestjs-i18n";
import { GrantyTypes } from "src/enums";
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
import { UserRepository } from "src/repository/user.repository";
import { User } from "src/dto/user.dto";
import { conf } from "src/config";
import { CTCustomerService } from "./commercetools";

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private ctCustomerService: CTCustomerService,
    private readonly i18n: I18nService,
  ) {}

  async login(dto: LoginDTO) {
    const granty_type = dto.granty_type;

    if (granty_type === GrantyTypes.PASSWORD) {
      const email = dto.email;
      const password = dto.password;
      const user = await this.userRepository.findByUsername(email);

      if (user) {
        return await this.authenticateUserByPassword(email, password);
      } else {
        return ResponseBody()
          .status(HttpStatus.BAD_REQUEST)
          .message({ error: this.i18n.translate("auth.user_not_found") })
          .build();
      }
    }

    return ResponseBody()
      .status(HttpStatus.BAD_REQUEST)
      .message({ error: this.i18n.translate("auth.invalid_granty_type") })
      .build();
  }

  async refreshToken(dto: RefreshTokenDTO, request: Request) {
    const granty_type = dto.granty_type;
    if (granty_type === GrantyTypes.REFRESH) {
      return this.authenticateUserByRefreshToken(request);
    }

    return ResponseBody()
      .status(HttpStatus.BAD_REQUEST)
      .message({ error: this.i18n.translate("auth.invalid_granty_type") })
      .build();
  }

  async register(dto: RegisterDTO) {
    const maybeUser = await this.userRepository.findByUsername(dto.email);

    if (maybeUser) {
      return ResponseBody()
        .status(HttpStatus.CONFLICT)
        .message({ error: this.i18n.translate("auth.user_already_exists") })
        .build();
    }

    try {
      const user = await this.createUser(dto);
      await this.createCommercetoolsCustomer(dto, user.id);

      return user;
    } catch (e) {
      await this.userRepository.deleteUser(dto.email);
      return ResponseBody()
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .message({ error: e?.message ?? e })
        .build();
    }
  }

  private async createUser(dto: RegisterDTO): Promise<User> {
    const encryptedPassword: string = await encryptPassword(dto.password);

    if (encryptedPassword === "ERROR") {
      return ResponseBody()
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .message({ error: this.i18n.translate("auth.status.unhandled") })
        .build();
    }

    return await this.userRepository.saveUser(dto, encryptedPassword);
  }

  private async createCommercetoolsCustomer(dto: RegisterDTO, userId: string) {
    const ctCustomer = await this.ctCustomerService.createCustomer({
      ...dto,
      customerNumber: userId,
    });

    if (ctCustomer?.message) {
      throw new Error(ctCustomer.message?.error);
    }

    await this.userRepository
      .updateUser(userId, {
        ct_customer_id: ctCustomer?.data?.customer?.id,
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  private async authenticateUserByPassword(email: string, password: string) {
    const maybeUser = await this.userRepository.findByUsername(email, {
      password: true,
    });
    if (!maybeUser) {
      return ResponseBody()
        .status(HttpStatus.NOT_FOUND)
        .message({ error: this.i18n.translate("auth.user_not_found") })
        .build();
    }

    if (await comparePassword(password, maybeUser.password)) {
      await this.userRepository.updateUser(maybeUser?.id, {
        last_logged_in: new Date(Date.now()),
      });

      return ResponseBody()
        .status(HttpStatus.OK)
        .data({
          access_token: generateToken(
            { username: email, userId: maybeUser.id },
            "ACCESS_TOKEN_PRIVATE_KEY",
            { expiresIn: conf.ACCESS_TOKEN_TIME },
          ),
          refresh_token: generateToken(
            { username: email, userId: maybeUser.id },
            "REFRESH_TOKEN_PRIVATE_KEY",
            { expiresIn: conf.REFRESH_TOKEN_TIME },
          ),
          role: maybeUser.role,
        })
        .build();
    }

    return ResponseBody()
      .status(HttpStatus.UNAUTHORIZED)
      .message({ error: this.i18n.translate("auth.login_failed") })
      .build();
  }

  private async authenticateUserByRefreshToken(request: Request) {
    const refreshToken = get(request, "headers.refresh-token");
    const newTokens: false | { access_token: string; refresh_token: string } =
      await this.refreshAllTokens({ refreshToken: refreshToken as string });

    if (newTokens === false) {
      return ResponseBody()
        .status(HttpStatus.NOT_FOUND)
        .message({ error: this.i18n.translate("auth.user_not_found") })
        .build();
    }

    return ResponseBody().status(HttpStatus.OK).data(newTokens).build();
  }

  private async refreshAllTokens({ refreshToken }: { refreshToken: string }) {
    try {
      const { decoded } = verifyToken(refreshToken, "REFRESH_TOKEN_PUBLIC_KEY");
      if (!decoded) {
        return false;
      }
      const username = await getJWTUsername(
        refreshToken,
        "REFRESH_TOKEN_PUBLIC_KEY",
      );
      const userId = await getJWTUserId(
        refreshToken,
        "REFRESH_TOKEN_PUBLIC_KEY",
      );
      if (!username || !userId) {
        return false;
      }
      const newAccessToken = generateToken(
        { username, userId: userId },
        "ACCESS_TOKEN_PRIVATE_KEY",
        { expiresIn: conf.ACCESS_TOKEN_TIME },
      );
      const newRefreshToken = generateToken(
        { username, userId: userId },
        "REFRESH_TOKEN_PRIVATE_KEY",
        { expiresIn: conf.REFRESH_TOKEN_TIME },
      );
      return { access_token: newAccessToken, refresh_token: newRefreshToken };
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
