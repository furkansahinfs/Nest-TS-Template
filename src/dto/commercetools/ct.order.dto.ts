import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
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
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  orderNumber?: string;
}

export class CreateOrderDTO {
  @IsNotEmpty()
  @IsString()
  cartId: string;
}
