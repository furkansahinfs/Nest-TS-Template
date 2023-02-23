import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import { AuthService } from "../services/auth.service.js";
import { RegisterDTO, TokenDTO } from "src/dto";
import { Response } from "express";
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/auth/login")
  async authenticate(
    @Body() dto: TokenDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log(dto);
    const result = await this.authService.authenticate(dto, res);
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
