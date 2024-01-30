import { Product } from "@commercetools/platform-sdk";
import { Controller, Get, Query } from "@nestjs/common";
import { GetProductsFilterDTO } from "src/dto";
import { ProductService } from "src/services";
import { IResponse, QueryData } from "src/types";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getProducts(
    @Query() dto: GetProductsFilterDTO,
  ): Promise<IResponse<QueryData<Product>>> {
    return this.productService.getProducts(dto);
  }
}
