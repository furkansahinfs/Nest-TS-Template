import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { CreateOrderDTO, GetOrdersFilterDTO } from "src/dto";
import { CTOrderService } from "src/services";
import { Roles } from "src/util";
import { ROLES } from "src/enums/roles.enum";
import { RolesGuard } from "src/middleware";
import { IResponse, QueryData } from "src/types";
import { Order } from "@commercetools/platform-sdk";

@Controller("orders")
export class CTOrderController {
  constructor(protected readonly ctOrderService: CTOrderService) {}

  @Get()
  @Roles(ROLES.ADMIN, ROLES.CT_ADMIN)
  @UseGuards(RolesGuard)
  async getOrders(
    @Query() dto: GetOrdersFilterDTO,
  ): Promise<IResponse<QueryData<Order>>> {
    return await this.ctOrderService.getOrders(dto);
  }

  @Get("/me")
  async getMyOrders(
    @Query() dto: GetOrdersFilterDTO,
  ): Promise<IResponse<QueryData<Order>>> {
    return await this.ctOrderService.getMyOrders(dto);
  }

  @Post()
  async createOrder(@Body() dto: CreateOrderDTO): Promise<IResponse<Order>> {
    return await this.ctOrderService.createOrder(dto);
  }
}
