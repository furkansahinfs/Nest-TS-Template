import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { GetOrdersFilterDTO } from "src/dto";
import { CTOrderService } from "src/services";
import { Roles } from "src/util";
import { ROLES } from "src/enums/roles.enum";
import { RolesGuard } from "src/middleware";

@Controller()
export class CTOrderController {
  constructor(protected readonly ctOrderService: CTOrderService) {}

  @Get("/ct/orders")
  @Roles(ROLES.ADMIN, ROLES.CT_ADMIN)
  @UseGuards(RolesGuard)
  async getOrders(@Query() dto: GetOrdersFilterDTO) {
    return await this.ctOrderService.getOrders(dto);
  }

  @Get("/ct/orders/me")
  async getMyOrders(@Query() dto: GetOrdersFilterDTO) {
    return await this.ctOrderService.getMyOrders(dto);
  }
}
