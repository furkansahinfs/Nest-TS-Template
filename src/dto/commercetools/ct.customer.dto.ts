import { IsNotEmpty } from "class-validator";

export class GetCustomerDTO {
  @IsNotEmpty()
  customerId: string;
}
