import { IsNotEmpty, IsNumberString, IsOptional } from "class-validator";

export class GetUsersFilterDTO {
  @IsNotEmpty()
  @IsNumberString()
  limit: string;

  @IsNotEmpty()
  @IsNumberString()
  offset: string;

  @IsOptional()
  userId?: string;

  @IsOptional()
  username?: string;
}
