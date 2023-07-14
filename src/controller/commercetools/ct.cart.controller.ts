import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { CreateCartDTO, GetCartsFilterDTO, UpdateCartDTO } from "src/dto";
import { CTCartService } from "src/services";

@Controller()
export class CTCartController {
  constructor(private readonly ctCartService: CTCartService) {}

  @Get("/ct/carts")
  async getCarts(@Query() dto: GetCartsFilterDTO) {
    return await this.ctCartService.getCarts(dto);
  }

  @Post("/ct/carts")
  async createCart(@Body() dto: CreateCartDTO) {
    return await this.ctCartService.createCart(dto);
  }

  @Post("/ct/carts/action")
  async updateCart(@Body() dto: UpdateCartDTO) {
    return await this.ctCartService.updateCart(dto);
  }
}
