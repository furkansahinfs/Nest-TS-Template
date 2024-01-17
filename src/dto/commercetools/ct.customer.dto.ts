import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";
import { CustomerActions } from "src/enums/customerAction.enum";

export class CreateCustomerDTO {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
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
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  customerNumber?: string;
}
export class UpdateCustomerDTO {
  @IsNotEmpty()
  @IsEnum(CustomerActions)
  @IsString()
  actionType: string;

  @IsNotEmpty()
  address: any;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  customerNumber?: string;
}
