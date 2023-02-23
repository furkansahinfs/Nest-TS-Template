import { Optional } from "@nestjs/common";
import { IsNotEmpty, IsNumberString } from "class-validator";

export class GetCustomersFilterDTO {
  @IsNotEmpty()
  @IsNumberString()
  limit: string;

  @IsNotEmpty()
  @IsNumberString()
  offset: string;

  @Optional()
  customerId?: string;
}
