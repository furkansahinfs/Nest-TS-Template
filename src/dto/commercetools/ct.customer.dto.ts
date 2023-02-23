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

  @Optional()
  customerNumber?: string;
}

export class CreateCustomerDTO {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;

  @Optional()
  customerNumber: string;
}
