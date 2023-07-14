import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  ValidateIf,
} from "class-validator";

export class GetOrdersFilterDTO {
  @ValidateIf((o) => !o.orderId)
  @IsNotEmpty()
  @IsNumberString()
  limit: string;

  @ValidateIf((o) => !o.orderId)
  @IsNotEmpty()
  @IsNumberString()
  offset: string;

  @IsOptional()
  orderId?: string;

  @IsOptional()
  orderNumber?: string;
}
