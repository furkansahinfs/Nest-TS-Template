import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  CreateCustomerDTO,
  GetCustomersFilterDTO,
  UpdateCustomerDTO,
} from "src/dto";
import { ROLES } from "src/enums";
import { RolesGuard } from "src/middleware";
import { CTCustomerService } from "src/services";
import { Roles } from "src/util";

@Controller("customers")
export class CTCustomerController {
  constructor(private readonly ctCustomerService: CTCustomerService) {}

  @Get()
  @Roles(ROLES.ADMIN, ROLES.CT_ADMIN)
  @UseGuards(RolesGuard)
  async getCustomers(@Query() dto: GetCustomersFilterDTO) {
    return await this.ctCustomerService.getCustomers(dto);
  }

  @Get("/me")
  async getMe() {
    return await this.ctCustomerService.getMe();
  }

  @Post("/new")
  async create(@Body() dto: CreateCustomerDTO) {
    return await this.ctCustomerService.createCustomer(dto);
  }

  @Patch()
  async updateCart(@Body() dto: UpdateCustomerDTO) {
    return await this.ctCustomerService.updateCustomer(dto);
  }
}
