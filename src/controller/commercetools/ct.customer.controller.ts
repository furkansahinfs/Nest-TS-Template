import { Customer, CustomerSignInResult } from "@commercetools/platform-sdk";
import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import {
  CreateCustomerDTO,
  GetCustomersFilterDTO,
  UpdateCustomerDTO,
} from "src/dto";
import { ROLES } from "src/enums";
import { RolesGuard } from "src/middleware";
import { CTCustomerService } from "src/services";
import { IResponse, QueryData } from "src/types";
import { Roles } from "src/util";

@Controller("customers")
export class CTCustomerController {
  constructor(private readonly ctCustomerService: CTCustomerService) {}

  @Get()
  @Roles(ROLES.ADMIN, ROLES.CT_ADMIN)
  @UseGuards(RolesGuard)
  async getCustomers(
    @Query() dto: GetCustomersFilterDTO,
  ): Promise<IResponse<QueryData<Customer>>> {
    return this.ctCustomerService.getCustomers(dto);
  }

  @Get("/me")
  async getMe(): Promise<IResponse<Customer>> {
    return this.ctCustomerService.getMe();
  }

  @Post("/new")
  async create(
    @Body() dto: CreateCustomerDTO,
  ): Promise<IResponse<CustomerSignInResult>> {
    return this.ctCustomerService.createCustomer(dto);
  }

  @Post("/action")
  async updateCart(
    @Body() dto: UpdateCustomerDTO,
  ): Promise<IResponse<Customer>> {
    return this.ctCustomerService.updateCustomer(dto);
  }
}
