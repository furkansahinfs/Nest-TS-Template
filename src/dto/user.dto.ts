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

export interface User {
  id: string;
  password?: string;
  email?: string;
  last_logged_in?: Date;
  role?: string;
  ct_customer_id?: string;
}
