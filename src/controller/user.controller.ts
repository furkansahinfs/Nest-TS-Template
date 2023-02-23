import { Controller, Get, Query, Res } from "@nestjs/common";
import { GetUsersFilterDTO } from "src/dto";
import { Response } from "express";
import { UserService } from "src/services";

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/users")
  async users(
    @Query() filter: GetUsersFilterDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    res["promise"](await this.userService.getUsers(filter));
  }
}
