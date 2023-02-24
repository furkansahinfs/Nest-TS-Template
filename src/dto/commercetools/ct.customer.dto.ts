import { IsNotEmpty, IsNumberString, IsOptional } from "class-validator";

export class GetCustomersFilterDTO {
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsNumberString()
  offset?: string;

  @IsOptional()
  customerId?: string;

  @IsOptional()
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

  @IsOptional()
  customerNumber?: string;
}
