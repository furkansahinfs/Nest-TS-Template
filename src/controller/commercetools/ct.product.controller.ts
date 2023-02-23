import { Controller, Get, Query, Req, Res } from "@nestjs/common";
import { GetProductsFilterDTO } from "src/dto";
import { Request, Response } from "express";
import { CTProductService } from "src/services";

@Controller()
export class CTProductController {
  constructor(private readonly ctProductService: CTProductService) {}

  @Get("/ct/products")
  async getProducts(
    @Query() dto: GetProductsFilterDTO,
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    res["promise"](await this.ctProductService.getProducts(dto));
  }
}
