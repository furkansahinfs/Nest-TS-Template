import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { GetUsersFilterDTO } from "src/dto";
import { UserService } from "src/services";
import { RolesGuard } from "src/middleware";
import { Roles } from "src/util";
import { ROLES } from "src/enums";

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/users")
  @Roles(ROLES.ADMIN)
  @UseGuards(RolesGuard)
  async getUsers(@Query() filter: GetUsersFilterDTO) {
    return await this.userService.getUsers(filter);
  }
}
