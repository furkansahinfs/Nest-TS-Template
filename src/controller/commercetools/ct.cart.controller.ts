import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import { CreateCartDTO, GetCartsFilterDTO, UpdateCartDTO } from "src/dto";
import { Request, Response } from "express";
import { CTCartService } from "src/services";

@Controller()
export class CTCartController {
  constructor(private readonly ctCartService: CTCartService) {}

  @Get("/ct/carts")
  async getCarts(
    @Query() dto: GetCartsFilterDTO,
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    res["promise"](await this.ctCartService.getCarts(dto));
  }

  @Post("/ct/carts")
  async createCart(
    @Body() dto: CreateCartDTO,
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    res["promise"](await this.ctCartService.createCart(dto));
  }

  @Patch("/ct/carts")
  async updateCart(
    @Body() dto: UpdateCartDTO,
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    res["promise"](await this.ctCartService.updateCartLineItems(dto));
  }
}
