import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
} from "class-validator";
import { CustomerActions } from "src/enums";

export class CreateCustomerDTO {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  customerNumber?: string;
}

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

export class UpdateCustomerDTO {
  @IsNotEmpty()
  @IsEnum(CustomerActions)
  actionType: string;

  @IsNotEmpty()
  actionData: any;

  @IsOptional()
  customerId?: string;

  @IsOptional()
  customerNumber?: string;
}
