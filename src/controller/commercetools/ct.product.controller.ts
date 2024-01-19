import { Product } from "@commercetools/platform-sdk";
import { Controller, Get, Query } from "@nestjs/common";
import { GetProductsFilterDTO } from "src/dto";
import { CTProductService } from "src/services";
import { IResponse, QueryData } from "src/types";

@Controller("products")
export class CTProductController {
  constructor(private readonly ctProductService: CTProductService) {}

  @Get()
  async getProducts(
    @Query() dto: GetProductsFilterDTO,
  ): Promise<IResponse<QueryData<Product>>> {
    return await this.ctProductService.getProducts(dto);
  }
}
