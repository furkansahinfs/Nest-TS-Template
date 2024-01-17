import { Controller, Get, Query } from "@nestjs/common";
import { GetProductsFilterDTO } from "src/dto";
import { CTProductService } from "src/services";

@Controller("products")
export class CTProductController {
  constructor(private readonly ctProductService: CTProductService) {}

  @Get()
  async getProducts(@Query() dto: GetProductsFilterDTO) {
    return await this.ctProductService.getProducts(dto);
  }
}
