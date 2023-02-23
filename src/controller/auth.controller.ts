import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { AuthService } from "../services/auth.service.js";
import { RegisterDTO, TokenDTO } from "src/dto";
import { Request, Response } from "express";
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/auth/login")
  async authenticate(
    @Body() dto: TokenDTO,
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto, request, res);
    return result;
  }

  @Post("/auth/register")
  async register(
    @Body() dto: RegisterDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto, res);
    return result;
  }
}
