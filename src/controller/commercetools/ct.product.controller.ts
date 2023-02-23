import { Controller, Get, Query, Req, Res } from "@nestjs/common";
import { GetProductDTO } from "src/dto";
import { Request, Response } from "express";
import { CTProductService } from "src/services";

@Controller()
export class CTProductController {
  constructor(private readonly ctProductService: CTProductService) {}

  @Get("/ct/products")
  async login(
    @Query() dto: GetProductDTO,
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    res["promise"](await this.ctProductService.getProduct(dto));
  }
}
