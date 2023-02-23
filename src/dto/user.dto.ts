import { Optional } from "@nestjs/common";
import { IsNotEmpty, IsNumberString } from "class-validator";

export class GetUsersFilterDTO {
  @IsNotEmpty()
  @IsNumberString()
  limit: string;

  @IsNotEmpty()
  @IsNumberString()
  offset: string;

  @Optional()
  userId?: string;

  @Optional()
  username?: string;
}
