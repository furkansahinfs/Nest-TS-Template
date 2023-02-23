import { Optional } from "@nestjs/common";
import { IsNotEmpty, IsNumberString } from "class-validator";

export class GetProductsFilterDTO {
  @IsNotEmpty()
  @IsNumberString()
  limit: string;

  @IsNotEmpty()
  @IsNumberString()
  offset: string;

  @Optional()
  productId?: string;
}
