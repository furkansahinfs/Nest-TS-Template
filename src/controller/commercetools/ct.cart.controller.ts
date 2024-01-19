import { Cart, CartPagedQueryResponse } from "@commercetools/platform-sdk";
import { Body, Controller, Post, UseGuards, Query, Get } from "@nestjs/common";
import { CreateCartDTO, GetCartFilterDTO, UpdateCartDTO } from "src/dto";
import { ROLES } from "src/enums";
import { RolesGuard } from "src/middleware";
import { CTCartService } from "src/services";
import { IResponse } from "src/types";
import { Roles } from "src/util";

@Controller("carts")
export class CTCartController {
  constructor(private readonly ctCartService: CTCartService) {}

  @Get()
  @Roles(ROLES.ADMIN, ROLES.CT_ADMIN)
  @UseGuards(RolesGuard)
  async getCarts(
    @Query() dto: GetCartFilterDTO,
  ): Promise<IResponse<CartPagedQueryResponse>> {
    return await this.ctCartService.getCarts({ cartId: dto.cartId });
  }

  @Get("/me")
  @UseGuards(RolesGuard)
  async getMyActiveCart(): Promise<IResponse<Cart>> {
    return await this.ctCartService.getCustomerActiveCart();
  }

  @Post()
  async createCart(@Body() dto: CreateCartDTO): Promise<IResponse<Cart>> {
    return await this.ctCartService.createCart(dto);
  }

  @Post("/action")
  async updateCart(@Body() dto: UpdateCartDTO): Promise<IResponse<Cart>> {
    return await this.ctCartService.updateCart(dto);
  }
}
