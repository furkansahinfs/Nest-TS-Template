import { Body, Controller, Post, Req } from "@nestjs/common";
import { AuthService } from "../services/auth.service.js";
import { LoginDTO, RegisterDTO, RefreshTokenDTO } from "src/dto";
import { Request } from "express";
import { GrantyTypes } from "src/enums";
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/login")
  async login(
    @Body() dto: LoginDTO | RefreshTokenDTO,
    @Req() request: Request,
  ) {
    if (dto.granty_type === GrantyTypes.PASSWORD) {
      return await this.authService.login(dto as LoginDTO);
    } else {
      return await this.authService.refreshToken(
        dto as RefreshTokenDTO,
        request,
      );
    }
  }
  @Post("/register")
  async register(@Body() dto: RegisterDTO) {
    return await this.authService.register(dto);
  }
}
