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
} from "src/util";
import { conf } from "src/config";
import { IResponse, SignInResults, Tokens, User } from "src/types";
import { UserRepository } from "src/repository";
import { getJWTUser } from "src/util/jwt.util";
import { CTCustomerService } from "./commercetools";

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private readonly i18n: I18nService,
    private ctCustomerService: CTCustomerService,
  ) {}

  async login(dto: LoginDTO): Promise<IResponse<SignInResults>> {
    const granty_type = dto.granty_type;

    if (granty_type === GrantyTypes.PASSWORD) {
      const email = dto.email;
      const password = dto.password;
      const user: User | undefined = await this.userRepository.findByUsername(
        email,
      );

      if (user) {
        return this.authenticateUserByPassword(email, password);
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

  async refreshToken(
    dto: RefreshTokenDTO,
    request: Request,
  ): Promise<IResponse<Tokens>> {
    const granty_type = dto.granty_type;
    if (granty_type === GrantyTypes.REFRESH) {
      return this.authenticateUserByRefreshToken(request);
    }

    return ResponseBody()
      .status(HttpStatus.BAD_REQUEST)
      .message({ error: this.i18n.translate("auth.invalid_granty_type") })
      .build();
  }

  async register(dto: RegisterDTO): Promise<IResponse<User>> {
    const maybeUser: User | undefined =
      await this.userRepository.findByUsername(dto.email);

    if (maybeUser) {
      return ResponseBody()
        .status(HttpStatus.CONFLICT)
        .message({ error: this.i18n.translate("auth.user_already_exists") })
        .build();
    }

    try {
      const user: User = await this.createUser(dto);
      await this.createCommercetoolsCustomer(dto, user.id);
      const updatedUser: User = await this.userRepository.findByUsername(
        user.email,
      );

      return ResponseBody()
        .status(HttpStatus.CREATED)
        .data(updatedUser)
        .build();
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

    return this.userRepository.saveUser(dto, encryptedPassword);
  }

  private async createCommercetoolsCustomer(
    dto: RegisterDTO,
    userId: string,
  ): Promise<void> {
    const ctCustomer = await this.ctCustomerService.createCustomer({
      ...dto,
      customerNumber: userId,
    });

    if (ctCustomer?.message) {
      throw new Error(ctCustomer.message?.error);
    }

    await this.userRepository.updateUser(userId, {
      ct_customer_id: ctCustomer?.data?.customer?.id,
    });
  }

  private async authenticateUserByPassword(
    email: string,
    password: string,
  ): Promise<IResponse<SignInResults>> {
    const maybeUser: User | undefined =
      await this.userRepository.findByUsername(email, {
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
            { username: email, userId: maybeUser.id, role: maybeUser.role },
            "ACCESS_TOKEN_PRIVATE_KEY",
            { expiresIn: conf.ACCESS_TOKEN_TIME },
          ),
          refresh_token: generateToken(
            { username: email, userId: maybeUser.id, role: maybeUser.role },
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

  private async authenticateUserByRefreshToken(
    request: Request,
  ): Promise<IResponse<Tokens>> {
    const refreshToken = get(request, "headers.refresh_token");
    const newTokens: false | Tokens = await this.refreshAllTokens({
      refreshToken: refreshToken as string,
    });

    if (newTokens === false) {
      return ResponseBody()
        .status(HttpStatus.NOT_FOUND)
        .message({ error: this.i18n.translate("auth.user_not_found") })
        .build();
    }

    return ResponseBody().status(HttpStatus.OK).data(newTokens).build();
  }

  private async refreshAllTokens({
    refreshToken,
  }: {
    refreshToken: string;
  }): Promise<false | Tokens> {
    try {
      const { decoded } = verifyToken(refreshToken, "REFRESH_TOKEN_PUBLIC_KEY");

      if (!decoded) {
        return false;
      }

      const user = getJWTUser(refreshToken, "REFRESH_TOKEN_PUBLIC_KEY");

      if (!user["username"] || !user["userId"]) {
        return false;
      }

      const newAccessToken: string = generateToken(
        {
          username: user["username"],
          userId: user["userId"],
          role: user["role"],
        },
        "ACCESS_TOKEN_PRIVATE_KEY",
        { expiresIn: conf.ACCESS_TOKEN_TIME },
      );

      const newRefreshToken: string = generateToken(
        {
          username: user["username"],
          userId: user["userId"],
          role: user["role"],
        },
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
