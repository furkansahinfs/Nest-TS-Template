import { Controller, Get, Query, Req, Res } from "@nestjs/common";
import { GetCustomerDTO } from "src/dto";
import { Request, Response } from "express";
import { CTCustomerService } from "src/services";

@Controller()
export class CTCustomerController {
  constructor(private readonly ctCustomerService: CTCustomerService) {}

  @Get("/ct/customers")
  async login(
    @Query() dto: GetCustomerDTO,
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    res["promise"](await this.ctCustomerService.getCustomer(dto));
  }
}
