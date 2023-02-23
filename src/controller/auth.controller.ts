import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { AuthService } from "../services/auth.service.js";
import { LoginDTO, RegisterDTO, RefreshTokenDTO } from "src/dto";
import { Request, Response } from "express";
import { GrantyTypes } from "src/enums";
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/auth/login")
  async login(
    @Body() dto: LoginDTO | RefreshTokenDTO,
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (dto.granty_type === GrantyTypes.PASSWORD) {
      res["promise"](await this.authService.login(dto as LoginDTO));
    } else {
      res["promise"](
        await this.authService.refreshToken(dto as RefreshTokenDTO, request),
      );
    }
  }
  @Post("/auth/register")
  async register(
    @Body() dto: RegisterDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    res["promise"](await this.authService.register(dto));
  }
}
