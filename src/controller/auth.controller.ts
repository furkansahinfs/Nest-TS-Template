import { Body, Controller, Post, Req } from "@nestjs/common";
import { AuthService } from "../services/auth.service.js";
import { LoginDTO, RegisterDTO, RefreshTokenDTO } from "src/dto";
import { Request } from "express";
import { GrantyTypes } from "src/enums";
import { SignInResults, Tokens } from "src/types/tokens.js";
import { IResponse } from "src/types/response.js";
import { User } from "@prisma/client";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/login")
  async login(
    @Body() dto: LoginDTO | RefreshTokenDTO,
    @Req() request: Request,
  ): Promise<IResponse<SignInResults | Tokens>> {
    if (dto.granty_type === GrantyTypes.PASSWORD) {
      return this.authService.login(dto as LoginDTO);
    } else {
      return this.authService.refreshToken(dto as RefreshTokenDTO, request);
    }
  }
  @Post("/register")
  async register(@Body() dto: RegisterDTO): Promise<IResponse<User>> {
    return (await this.authService.register(dto)) as IResponse<User>;
  }
}
