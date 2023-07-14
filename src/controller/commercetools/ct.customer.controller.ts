import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { GetCustomersFilterDTO, UpdateCustomerDTO } from "src/dto";
import { ROLES } from "src/enums";
import { RolesGuard } from "src/middleware";
import { CTCustomerService } from "src/services";
import { Roles } from "src/util";

@Controller()
export class CTCustomerController {
  constructor(private readonly ctCustomerService: CTCustomerService) {}

  @Get("/ct/customers")
  @Roles(ROLES.ADMIN, ROLES.CT_ADMIN)
  @UseGuards(RolesGuard)
  async getCustomers(@Query() dto: GetCustomersFilterDTO) {
    return await this.ctCustomerService.getCustomers(dto);
  }

  @Get("/ct/customers/me")
  async getMe() {
    return await this.ctCustomerService.getMe();
  }

  @Post("/ct/customers/action")
  async updateCart(@Body() dto: UpdateCustomerDTO) {
    return await this.ctCustomerService.updateCustomer(dto);
  }
}
