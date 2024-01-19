import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { GetUsersFilterDTO } from "src/dto";
import { UserService } from "src/services";
import { RolesGuard } from "src/middleware";
import { Roles } from "src/util";
import { ROLES } from "src/enums";
import { IResponse, User } from "src/types";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(ROLES.ADMIN)
  @UseGuards(RolesGuard)
  async getUsers(
    @Query() filter: GetUsersFilterDTO,
  ): Promise<IResponse<User | User[]>> {
    return await this.userService.getUsers(filter);
  }

  @Get("/me")
  async getMe(): Promise<IResponse<User>> {
    return await this.userService.getMe();
  }
}
