import { Cart, CartPagedQueryResponse } from "@commercetools/platform-sdk";
import { Body, Controller, Post, UseGuards, Query, Get } from "@nestjs/common";
import { CreateCartDTO, GetCartFilterDTO, UpdateCartDTO } from "src/dto";
import { ROLES } from "src/enums";
import { RolesGuard } from "src/middleware";
import { CartService } from "src/services";
import { IResponse } from "src/types";
import { Roles } from "src/util";

@Controller("carts")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @Roles(ROLES.ADMIN, ROLES.CT_ADMIN)
  @UseGuards(RolesGuard)
  async getCarts(
    @Query() dto: GetCartFilterDTO,
  ): Promise<IResponse<CartPagedQueryResponse>> {
    return this.cartService.getCarts({ cartId: dto.cartId });
  }

  @Get("/me")
  async getMyActiveCart(): Promise<IResponse<Cart>> {
    return this.cartService.getCustomerActiveCart();
  }

  @Post()
  async createCart(@Body() dto: CreateCartDTO): Promise<IResponse<Cart>> {
    return this.cartService.createCart(dto);
  }

  @Post("/action")
  async updateCart(@Body() dto: UpdateCartDTO): Promise<IResponse<Cart>> {
    return this.cartService.updateCart(dto);
  }
}
